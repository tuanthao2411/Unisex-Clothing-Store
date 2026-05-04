const vi = require("../locales/vi.json");
const en = require("../locales/en.json");

const dict = { vi, en };

function translate(lang, key) {
  const table = dict[lang] || dict.vi;
  return table[key] != null ? table[key] : dict.vi[key] != null ? dict.vi[key] : key;
}

function langMiddleware(req, res, next) {
  const q = req.query.lang;
  if (q === "en" || q === "vi") {
    req.session.lang = q;
  }
  const lang = req.session.lang === "en" ? "en" : "vi";
  res.locals.lang = lang;
  res.locals.t = (key) => translate(lang, key);
  res.locals.productName = (product) => {
    if (!product) return "";
    return lang === "en" && product.nameEn ? product.nameEn : product.name;
  };
  res.locals.colorLabel = (opt) => {
    if (!opt) return "";
    return lang === "en" && opt.labelEn ? opt.labelEn : opt.labelVi || opt.labelEn || opt.key;
  };
  next();
}

module.exports = { langMiddleware, translate };
