const express = require("express");
const Stripe = require("stripe");
const { requireAuth } = require("../middleware/auth");
const { Product, CartItem, Order, OrderItem } = require("../models");

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

router.get("/products", async (req, res) => {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  res.render("shop/products", { title: "Cua hang quan ao", products });
});

router.post("/cart/add/:productId", requireAuth, async (req, res) => {
  const product = await Product.findByPk(req.params.productId);
  if (!product) return res.redirect("/shop/products");

  const existing = await CartItem.findOne({
    where: { UserId: req.currentUser.id, ProductId: product.id },
  });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
  } else {
    await CartItem.create({
      UserId: req.currentUser.id,
      ProductId: product.id,
      quantity: 1,
    });
  }
  res.redirect("/shop/cart");
});

router.get("/cart", requireAuth, async (req, res) => {
  const items = await CartItem.findAll({
    where: { UserId: req.currentUser.id },
    include: [Product],
  });
  const total = items.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
  res.render("shop/cart", { title: "Gio hang", items, total });
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
      message: "Hay cau hinh STRIPE_SECRET_KEY trong file .env de thanh toan online.",
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
    if (session.payment_status === "paid") {
      await order.update({ paymentStatus: "paid", paymentRef: session.id });
      await CartItem.destroy({ where: { UserId: req.currentUser.id } });
    }
  }

  res.render("shop/success", { title: "Thanh toan thanh cong", order });
});

module.exports = router;
