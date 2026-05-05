require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const {
  sequelize,
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
} = require("./models");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { langMiddleware } = require("./middleware/lang");
const { seedCatalog } = require("./lib/seedCatalog");

const app = express();
const PORT = process.env.PORT || 3000;

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
app.use(langMiddleware);

app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.cartCount = 0;
  
  if (req.session.userId) {
    const user = await User.findByPk(req.session.userId);
    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;
    }
  }

  const whereClause = res.locals.currentUser 
    ? { UserId: res.locals.currentUser.id } 
    : { sessionId: req.sessionID };
    
  if (!res.locals.currentUser || res.locals.currentUser.role === "customer") {
    res.locals.cartCount = await CartItem.sum("quantity", {
      where: whereClause,
    }) || 0;
  }
  
  next();
});

app.get("/", (req, res) => res.redirect("/shop/products"));
app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Có lỗi xảy ra, vui lòng thử lại.",
  });
});

async function bootstrap() {
  await sequelize.sync({ alter: true });
  await sessionStore.sync();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@shop.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    await User.create({
      fullName: "Default Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
  }

  await seedCatalog();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin account: ${adminEmail} / ${adminPassword}`);
  });
}

bootstrap();
