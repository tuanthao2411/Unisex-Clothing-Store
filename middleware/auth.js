function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.redirect("/login");
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== "admin") {
    return res.status(403).render("error", {
      title: "Forbidden",
      message: "Ban khong co quyen truy cap trang nay.",
    });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
