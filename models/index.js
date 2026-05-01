const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false,
});

const User = sequelize.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("customer", "admin"),
    defaultValue: "customer",
  },
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.comparePassword = function comparePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.password);
};

const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING, allowNull: false },
});

const CartItem = sequelize.define("CartItem", {
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

const Order = sequelize.define("Order", {
  totalAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "paid", "failed"),
    defaultValue: "pending",
  },
  paymentRef: { type: DataTypes.STRING, allowNull: true },
});

const OrderItem = sequelize.define("OrderItem", {
  productName: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
});

User.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(User);
Product.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(Product);

User.hasMany(Order, { onDelete: "CASCADE" });
Order.belongsTo(User);
Order.hasMany(OrderItem, { onDelete: "CASCADE" });
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = {
  sequelize,
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
};
