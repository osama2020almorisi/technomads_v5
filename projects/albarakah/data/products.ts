/**
 * ───────────────────────────────────────────────────────────────
 *  data/products.ts — بيانات المنتجات (عدّل الأسعار والأوزان هنا)
 * ───────────────────────────────────────────────────────────────
 *  • لإضافة منتج جديد: انسخ أي كائن داخل المصفوفة وعدّل قيمه.
 *  • slug: يظهر في الرابط /products/<slug> (أحرف إنجليزية صغيرة وشرطات).
 *  • image: ضع صورتك في public/images/ ثم اكتب المسار هنا،
 *    أو استخدم رابط Unsplash/Pexels مباشر (مسموح في next.config.mjs).
 *  • sizes: خيارات الوزن، وكل خيار له سعره الخاص بالدولار.
 * ───────────────────────────────────────────────────────────────
 */

import type { LocalizedText } from "./site";

export type ProductCategory = "dried-fruits" | "nuts" | "honey";

export interface ProductSize {
  id: string;
  label: LocalizedText;
  price: number; // بالدولار الأمريكي
  compareAt?: number; // السعر قبل الخصم (اختياري)
}

export interface Product {
  slug: string;
  sku: string;
  category: ProductCategory;
  name: LocalizedText;
  short: LocalizedText;
  description: LocalizedText;
  image: string;
  gallery?: string[];
  imageAlt: LocalizedText;
  origin: LocalizedText;
  storage: LocalizedText;
  badge?: "bestseller" | "new" | "natural";
  rating: number;
  reviews: number;
  sizes: ProductSize[];
  benefits: LocalizedText[];
  nutrition: { label: LocalizedText; value: string }[];
  /** لون مميز لكل منتج (يستخدم في الإضاءة الخلفية للكرت) */
  accent: string;
}

export const categories: { id: ProductCategory | "all"; label: LocalizedText }[] = [
  { id: "all", label: { en: "All", ar: "الكل" } },
  { id: "dried-fruits", label: { en: "Dried fruits", ar: "فواكه مجففة" } },
  { id: "nuts", label: { en: "Nuts", ar: "مكسرات" } },
  { id: "honey", label: { en: "Honey", ar: "عسل" } },
];

const lb = (n: number): LocalizedText => ({ en: `${n} lb`, ar: `${n} رطل` });

export const products: Product[] = [
  {
    slug: "golden-raisins",
    sku: "ABN-RSN-01",
    category: "dried-fruits",
    name: { en: "Sun-Dried Raisins", ar: "زبيب مجفف بالشمس" },
    short: {
      en: "Plump, naturally sweet golden & dark raisins.",
      ar: "زبيب ذهبي وأسود ممتلئ وحلو بطبيعته.",
    },
    description: {
      en: "Our raisins are made from ripe, seedless grapes dried slowly under the sun to concentrate their natural sweetness. Soft, juicy and full of flavor — perfect for snacking, baking, rice dishes and breakfast bowls. No added sugar, no oil, no sulfites.",
      ar: "زبيبنا مصنوع من عنب ناضج بدون بذور، يُجفف ببطء تحت أشعة الشمس ليُركّز حلاوته الطبيعية. طري وغني بالعصارة والنكهة — مثالي كوجبة خفيفة، وللحلويات وأطباق الأرز والإفطار. بدون سكر مضاف أو زيوت أو كبريتات.",
    },
    image: "/images/raisins.jpg",
    imageAlt: { en: "Bowl of plump golden and dark raisins", ar: "وعاء من الزبيب الذهبي والأسود" },
    origin: { en: "California vineyards", ar: "كروم كاليفورنيا" },
    storage: {
      en: "Store in a cool, dry place. Refrigerate after opening for longer freshness.",
      ar: "يُحفظ في مكان بارد وجاف. يُفضل حفظه في الثلاجة بعد الفتح.",
    },
    badge: "natural",
    rating: 4.8,
    reviews: 312,
    sizes: [
      { id: "1lb", label: lb(1), price: 12.99 },
      { id: "2lb", label: lb(2), price: 22.99, compareAt: 25.98 },
      { id: "5lb", label: lb(5), price: 49.99, compareAt: 64.95 },
    ],
    benefits: [
      { en: "Natural source of iron and potassium", ar: "مصدر طبيعي للحديد والبوتاسيوم" },
      { en: "Rich in fiber for healthy digestion", ar: "غني بالألياف لهضم صحي" },
      { en: "Energy boost without added sugar", ar: "طاقة طبيعية بدون سكر مضاف" },
    ],
    nutrition: [
      { label: { en: "Calories", ar: "السعرات" }, value: "299 kcal" },
      { label: { en: "Fiber", ar: "الألياف" }, value: "3.7 g" },
      { label: { en: "Potassium", ar: "البوتاسيوم" }, value: "749 mg" },
      { label: { en: "Iron", ar: "الحديد" }, value: "1.9 mg" },
    ],
    accent: "#8B5E3C",
  },
  {
    slug: "california-almonds",
    sku: "ABN-ALM-01",
    category: "nuts",
    name: { en: "Raw California Almonds", ar: "لوز كاليفورنيا الخام" },
    short: {
      en: "Whole, crunchy, raw almonds — premium grade.",
      ar: "لوز خام كامل ومقرمش — درجة ممتازة.",
    },
    description: {
      en: "Large, whole raw almonds with a clean, buttery crunch. Hand-sorted for size and quality and packed fresh. Enjoy them as a snack, soak them overnight, or use them for homemade almond milk and baking.",
      ar: "لوز خام كبير الحجم وكامل، بقرمشة نظيفة وطعم زبدي. يُفرز يدوياً حسب الحجم والجودة ويُعبأ طازجاً. تناوله كوجبة خفيفة، أو انقعه ليلاً، أو استخدمه لصنع حليب اللوز والمخبوزات.",
    },
    image: "/images/almonds.jpg",
    imageAlt: { en: "Wooden bowl overflowing with raw almonds", ar: "وعاء خشبي مليء باللوز الخام" },
    origin: { en: "Central Valley, California", ar: "الوادي الأوسط، كاليفورنيا" },
    storage: {
      en: "Keep sealed in a cool, dry place or refrigerate for up to 12 months.",
      ar: "يُحفظ مغلقاً في مكان بارد وجاف أو في الثلاجة حتى 12 شهراً.",
    },
    badge: "bestseller",
    rating: 4.9,
    reviews: 428,
    sizes: [
      { id: "1lb", label: lb(1), price: 14.99 },
      { id: "2lb", label: lb(2), price: 26.99, compareAt: 29.98 },
      { id: "5lb", label: lb(5), price: 59.99, compareAt: 74.95 },
    ],
    benefits: [
      { en: "Plant protein and healthy fats", ar: "بروتين نباتي ودهون صحية" },
      { en: "Excellent source of vitamin E", ar: "مصدر ممتاز لفيتامين E" },
      { en: "Supports heart health", ar: "يدعم صحة القلب" },
    ],
    nutrition: [
      { label: { en: "Calories", ar: "السعرات" }, value: "579 kcal" },
      { label: { en: "Protein", ar: "البروتين" }, value: "21 g" },
      { label: { en: "Vitamin E", ar: "فيتامين E" }, value: "25.6 mg" },
      { label: { en: "Fiber", ar: "الألياف" }, value: "12.5 g" },
    ],
    accent: "#C08A4A",
  },
  {
    slug: "raw-wildflower-honey",
    sku: "ABN-HNY-01",
    category: "honey",
    name: { en: "Raw Wildflower Honey", ar: "عسل زهور بري خام" },
    short: {
      en: "Unfiltered, unpasteurized liquid gold.",
      ar: "ذهب سائل غير مصفّى وغير مبستر.",
    },
    description: {
      en: "Pure raw honey harvested from wildflower meadows and bottled straight from the comb — never heated, never filtered, never blended with syrups. Rich floral aroma with notes of caramel. Natural crystallization is a sign of real, raw honey.",
      ar: "عسل خام نقي يُجنى من مراعي الزهور البرية ويُعبأ مباشرة من الشمع — بدون تسخين أو تصفية أو خلط بأي شراب. رائحة زهرية غنية مع لمسات من الكراميل. التبلور الطبيعي علامة على العسل الخام الحقيقي.",
    },
    image: "/images/honey.jpg",
    imageAlt: { en: "Jar of raw golden honey with a wooden dipper", ar: "جرة عسل ذهبي خام مع ملعقة خشبية" },
    origin: { en: "American wildflower meadows", ar: "مراعي الزهور البرية الأمريكية" },
    storage: {
      en: "Store at room temperature. If it crystallizes, warm the jar gently in water.",
      ar: "يُحفظ في درجة حرارة الغرفة. إذا تبلور، ضع الجرة في ماء دافئ بلطف.",
    },
    badge: "bestseller",
    rating: 4.9,
    reviews: 521,
    sizes: [
      { id: "12oz", label: { en: "12 oz jar", ar: "جرة 12 أونصة" }, price: 16.99 },
      { id: "24oz", label: { en: "24 oz jar", ar: "جرة 24 أونصة" }, price: 29.99, compareAt: 33.98 },
      { id: "48oz", label: { en: "48 oz jar", ar: "جرة 48 أونصة" }, price: 52.99, compareAt: 67.96 },
    ],
    benefits: [
      { en: "Natural antioxidants and enzymes", ar: "مضادات أكسدة وإنزيمات طبيعية" },
      { en: "Soothes the throat naturally", ar: "يهدئ الحلق بشكل طبيعي" },
      { en: "A wholesome alternative to sugar", ar: "بديل صحي للسكر" },
    ],
    nutrition: [
      { label: { en: "Calories", ar: "السعرات" }, value: "304 kcal" },
      { label: { en: "Carbohydrates", ar: "الكربوهيدرات" }, value: "82 g" },
      { label: { en: "Fat", ar: "الدهون" }, value: "0 g" },
      { label: { en: "Additives", ar: "الإضافات" }, value: "None" },
    ],
    accent: "#D4A017",
  },
  {
    slug: "medjool-dates",
    sku: "ABN-DTE-01",
    category: "dried-fruits",
    name: { en: "Premium Medjool Dates", ar: "تمر مجهول فاخر" },
    short: {
      en: "Large, soft, caramel-sweet — the king of dates.",
      ar: "كبير وطري وحلو كالكراميل — ملك التمور.",
    },
    description: {
      en: "Jumbo Medjool dates with a soft, melt-in-your-mouth texture and deep caramel flavor. Naturally sweet and full of energy — enjoy them on their own, stuffed with almonds, or blended into smoothies. Carefully selected and packed fresh.",
      ar: "تمر مجهول بحجم كبير جداً، بقوام طري يذوب في الفم ونكهة كراميل عميقة. حلو بطبيعته ومليء بالطاقة — تناوله وحده، أو محشواً باللوز، أو في العصائر. منتقى بعناية ومعبأ طازجاً.",
    },
    image: "/images/dates.jpg",
    imageAlt: { en: "Glossy Medjool dates in a brass dish", ar: "تمر مجهول لامع في طبق نحاسي" },
    origin: { en: "Date palm groves", ar: "بساتين النخيل" },
    storage: {
      en: "Refrigerate to keep soft and fresh for up to 6 months.",
      ar: "يُحفظ في الثلاجة ليبقى طرياً وطازجاً حتى 6 أشهر.",
    },
    badge: "new",
    rating: 5.0,
    reviews: 389,
    sizes: [
      { id: "1lb", label: lb(1), price: 15.99 },
      { id: "2lb", label: lb(2), price: 28.99, compareAt: 31.98 },
      { id: "5lb", label: lb(5), price: 64.99, compareAt: 79.95 },
    ],
    benefits: [
      { en: "Natural, quick-release energy", ar: "طاقة طبيعية سريعة" },
      { en: "High in fiber, potassium and magnesium", ar: "غني بالألياف والبوتاسيوم والمغنيسيوم" },
      { en: "Perfect for Suhoor, Iftar and gifting", ar: "مثالي للسحور والإفطار والهدايا" },
    ],
    nutrition: [
      { label: { en: "Calories", ar: "السعرات" }, value: "277 kcal" },
      { label: { en: "Fiber", ar: "الألياف" }, value: "6.7 g" },
      { label: { en: "Potassium", ar: "البوتاسيوم" }, value: "696 mg" },
      { label: { en: "Magnesium", ar: "المغنيسيوم" }, value: "54 mg" },
    ],
    accent: "#6B4423",
  },
];

/* ═══════════════ دوال مساعدة ═══════════════ */
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getMinPrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price));
export const getRelated = (slug: string, count = 3) => products.filter((p) => p.slug !== slug).slice(0, count);
