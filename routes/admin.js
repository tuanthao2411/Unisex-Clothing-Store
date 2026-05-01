const express = require("express");
const { Op, fn, col } = require("sequelize");
const { requireAdmin } = require("../middleware/auth");
const { Product, User, Order } = require("../models");

const router = express.Router();
router.use(requireAdmin);

router.get("/dashboard", async (req, res) => {
  const productCount = await Product.count();
  const customerCount = await User.count({ where: { role: "customer" } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRevenue = await Order.sum("totalAmount", {
    where: {
      paymentStatus: "paid",
      createdAt: { [Op.gte]: today },
    },
  });

  const todayOrderCount = await Order.count({
    where: {
      createdAt: { [Op.gte]: today },
    },
  });

  const recentOrders = await Order.findAll({
    order: [["createdAt", "DESC"]],
    limit: 5,
    include: [{ model: User, attributes: ["fullName"] }],
  });

  const previewProducts = await Product.findAll({
    order: [["createdAt", "DESC"]],
    limit: 6,
  });

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - diffToMonday);

  const weekOrders = await Order.findAll({
    where: { createdAt: { [Op.gte]: weekStart } },
    attributes: ["totalAmount", "paymentStatus", "createdAt"],
  });

  const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const revenueSeries = [0, 0, 0, 0, 0, 0, 0];
  const orderSeries = [0, 0, 0, 0, 0, 0, 0];

  weekOrders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const weekday = orderDate.getDay();
    const index = weekday === 0 ? 6 : weekday - 1;
    orderSeries[index] += 1;
    if (order.paymentStatus === "paid") {
      revenueSeries[index] += Number(order.totalAmount || 0);
    }
  });

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    productCount,
    customerCount,
    todayRevenue: todayRevenue || 0,
    todayOrderCount,
    recentOrders,
    previewProducts,
    weekdayLabels,
    revenueSeries,
    orderSeries,
  });
});

router.get("/products", async (req, res) => {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/products", { title: "Quan ly san pham", products });
});

router.get("/products/new", (req, res) => {
  res.render("admin/product-form", {
    title: "Them san pham",
    product: null,
    action: "/admin/products",
    method: "POST",
  });
});

router.post("/products", async (req, res) => {
  await Product.create(req.body);
  res.redirect("/admin/products");
});

router.get("/products/:id/edit", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.redirect("/admin/products");
  res.render("admin/product-form", {
    title: "Sua san pham",
    product,
    action: `/admin/products/${product.id}?_method=PUT`,
    method: "PUT",
  });
});

router.put("/products/:id", async (req, res) => {
  await Product.update(req.body, { where: { id: req.params.id } });
  res.redirect("/admin/products");
});

router.delete("/products/:id", async (req, res) => {
  await Product.destroy({ where: { id: req.params.id } });
  res.redirect("/admin/products");
});

router.get("/customers", async (req, res) => {
  const customers = await User.findAll({
    where: { role: "customer" },
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/customers", { title: "Quan ly khach hang", customers });
});

router.get("/revenue", async (req, res) => {
  const rows = await Order.findAll({
    attributes: [
      [fn("date", col("createdAt")), "date"],
      [fn("sum", col("totalAmount")), "totalRevenue"],
    ],
    where: { paymentStatus: "paid" },
    group: [fn("date", col("createdAt"))],
    order: [[fn("date", col("createdAt")), "DESC"]],
  });

  res.render("admin/revenue", { title: "Doanh thu theo ngay", rows });
});

module.exports = router;
