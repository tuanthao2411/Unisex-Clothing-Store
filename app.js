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

app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.cartCount = 0;
  if (req.session.userId) {
    const user = await User.findByPk(req.session.userId);
    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;
      if (user.role === "customer") {
        res.locals.cartCount = await CartItem.sum("quantity", {
          where: { UserId: user.id },
        });
        res.locals.cartCount = res.locals.cartCount || 0;
      }
    }
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
    message: "Co loi xay ra, vui long thu lai.",
  });
});

async function bootstrap() {
  await sequelize.sync();
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

  const productCount = await Product.count();
  if (!productCount) {
    await Product.bulkCreate([
      {
        name: "Ao thun basic",
        description: "Ao thun cotton form regular.",
        price: 199000,
        stock: 50,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700",
      },
      {
        name: "Quan jean slim fit",
        description: "Quan jean xanh den co gian nhe.",
        price: 499000,
        stock: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700",
      },
    ]);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin account: ${adminEmail} / ${adminPassword}`);
  });
}

bootstrap();
