const express = require("express");
const { User, CartItem } = require("../models");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Đăng ký", error: null });
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    await User.create({ fullName, email, password, role: "customer" });
    return res.redirect("/login");
  } catch (error) {
    return res.render("auth/register", {
      title: "Đăng ký",
      error: "Email đã tồn tại hoặc dữ liệu không hợp lệ.",
    });
  }
});

router.get("/login", (req, res) => {
  const returnTo = req.query.returnTo || "/shop/products";
  res.render("auth/login", { title: "Đăng nhập", error: null, returnTo });
});

router.post("/login", async (req, res) => {
  const { email, password, returnTo } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return res.render("auth/login", {
      title: "Đăng nhập",
      error: "Thông tin đăng nhập không đúng.",
      returnTo: returnTo || "/shop/products"
    });
  }

  req.session.userId = user.id;
  
  if (user.role === "customer") {
    await CartItem.update(
      { UserId: user.id, sessionId: null },
      { where: { sessionId: req.sessionID } }
    );
  }

  if (user.role === "admin") return res.redirect("/admin/dashboard");
  return res.redirect(returnTo || "/shop/products");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
