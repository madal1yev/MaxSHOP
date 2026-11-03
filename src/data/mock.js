import i18next from "../i18n";
import { displayProducts } from "./displayProducts";
import { categoryNameKey } from "./productI18n";

export const categories = [
  { id: "vegetables", name: "Sabzavotlar", emoji: "\u{1F966}", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "fruits", name: "Mevalar", emoji: "\u{1F34E}", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  { id: "dairy", name: "Sut mahsulotlari", emoji: "\u{1F95B}", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  { id: "meat", name: "Go'sht", emoji: "\u{1F357}", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  { id: "bakery", name: "Non va pishiriq", emoji: "\u{1F956}", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { id: "drinks", name: "Ichimliklar", emoji: "\u{1F9C3}", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  { id: "snacks", name: "Gazaklar", emoji: "\u{1F37F}", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  { id: "household", name: "Uy uchun", emoji: "\u{1F9FC}", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" }
];
export const baseProducts = [
  {
    id: "p1",
    name: "Organik brokkoli",
    categoryId: "vegetables",
    price: 18e3,
    oldPrice: 24e3,
    unit: "1 dona",
    emoji: "\u{1F966}",
    img: "/images/products/brokkoli.jpg",
    gradient: "from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/40",
    rating: 4.8,
    reviews: 126,
    stock: 34,
    popular: true,
    tags: ["Organik", "Yangi"],
    description: "Toshkent viloyatidagi fermer xo'jaligidan yangi uzilgan organik brokkoli. Vitaminlar va minerallarga boy."
  },
  {
    id: "p2",
    name: "Qizil olma (Fuji)",
    categoryId: "fruits",
    price: 22e3,
    oldPrice: 28e3,
    unit: "1 kg",
    emoji: "\u{1F34E}",
    img: "/images/img-24.jpg",
    gradient: "from-rose-100 to-rose-50 dark:from-rose-900/50 dark:to-rose-950/40",
    rating: 4.9,
    reviews: 208,
    stock: 56,
    popular: true,
    tags: ["Shirin", "Sotuvda"],
    description: "Shirin va suvli Fuji olmalari. Har kuni yangi partiya keltiriladi."
  },
  {
    id: "p3",
    name: "Tabiiy yogurt",
    categoryId: "dairy",
    price: 12500,
    unit: "500 ml",
    emoji: "\u{1F95B}",
    img: "/images/products/yogurt.jpg",
    gradient: "from-sky-100 to-sky-50 dark:from-sky-900/50 dark:to-sky-950/40",
    rating: 4.7,
    reviews: 89,
    stock: 22,
    popular: true,
    tags: ["Probiyotik"],
    description: "Qo'shimchalarsiz tabiiy yogurt. Nonushta uchun ideal."
  },
  {
    id: "p4",
    name: "Tovuq filesi",
    categoryId: "meat",
    price: 46e3,
    oldPrice: 52e3,
    unit: "1 kg",
    emoji: "\u{1F357}",
    img: "/images/products/tovuq.jpg",
    gradient: "from-red-100 to-orange-50 dark:from-red-900/50 dark:to-orange-950/40",
    rating: 4.8,
    reviews: 174,
    stock: 18,
    popular: true,
    tags: ["Yangi", "Sovutilgan"],
    description: "Yangi sovutilgan tovuq filesi. Halol va sifatli mahsulot."
  },
  {
    id: "p5",
    name: "Tandir non",
    categoryId: "bakery",
    price: 5e3,
    unit: "1 dona",
    emoji: "\u{1F956}",
    img: "/images/img-12.jpg",
    gradient: "from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-950/40",
    rating: 4.9,
    reviews: 312,
    stock: 40,
    popular: true,
    tags: ["Issiq"],
    description: "Har kuni ertalab tandirda pishirilgan issiq non."
  },
  {
    id: "p6",
    name: "Apelsin sharbati",
    categoryId: "drinks",
    price: 19500,
    oldPrice: 23e3,
    unit: "1 l",
    emoji: "\u{1F9C3}",
    img: "/images/img-27.jpg",
    gradient: "from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-950/40",
    rating: 4.6,
    reviews: 67,
    stock: 31,
    tags: ["100% tabiiy"],
    description: "Faqat apelsindan tayyorlangan 100% tabiiy sharbat."
  },
  {
    id: "p7",
    name: "Kartoshka",
    categoryId: "vegetables",
    price: 9e3,
    unit: "1 kg",
    emoji: "\u{1F954}",
    img: "/images/products/kartoshka.jpg",
    gradient: "from-amber-100 to-yellow-50 dark:from-amber-900/50 dark:to-yellow-950/40",
    rating: 4.5,
    reviews: 143,
    stock: 120,
    tags: ["Mahalliy"],
    description: "Mahalliy kartoshka. Qovurish va qaynatish uchun mos."
  },
  {
    id: "p8",
    name: "Banan",
    categoryId: "fruits",
    price: 24e3,
    unit: "1 kg",
    emoji: "\u{1F34C}",
    img: "/images/img-15.jpg",
    gradient: "from-yellow-100 to-amber-50 dark:from-yellow-900/50 dark:to-amber-950/40",
    rating: 4.7,
    reviews: 231,
    stock: 48,
    popular: true,
    tags: ["Ekvador"],
    description: "Ekvadordan keltirilgan shirin bananlar."
  },
  {
    id: "p9",
    name: "Tuxum (10 dona)",
    categoryId: "dairy",
    price: 21e3,
    unit: "10 dona",
    emoji: "\u{1F95A}",
    img: "/images/img-25.jpg",
    gradient: "from-amber-100 to-stone-50 dark:from-amber-900/50 dark:to-stone-950/40",
    rating: 4.8,
    reviews: 190,
    stock: 64,
    tags: ["Fermer"],
    description: "Fermer xo'jaligidan yangi tovuq tuxumlari."
  },
  {
    id: "p10",
    name: "Mol go'shti",
    categoryId: "meat",
    price: 98e3,
    oldPrice: 11e4,
    unit: "1 kg",
    emoji: "\u{1F969}",
    img: "/images/img-26.jpg",
    gradient: "from-rose-100 to-red-50 dark:from-rose-900/50 dark:to-red-950/40",
    rating: 4.9,
    reviews: 98,
    stock: 9,
    tags: ["Premium"],
    description: "Premium sifatli mol go'shti. Yumshoq va mazali."
  },
  {
    id: "p11",
    name: "Kruassan",
    categoryId: "bakery",
    price: 8500,
    unit: "1 dona",
    emoji: "\u{1F950}",
    img: "/images/img-28.jpg",
    gradient: "from-amber-100 to-orange-50 dark:from-amber-900/50 dark:to-orange-950/40",
    rating: 4.6,
    reviews: 54,
    stock: 25,
    tags: ["Yangi pishirilgan"],
    description: "Sariyog'li fransuz kruassani. Nonushta uchun ajoyib."
  },
  {
    id: "p12",
    name: "Yashil choy",
    categoryId: "drinks",
    price: 15500,
    unit: "100 g",
    emoji: "\u{1F375}",
    img: "/images/products/choy.jpg",
    gradient: "from-emerald-100 to-lime-50 dark:from-emerald-900/50 dark:to-lime-950/40",
    rating: 4.7,
    reviews: 76,
    stock: 44,
    tags: ["Tabiiy"],
    description: "Xitoy yashil choyi. Tetiklashtiruvchi ta'm."
  },
  {
    id: "p13",
    name: "Chips (pishloqli)",
    categoryId: "snacks",
    price: 14e3,
    oldPrice: 17e3,
    unit: "80 g",
    emoji: "\u{1F37F}",
    img: "/images/products/chips.jpg",
    gradient: "from-orange-100 to-yellow-50 dark:from-orange-900/50 dark:to-yellow-950/40",
    rating: 4.3,
    reviews: 122,
    stock: 60,
    tags: ["Aksiya"],
    description: "Pishloq ta'mli kartoshka chipslari."
  },
  {
    id: "p14",
    name: "Shokolad (qora)",
    categoryId: "snacks",
    price: 18e3,
    unit: "90 g",
    emoji: "\u{1F36B}",
    gradient: "from-stone-200 to-amber-50 dark:from-stone-800/60 dark:to-amber-950/40",
    rating: 4.8,
    reviews: 167,
    stock: 38,
    popular: true,
    tags: ["70% kakao"],
    description: "70% kakaoli qora shokolad. Belgilangan import."
  },
  {
    id: "p15",
    name: "Idish yuvish vositasi",
    categoryId: "household",
    price: 26e3,
    oldPrice: 32e3,
    unit: "500 ml",
    emoji: "\u{1F9FC}",
    img: "/images/img-30.jpg",
    gradient: "from-teal-100 to-cyan-50 dark:from-teal-900/50 dark:to-cyan-950/40",
    rating: 4.5,
    reviews: 83,
    stock: 29,
    tags: ["Limon"],
    description: "Limon hidli samarali idish yuvish vositasi."
  },
  {
    id: "p16",
    name: "Pomidor (cherry)",
    categoryId: "vegetables",
    price: 28e3,
    unit: "500 g",
    emoji: "\u{1F345}",
    img: "/images/img-16.jpg",
    gradient: "from-red-100 to-rose-50 dark:from-red-900/50 dark:to-rose-950/40",
    rating: 4.7,
    reviews: 61,
    stock: 17,
    tags: ["Issiqxona"],
    description: "Shirin cherry pomidorlari. Salatlar uchun."
  },
  {
    id: "p17",
    name: "Suv (mineral)",
    categoryId: "drinks",
    price: 7e3,
    unit: "1.5 l",
    emoji: "\u{1F4A7}",
    img: "/images/img-11.jpg",
    gradient: "from-sky-100 to-blue-50 dark:from-sky-900/50 dark:to-blue-950/40",
    rating: 4.4,
    reviews: 205,
    stock: 150,
    tags: ["Tabiiy"],
    description: "Tabiiy mineral suv. Tog' buloqlaridan."
  },
  {
    id: "p18",
    name: "Pishloq (Gouda)",
    categoryId: "dairy",
    price: 34e3,
    oldPrice: 39e3,
    unit: "250 g",
    emoji: "\u{1F9C0}",
    img: "/images/products/pishloq.jpg",
    gradient: "from-yellow-100 to-amber-50 dark:from-yellow-900/50 dark:to-amber-950/40",
    rating: 4.8,
    reviews: 112,
    stock: 21,
    tags: ["Import"],
    description: "Gouda pishloqi. Sandvich va salatlar uchun."
  },
  {
    id: "p19",
    name: "Bodring",
    categoryId: "vegetables",
    price: 12e3,
    unit: "500 g",
    emoji: "\u{1F952}",
    img: "/images/img-17.jpg",
    gradient: "from-green-100 to-emerald-50 dark:from-green-900/50 dark:to-emerald-950/40",
    rating: 4.6,
    reviews: 95,
    stock: 42,
    tags: ["Yangi"],
    description: "Yangi bodring. Salat va tuzlama uchun."
  },
  {
    id: "p20",
    name: "Kir yuvish kukuni",
    categoryId: "household",
    price: 62e3,
    oldPrice: 74e3,
    unit: "3 kg",
    emoji: "\u{1F9FA}",
    img: "/images/img-30.jpg",
    gradient: "from-indigo-100 to-violet-50 dark:from-indigo-900/50 dark:to-violet-950/40",
    rating: 4.5,
    reviews: 74,
    stock: 13,
    tags: ["Avtomat"],
    description: "Avtomat kir yuvish mashinalari uchun kukun."
  }
];

export const products = [...baseProducts, ...displayProducts];

export const shopLocations = [
  {
    id: "shop1",
    name: "MaxShop Chilonzor",
    address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12",
    district: "Chilonzor",
    hours: "08:00–23:00",
    phone: "+998 78 140 14 14"
  },
  {
    id: "shop2",
    name: "MaxShop Yunusobod",
    address: "Toshkent, Yunusobod tumani, Amir Temur shoh ko'chasi 108",
    district: "Yunusobod",
    hours: "08:00–23:00",
    phone: "+998 78 140 14 15"
  },
  {
    id: "shop3",
    name: "MaxShop Mirzo Ulug'bek",
    address: "Toshkent, Mirzo Ulug'bek tumani, Mustaqillik shoh ko'chasi 74",
    district: "Mirzo Ulug'bek",
    hours: "09:00–22:00",
    phone: "+998 78 140 14 16"
  }
];

export const defaultAddresses = [
  { id: "a1", label: "Uy", address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12", details: "3-qavat, 14-xonadon", isDefault: true },
  { id: "a2", label: "Ish", address: "Toshkent, Yunusobod tumani, Amir Temur shoh ko'chasi 108", details: "IT Park, 4-qavat", isDefault: false }
];
export const initialOrders = [
  {
    id: "MS-20481",
    date: "2026-10-27 18:42",
    items: [
      { productId: "p2", name: "Qizil olma (Fuji)", price: 22e3, qty: 2, emoji: "\u{1F34E}", unit: "1 kg" },
      { productId: "p3", name: "Tabiiy yogurt", price: 12500, qty: 3, emoji: "\u{1F95B}", unit: "500 ml" },
      { productId: "p5", name: "Tandir non", price: 5e3, qty: 2, emoji: "\u{1F956}", unit: "1 dona" }
    ],
    subtotal: 91500,
    delivery: 0,
    discount: 0,
    total: 91500,
    status: "delivering",
    address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12",
    payment: "Payme",
    slot: "Bugun, 19:00\u201320:00",
    courier: "Jasur Toshmatov",
    eta: "12 daqiqa"
  },
  {
    id: "MS-20455",
    date: "2026-10-24 10:15",
    items: [
      { productId: "p10", name: "Mol go'shti", price: 98e3, qty: 1, emoji: "\u{1F969}", unit: "1 kg" },
      { productId: "p1", name: "Organik brokkoli", price: 18e3, qty: 2, emoji: "\u{1F966}", unit: "1 dona" }
    ],
    subtotal: 134e3,
    delivery: 12e3,
    discount: 0,
    total: 146e3,
    status: "delivered",
    address: "Toshkent, Chilonzor tumani, Bunyodkor ko'chasi 12",
    payment: "Click",
    slot: "24-oktabr, 12:00\u201313:00",
    courier: "Sardor Aliyev"
  },
  {
    id: "MS-20398",
    date: "2026-10-18 16:30",
    items: [
      { productId: "p17", name: "Suv (mineral)", price: 7e3, qty: 6, emoji: "\u{1F4A7}", unit: "1.5 l" },
      { productId: "p13", name: "Chips (pishloqli)", price: 14e3, qty: 2, emoji: "\u{1F37F}", unit: "80 g" },
      { productId: "p14", name: "Shokolad (qora)", price: 18e3, qty: 1, emoji: "\u{1F36B}", unit: "90 g" }
    ],
    subtotal: 88e3,
    delivery: 12e3,
    discount: 8800,
    total: 91200,
    status: "delivered",
    address: "Toshkent, Yunusobod tumani, Amir Temur shoh ko'chasi 108",
    payment: "Naqd pul",
    slot: "18-oktabr, 18:00\u201319:00",
    courier: "Bekzod Karimov"
  }
];
export const deliverySlots = [
  "Bugun, 12:00\u201313:00",
  "Bugun, 15:00\u201316:00",
  "Bugun, 18:00\u201319:00",
  "Bugun, 19:00\u201320:00",
  "Ertaga, 09:00\u201310:00",
  "Ertaga, 12:00\u201313:00"
];
export const couriers = [
  { name: "Jasur Toshmatov", emoji: "\u{1F9D1}\u200D\u2708\uFE0F", vehicle: "Motosikl", rating: 4.9, phone: "+998 90 123 45 67" },
  { name: "Sardor Aliyev", emoji: "\u{1F468}\u200D\u{1F9B1}", vehicle: "Avtomobil", rating: 4.8, phone: "+998 91 234 56 78" },
  { name: "Bekzod Karimov", emoji: "\u{1F9D4}", vehicle: "Elektr skuter", rating: 4.7, phone: "+998 93 345 67 89" }
];
export const formatUZS = (n) => `${new Intl.NumberFormat("ru-RU").format(Math.round(n))} ${i18next.t("currency")}`;
export const formatPrice = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n));
export const localizeCategory = (category) =>
  category ? { ...category, name: i18next.t(categoryNameKey[category.id] ?? category.id) } : category;
export const localizeCategories = (list) => list.map(localizeCategory);
export const localizeAddress = (address) => {
  if (!address) return address;
  const defaults = {
    a1: { label: i18next.t("addressPlaceholder"), address: i18next.t("defaultAddress1"), details: i18next.t("addressDetailsPlaceholder") },
    a2: { label: i18next.t("workLabel"), address: i18next.t("defaultAddress2"), details: i18next.t("workDetails") },
  };
  return defaults[address.id] ? { ...address, ...defaults[address.id] } : address;
};
export const localizeSlot = (slot) => {
  if (!slot) return slot;
  const [day, time] = slot.split(", ");
  if (!time) return slot;
  if (day === "Bugun") return i18next.t("slotToday", { time });
  if (day === "Ertaga") return i18next.t("slotTomorrow", { time });
  return slot;
};
export const getProduct = (id) => products.find((p) => p.id === id);
export const getCategory = (id) => categories.find((c) => c.id === id);
export const discountPercent = (p) => p.oldPrice ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0;
