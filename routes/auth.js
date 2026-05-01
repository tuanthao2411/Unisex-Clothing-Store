const express = require("express");
const { User } = require("../models");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Dang ky", error: null });
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    await User.create({ fullName, email, password, role: "customer" });
    return res.redirect("/login");
  } catch (error) {
    return res.render("auth/register", {
      title: "Dang ky",
      error: "Email da ton tai hoac du lieu khong hop le.",
    });
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Dang nhap", error: null });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return res.render("auth/login", {
      title: "Dang nhap",
      error: "Thong tin dang nhap khong dung.",
    });
  }

  req.session.userId = user.id;
  if (user.role === "admin") return res.redirect("/admin/dashboard");
  return res.redirect("/shop/products");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
