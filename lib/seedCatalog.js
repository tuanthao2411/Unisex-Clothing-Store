const { Op } = require("sequelize");
const { Product } = require("../models");

/** Gán slug cho bản ghi cũ (tên ASCII / đã đổi dấu). */
const LEGACY_NAME_TO_SLUG = {
  "Ao thun basic": "ao-thun-basic",
  "Quan jean slim fit": "quan-jean-slim-fit",
  "Áo thun basic": "ao-thun-basic",
  "Quần jean slim fit": "quan-jean-slim-fit",
};

const JEANS_IMG =
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGFudHN8ZW58MHx8MHx8fDA%3D";

function jeansColors() {
  return JSON.stringify([
    { key: "light_blue", labelVi: "Xanh nhạt", labelEn: "Light blue", imageUrl: JEANS_IMG },
    { key: "dark_blue", labelVi: "Xanh đậm", labelEn: "Dark blue", imageUrl: JEANS_IMG },
    { key: "black", labelVi: "Đen", labelEn: "Black", imageUrl: JEANS_IMG },
  ]);
}

const CATALOG = [
  {
    slug: "ao-thun-basic",
    name: "Áo thun basic",
    nameEn: "Basic T-shirt",
    description: "Áo thun cotton form regular.",
    price: 199000,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700",
    category: "Top",
    collection: null,
  },
  {
    slug: "quan-jean-slim-fit",
    name: "Quần jean slim fit",
    nameEn: "Slim fit jeans",
    description: "Quần jean xanh đen co giãn nhẹ.",
    price: 499000,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700",
    category: "Bottom",
    collection: null,
  },
  {
    slug: "ao-so-mi-ke-caro",
    name: "Áo sơ mi kẻ caro",
    nameEn: "Plaid shirt",
    description: "Áo sơ mi kẻ caro Fall–Winter.",
    price: 449000,
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNoaXJ0fGVufDB8fDB8fHww",
    category: "Top",
    collection: "fw2025",
  },
  {
    slug: "ao-len-den",
    name: "Áo len đen",
    nameEn: "Black knit sweater",
    description: "Áo len dệt kim ấm.",
    price: 529000,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1774897796159-b295bc2a587c?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdyZWVuJTIwc3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D",
    category: "Top",
    collection: "fw2025",
  },
  {
    slug: "ao-len-color-block",
    name: "Áo len color block",
    nameEn: "Color block sweater",
    description: "Áo len khối màu nổi bật.",
    price: 579000,
    stock: 25,
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1695339146296-ab03c0e6ae50?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D",
    category: "Top",
    collection: "fw2025",
  },
  {
    slug: "ao-khoac-da-zip",
    name: "Áo khoác da đen zip-up",
    nameEn: "Black leather zip jacket",
    description: "Áo khoác da khóa kéo.",
    price: 1299000,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Jacket",
    collection: "fw2025",
  },
  {
    slug: "quan-jeans-nhieu-mau",
    name: "Quần jeans nhiều màu",
    nameEn: "Multi-color jeans",
    description: "Quần jeans chọn màu: xanh nhạt / xanh đậm / đen.",
    price: 599000,
    stock: 45,
    imageUrl: JEANS_IMG,
    category: "Bottom",
    collection: "fw2025",
    colorOptions: jeansColors(),
  },
  {
    slug: "ao-khoac-mang-to-den",
    name: "Áo khoác măng tô đen",
    nameEn: "Black trench coat",
    description: "Măng tô dài thanh lịch.",
    price: 1499000,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1640920702552-d1c0071d985f?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Jacket",
    collection: "fw2025",
  },
  {
    slug: "ao-just-culture",
    name: "Áo Just Culture",
    nameEn: "Just Culture tee",
    description: "Áo phông streetwear.",
    price: 359000,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Top",
    collection: "ss2026",
  },
  {
    slug: "ao-polo-tim",
    name: "Áo Polo tím",
    nameEn: "Purple polo shirt",
    description: "Áo polo cotton tím.",
    price: 419000,
    stock: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1775816364124-b305f2b06ce7?q=80&w=1442&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Top",
    collection: "ss2026",
  },
  {
    slug: "ao-so-mi-xam-xanh",
    name: "Áo sơ mi xám xanh",
    nameEn: "Blue-grey shirt",
    description: "Sơ mi màu xám xanh nhẹ.",
    price: 389000,
    stock: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1708531374594-a18ba8a95c74?q=80&w=2730&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Top",
    collection: "ss2026",
  },
  {
    slug: "ao-ngan-tay-bien",
    name: "Áo ngắn tay đi biển",
    nameEn: "Beach short-sleeve shirt",
    description: "Áo họa tiết nghỉ mát.",
    price: 329000,
    stock: 38,
    imageUrl:
      "https://images.unsplash.com/photo-1695489605932-1a0ab701d465?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Top",
    collection: "ss2026",
  },
  {
    slug: "quan-short-xanh-reu",
    name: "Quần short xanh rêu",
    nameEn: "Olive green shorts",
    description: "Short kaki xanh rêu.",
    price: 289000,
    stock: 42,
    imageUrl:
      "https://images.pexels.com/photos/30248246/pexels-photo-30248246.jpeg",
    category: "Bottom",
    collection: "ss2026",
  },
  {
    slug: "quan-linen-trang",
    name: "Quần linen trắng",
    nameEn: "White linen pants",
    description: "Quần linen thoáng mát.",
    price: 459000,
    stock: 28,
    imageUrl: "https://images.pexels.com/photos/13250385/pexels-photo-13250385.jpeg",
    category: "Bottom",
    collection: "ss2026",
  },
];

async function seedCatalog() {
  for (const [name, slug] of Object.entries(LEGACY_NAME_TO_SLUG)) {
    await Product.update({ slug }, { where: { name } });
  }
  await Product.update(
    { slug: "ao-thun-basic" },
    { where: { slug: { [Op.is]: null }, name: { [Op.like]: "%thun%basic%" } } }
  );
  await Product.update(
    { slug: "quan-jean-slim-fit" },
    { where: { slug: { [Op.is]: null }, name: { [Op.like]: "%jean%slim%" } } }
  );

  for (const row of CATALOG) {
    const { slug, ...rest } = row;
    const [p] = await Product.findOrCreate({
      where: { slug },
      defaults: {
        slug,
        sizesAvailable: "S,M,L,XL",
        colorOptions: rest.colorOptions || null,
        ...rest,
      },
    });
    await p.update({
      name: rest.name,
      nameEn: rest.nameEn,
      description: rest.description,
      price: rest.price,
      stock: rest.stock,
      imageUrl: rest.imageUrl,
      category: rest.category,
      collection: rest.collection,
      sizesAvailable: "S,M,L,XL",
      colorOptions: rest.colorOptions != null ? rest.colorOptions : null,
    });
  }
}

module.exports = { seedCatalog, CATALOG };
