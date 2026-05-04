const express = require("express");
const Stripe = require("stripe");
const { Op, literal } = require("sequelize");
const { requireAuth } = require("../middleware/auth");
const { Product, CartItem, Order, OrderItem } = require("../models");

function parseColorOptions(product) {
  if (!product?.colorOptions) return [];
  try {
    const parsed = JSON.parse(product.colorOptions);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapProducts(rawProducts) {
  return rawProducts.map((p) => {
    const plain = p.toJSON();
    const sizes = plain.sizesAvailable
      ? plain.sizesAvailable.split(",").map((s) => s.trim()).filter(Boolean)
      : ["S", "M", "L", "XL"];
    return {
      ...plain,
      sizeOptions: sizes.length ? sizes : ["S", "M", "L", "XL"],
      colorOptionsParsed: parseColorOptions(plain),
    };
  });
}

function buildVariantNote(item) {
  const bits = [];
  if (item.selectedSize) bits.push(`Size ${item.selectedSize}`);
  if (item.selectedColor) bits.push(item.selectedColor);
  return bits.join(" / ");
}

// Helper: giảm tồn kho sau khi thanh toán thành công
async function decreaseStock(orderItems) {
  for (const item of orderItems) {
    await Product.update(
      { stock: literal(`stock - ${item.quantity}`) },
      { where: { id: item.ProductId, stock: { [Op.gte]: item.quantity } } }
    );
  }
}

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ===== CẤU HÌNH NGÂN HÀNG NHẬN TIỀN (VietQR) =====
// Thay đổi thông tin tài khoản ngân hàng của bạn vào đây
const BANK_CONFIG = {
  bankId:        process.env.QR_BANK_ID        || "MB",          // Mã ngân hàng VietQR (MB, VCB, TCB, ACB...)
  accountNumber: process.env.QR_ACCOUNT_NUMBER || "1234567890",  // Số tài khoản
  accountName:   process.env.QR_ACCOUNT_NAME   || "NGUYEN VAN A", // Tên chủ tài khoản
  bankName:      process.env.QR_BANK_NAME      || "MB Bank",     // Tên ngân hàng hiển thị
};

router.get("/products", async (req, res) => {
  const raw = req.query.category;
  const category = typeof raw === "string" && raw.trim() ? raw.trim() : null;
  const where = {};
  if (category && ["Top", "Bottom", "Jacket"].includes(category)) {
    where.category = category;
  }
  const productsRaw = await Product.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
  const products = mapProducts(productsRaw);
  const fw2025 = products.filter((p) => p.collection === "fw2025");
  const ss2026 = products.filter((p) => p.collection === "ss2026");
  res.render("shop/products", {
    title: "Cửa hàng quần áo",
    products,
    category,
    fw2025,
    ss2026,
    isShopAll: false,
    sort: "latest",
  });
});

router.get("/all", async (req, res) => {
  const sort = req.query.sort === "oldest" ? "oldest" : "latest";
  const productsRaw = await Product.findAll({
    order: [["createdAt", sort === "oldest" ? "ASC" : "DESC"]],
  });
  const products = mapProducts(productsRaw);
  const fw2025 = products.filter((p) => p.collection === "fw2025");
  const ss2026 = products.filter((p) => p.collection === "ss2026");
  res.render("shop/products", {
    title: "Tất cả sản phẩm",
    products,
    category: null,
    fw2025,
    ss2026,
    isShopAll: true,
    sort,
  });
});

router.post("/cart/add/:productId", requireAuth, async (req, res) => {
  const product = await Product.findByPk(req.params.productId);
  if (!product) return res.redirect("/shop/products");
  const selectedSize = typeof req.body.size === "string" && req.body.size.trim() ? req.body.size.trim() : "M";
  const selectedColor =
    typeof req.body.color === "string" && req.body.color.trim() ? req.body.color.trim() : "";

  const existing = await CartItem.findOne({
    where: {
      UserId: req.currentUser.id,
      ProductId: product.id,
      selectedSize,
      selectedColor,
    },
  });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
  } else {
    await CartItem.create({
      UserId: req.currentUser.id,
      ProductId: product.id,
      quantity: 1,
      selectedSize,
      selectedColor,
    });
  }
  res.redirect("/shop/cart");
});

router.get("/cart", requireAuth, async (req, res) => {
  const items = await CartItem.findAll({
    where: { UserId: req.currentUser.id },
    include: [Product],
  });
  const mappedItems = items.map((item) => {
    const plain = item.toJSON();
    const variantLabel = [plain.selectedSize ? `Size ${plain.selectedSize}` : "", plain.selectedColor]
      .filter(Boolean)
      .join(" / ");
    return { ...plain, variantLabel };
  });
  const total = items.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
  res.render("shop/cart", { title: "Giỏ hàng", items: mappedItems, total });
});

router.post("/cart/remove/:id", requireAuth, async (req, res) => {
  await CartItem.destroy({ where: { id: req.params.id, UserId: req.currentUser.id } });
  res.redirect("/shop/cart");
});

router.post("/checkout", requireAuth, async (req, res) => {
  const items = await CartItem.findAll({
    where: { UserId: req.currentUser.id },
    include: [Product],
  });
  if (!items.length) return res.redirect("/shop/cart");

  if (!stripe) {
    return res.status(400).render("error", {
      title: "Missing Stripe Key",
      message: "Hãy cấu hình STRIPE_SECRET_KEY trong file .env để thanh toán online.",
    });
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
  const order = await Order.create({
    UserId: req.currentUser.id,
    totalAmount: total,
    paymentStatus: "pending",
  });

  for (const item of items) {
    await OrderItem.create({
      OrderId: order.id,
      ProductId: item.Product.id,
      productName: item.Product.name,
      price: item.Product.price,
      quantity: item.quantity,
      variantNote: buildVariantNote(item),
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "vnd",
        product_data: { name: item.Product.name },
        unit_amount: item.Product.price,
      },
      quantity: item.quantity,
    })),
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/shop/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get("host")}/shop/cart`,
  });

  res.redirect(session.url);
});

router.get("/checkout/success", requireAuth, async (req, res) => {
  const { orderId, session_id: sessionId } = req.query;
  const order = await Order.findByPk(orderId);
  if (!order) return res.redirect("/shop/products");

  if (stripe && sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" && order.paymentStatus !== "paid") {
      await order.update({ paymentStatus: "paid", paymentRef: session.id });
      // Trừ tồn kho
      const orderItems = await OrderItem.findAll({ where: { OrderId: order.id } });
      await decreaseStock(orderItems);
      await CartItem.destroy({ where: { UserId: req.currentUser.id } });
    }
  }

  res.render("shop/success", { title: "Thanh toán thành công", order });
});

// ===== QR CHECKOUT =====
router.get("/qr-checkout", requireAuth, async (req, res) => {
  const items = await CartItem.findAll({
    where: { UserId: req.currentUser.id },
    include: [Product],
  });
  if (!items.length) return res.redirect("/shop/cart");

  const total = items.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);

  // Tạo đơn hàng với trạng thái pending
  const order = await Order.create({
    UserId: req.currentUser.id,
    totalAmount: total,
    paymentStatus: "pending",
    paymentRef: `QR-${Date.now()}`,
  });

  for (const item of items) {
    await OrderItem.create({
      OrderId: order.id,
      ProductId: item.Product.id,
      productName: item.Product.name,
      price: item.Product.price,
      quantity: item.quantity,
      variantNote: buildVariantNote(item),
    });
  }

  // Nội dung chuyển khoản chứa mã đơn hàng để dễ đối soát
  const transferNote = `UNISEX DH${order.id}`;

  const orderItems = await OrderItem.findAll({ where: { OrderId: order.id } });

  res.render("shop/qr-checkout", {
    title: "Thanh toán QR Code",
    total,
    orderId: order.id,
    orderItems,
    transferNote,
    bankId:        BANK_CONFIG.bankId,
    accountNumber: BANK_CONFIG.accountNumber,
    accountName:   BANK_CONFIG.accountName,
    bankName:      BANK_CONFIG.bankName,
  });
});

// ===== XÁC NHẬN THANH TOÁN QR (do khách bấm "Đã thanh toán") =====
router.post("/qr-confirm", requireAuth, async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findByPk(orderId);

  if (!order || order.UserId !== req.currentUser.id) {
    return res.json({ success: false, message: "Không tìm thấy đơn hàng." });
  }

  // Tránh xử lý trùng lặp nếu đã paid rồi
  if (order.paymentStatus === "paid") {
    return res.json({ success: true });
  }

  // Cập nhật trạng thái đơn hàng
  await order.update({ paymentStatus: "paid" });

  // Trừ tồn kho theo từng sản phẩm trong đơn
  const orderItems = await OrderItem.findAll({ where: { OrderId: order.id } });
  await decreaseStock(orderItems);

  // Xóa giỏ hàng
  await CartItem.destroy({ where: { UserId: req.currentUser.id } });

  res.json({ success: true });
});

// ===== TRANG THÀNH CÔNG SAU QR =====
router.get("/qr-success", requireAuth, async (req, res) => {
  const { orderId } = req.query;
  const order = await Order.findByPk(orderId);
  if (!order || order.UserId !== req.currentUser.id) return res.redirect("/shop/products");
  res.render("shop/qr-success", { title: "Đặt hàng thành công", order });
});

router.get("/", (req, res) => {
    res.render("index");
});

module.exports = router;
