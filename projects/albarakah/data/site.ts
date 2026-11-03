/**
 * ───────────────────────────────────────────────────────────────
 *  data/site.ts — ملف الإعدادات والنصوص المركزي للموقع
 * ───────────────────────────────────────────────────────────────
 *  عدّل هنا: اسم المتجر، الأرقام، الواتساب، البريد، ساعات العمل،
 *  روابط السوشيال، وجميع نصوص الموقع بالإنجليزية والعربية.
 *  لا تحتاج لتعديل أي مكوّن آخر لتغيير النصوص.
 * ───────────────────────────────────────────────────────────────
 */

export type Locale = "en" | "ar";
export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

/** نص مترجم بلغتين */
export type LocalizedText = Record<Locale, string>;

/* ═══════════════ 1) إعدادات المتجر الأساسية ═══════════════ */
export const siteConfig = {
  /** اسم المتجر — غيّره هنا فقط وسيتغيّر في كل الموقع */
  name: "AlBarakah Naturals",
  nameAr: "البركة للمنتجات الطبيعية",
  shortName: "AlBarakah",
  tagline: {
    en: "100% Natural Products — Delivered to Your Door Across America",
    ar: "منتجات طبيعية 100% — توصيل لباب بيتك في كل أمريكا",
  } satisfies LocalizedText,
  description: {
    en: "Premium raisins, almonds, raw honey and Medjool dates — 100% natural, carefully selected and shipped fast to all 50 US states.",
    ar: "زبيب ولوز وعسل خام وتمر مجهول فاخر — طبيعي 100%، منتقى بعناية ويُشحن بسرعة لجميع الولايات الأمريكية الخمسين.",
  } satisfies LocalizedText,

  /** رابط الموقع النهائي (يُقرأ من .env.local إن وُجد) */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://albarakahnaturals.com",

  /** أرقام التواصل — تظهر في الهيدر والفوتر وصفحة التواصل */
  phones: [
    { display: "+1 313-909-8734", tel: "+13139098734" },
    { display: "+1 313-455-1054", tel: "+13134551054" },
  ],

  /** رقم واتساب الطلبات (صيغة دولية بدون + أو مسافات) */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "13139098734",

  /** البريد الإلكتروني لنموذج التواصل (mailto) */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@albarakahnaturals.com",

  currency: "USD",

  /** الموقع الجغرافي (يُستخدم في Schema.org LocalBusiness) — عدّله حسب عنوانك الفعلي */
  address: { region: "MI", country: "US" },

  /** روابط السوشيال — اترك القيمة فارغة "" لإخفاء الأيقونة */
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    youtube: "",
  },

  /** حد الشحن المجاني بالدولار */
  freeShippingThreshold: 75,

  /** إحصائيات تظهر مع أنيميشن عدّاد */
  stats: [
    { value: 5000, suffix: "+", label: { en: "Happy customers", ar: "عميل سعيد" } },
    { value: 50, suffix: "", label: { en: "States delivered", ar: "ولاية نوصل لها" } },
    { value: 100, suffix: "%", label: { en: "Natural & pure", ar: "طبيعي ونقي" } },
    { value: 4.9, suffix: "★", decimals: 1, label: { en: "Average rating", ar: "متوسط التقييم" } },
  ],
};

/* ═══════════════ 2) جميع نصوص الواجهة (EN / AR) ═══════════════ */
const en = {
  nav: {
    home: "Home",
    products: "Products",
    about: "About",
    shipping: "Shipping & Returns",
    contact: "Contact",
    orderNow: "Order Now",
    menu: "Menu",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    skip: "Skip to content",
  },
  controls: {
    language: "العربية",
    languageLabel: "Switch language to Arabic",
    themeLight: "Switch to light mode",
    themeDark: "Switch to dark mode",
    cart: "Open cart",
  },
  hero: {
    eyebrow: "Harvested with care · Shipped nationwide",
    titleA: "Nature's finest,",
    titleB: "delivered to your door.",
    subtitle:
      "Sun-dried raisins, crunchy almonds, raw golden honey and soft Medjool dates — 100% natural, hand-selected, and shipped fast to all 50 states.",
    ctaPrimary: "Shop the collection",
    ctaSecondary: "Order on WhatsApp",
    badgeNatural: "100% Natural",
    badgeRating: "4.9 / 5 from 1,200+ reviews",
    badgeShipping: "Ships in 24h",
    scroll: "Scroll",
  },
  features: [
    { title: "Delivery to all 50 states", text: "From Maine to Hawaii" },
    { title: "100% natural quality", text: "No additives, no preservatives" },
    { title: "Secure payment", text: "Trusted, protected checkout" },
    { title: "Fast shipping", text: "Dispatched within 24 hours" },
  ],
  products: {
    eyebrow: "Our collection",
    title: "Four treasures of nature",
    subtitle: "Every batch is tasted, sorted and packed fresh — so what reaches your table is pure, honest and full of flavor.",
    viewAll: "View all products",
    addToCart: "Add to cart",
    added: "Added",
    whatsapp: "WhatsApp",
    orderWhatsapp: "Order via WhatsApp",
    from: "From",
    details: "View details",
    pageTitle: "Shop all products",
    pageSubtitle: "Pure, natural and carefully packed. Filter by category or sort by price.",
    searchPlaceholder: "Search products…",
    searchLabel: "Search products",
    all: "All",
    sortLabel: "Sort by",
    sortFeatured: "Featured",
    sortLow: "Price: low to high",
    sortHigh: "Price: high to low",
    empty: "No products match your search.",
    reset: "Reset filters",
    results: "products",
  },
  product: {
    back: "Back to products",
    weight: "Choose size",
    quantity: "Quantity",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    inStock: "In stock — ships within 24 hours",
    origin: "Origin",
    benefits: "Why you'll love it",
    nutrition: "Nutrition (per 100g)",
    storage: "Storage",
    related: "You may also like",
    reviews: "reviews",
    guarantee: "Satisfaction guaranteed or your money back",
    freeShip: "Free shipping on orders over",
  },
  why: {
    eyebrow: "Why AlBarakah",
    title: "Quality you can taste, trust you can feel",
    items: [
      { title: "Hand-selected harvests", text: "We source directly from trusted growers and beekeepers, choosing only the finest grade." },
      { title: "Nothing artificial", text: "No added sugar, no preservatives, no fillers. Just the food, the way nature made it." },
      { title: "Packed fresh to order", text: "Sealed in food-safe, resealable packaging to lock in freshness and flavor." },
      { title: "Nationwide delivery", text: "Reliable shipping to every US state with tracking on every order." },
      { title: "Real people, real help", text: "Talk to us directly on WhatsApp or phone — fast, friendly answers." },
      { title: "Happiness guarantee", text: "Not delighted? We'll make it right with a replacement or refund." },
    ],
  },
  stats: { title: "Trusted by families across America" },
  testimonials: {
    eyebrow: "Customer love",
    title: "What our customers say",
    items: [
      { name: "Sarah M.", location: "Houston, TX", text: "The Medjool dates are unbelievably soft and fresh — better than anything at my local store. Arrived in three days.", product: "Medjool Dates" },
      { name: "Omar K.", location: "Dearborn, MI", text: "Real, raw honey you can taste the difference in. Ordering on WhatsApp was quick and they answered right away.", product: "Raw Honey" },
      { name: "Jessica L.", location: "San Diego, CA", text: "Crunchy, clean almonds and the raisins are plump and sweet. My kids snack on them every day now.", product: "Almonds & Raisins" },
      { name: "Ahmed R.", location: "Brooklyn, NY", text: "Beautiful packaging and excellent quality. I sent a gift box to my parents and they loved it.", product: "Gift order" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions? We've got answers.",
    items: [
      { q: "Do you ship to every US state?", a: "Yes. We deliver to all 50 states, including Alaska and Hawaii. Most orders arrive within 2–5 business days." },
      { q: "How do I place an order?", a: "Add items to your cart and tap “Checkout via WhatsApp”, or tap the WhatsApp button on any product. We confirm your order, total and delivery details in the chat." },
      { q: "Are your products really 100% natural?", a: "Absolutely. Our raisins, almonds, honey and dates contain no added sugar, preservatives or artificial ingredients." },
      { q: "How much does shipping cost?", a: "Shipping is free on orders over $75. For smaller orders, a flat rate is calculated at confirmation based on your state." },
      { q: "How should I store the products?", a: "Keep in a cool, dry place away from sunlight. Dates and almonds stay fresher in the refrigerator. Honey never spoils — crystallization is natural." },
      { q: "What if I'm not satisfied?", a: "Contact us within 14 days of delivery. We'll gladly replace your item or issue a full refund." },
    ],
  },
  cta: {
    title: "Order now — delivery to every state.",
    subtitle: "Message us on WhatsApp or call us directly. We'll pack your order fresh and ship it within 24 hours.",
    whatsapp: "Order on WhatsApp",
    call: "Call us",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty",
    emptyText: "Discover our natural collection and add your favorites.",
    browse: "Browse products",
    subtotal: "Subtotal",
    shippingNote: "Shipping calculated at confirmation.",
    freeShipLeft: "away from free shipping",
    freeShipDone: "You've unlocked free shipping",
    checkout: "Checkout via WhatsApp",
    remove: "Remove",
    close: "Close cart",
    clear: "Clear cart",
    orderIntro: "Hello AlBarakah Naturals, I'd like to place an order:",
    orderTotal: "Subtotal",
    orderOutro: "Please confirm delivery to my address. Thank you!",
  },
  whatsappMsg: {
    product: "Hello AlBarakah Naturals! I'd like to order:",
    general: "Hello AlBarakah Naturals! I'd like to place an order.",
    size: "Size",
    qty: "Quantity",
  },
  about: {
    metaTitle: "About Us",
    eyebrow: "Our story",
    title: "Rooted in tradition, delivered with care",
    intro: "AlBarakah — “the blessing” — began with a simple belief: that the purest foods are the ones nature already perfected. We bring the flavors we grew up with to tables across America.",
    storyTitle: "From the orchard to your door",
    story: [
      "We work with growers and beekeepers who share our respect for the land. Every raisin is sun-dried, every almond is crisp and whole, every jar of honey is raw and unfiltered, and every date is soft and naturally sweet.",
      "We inspect and taste each batch before packing it fresh to order, then ship it quickly to any address in the United States. No middlemen, no long warehouse shelves — just honest, natural food.",
    ],
    valuesTitle: "What we stand for",
    values: [
      { title: "Purity", text: "Real food with nothing added and nothing taken away." },
      { title: "Honesty", text: "Clear prices, clear sourcing, and real conversations with our customers." },
      { title: "Care", text: "Every order is packed by hand as if it were going to our own family." },
    ],
  },
  contact: {
    metaTitle: "Contact Us",
    eyebrow: "Get in touch",
    title: "We'd love to hear from you",
    subtitle: "Questions about an order, wholesale or gifting? Send us a message — we usually reply within the hour during business hours.",
    formTitle: "Send a message",
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    subject: "Product of interest",
    subjectNone: "General question",
    message: "Message",
    sendWhatsapp: "Send via WhatsApp",
    sendEmail: "Send via Email",
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    success: "Opening your app to send the message…",
    phonesTitle: "Call or WhatsApp",
    hoursTitle: "Business hours",
    hours: [
      { day: "Monday – Friday", time: "9:00 AM – 8:00 PM ET" },
      { day: "Saturday", time: "10:00 AM – 6:00 PM ET" },
      { day: "Sunday", time: "12:00 PM – 5:00 PM ET" },
    ],
    emailTitle: "Email",
    areaTitle: "Service area",
    area: "Shipping to all 50 US states",
    msgIntro: "New message from the website",
  },
  shipping: {
    metaTitle: "Shipping & Returns",
    eyebrow: "Policies",
    title: "Shipping & Returns",
    subtitle: "Clear, simple and fair — so you can order with confidence.",
    sections: [
      {
        title: "Where we ship",
        points: [
          "We ship to all 50 US states, including Alaska, Hawaii and APO/FPO addresses.",
          "Orders are packed fresh and dispatched within 24 hours (Monday–Saturday).",
        ],
      },
      {
        title: "Delivery times",
        points: [
          "Standard shipping: 2–5 business days.",
          "Express shipping: 1–2 business days (available on request).",
          "Alaska & Hawaii: 4–7 business days.",
        ],
      },
      {
        title: "Shipping costs",
        points: [
          "Free standard shipping on all orders over $75.",
          "Orders under $75: flat rate starting at $7.99, confirmed with your order total.",
          "A tracking number is shared with every order.",
        ],
      },
      {
        title: "Returns & refunds",
        points: [
          "If you're not completely satisfied, contact us within 14 days of delivery.",
          "Damaged or incorrect items are replaced or refunded in full — just send us a photo.",
          "For food safety, opened products can't be resold, but we'll always find a fair solution.",
          "Refunds are processed within 3–5 business days to your original payment method.",
        ],
      },
    ],
    helpTitle: "Need help with an order?",
    helpText: "Our team is one message away.",
  },
  notFound: {
    title: "This page wandered off the trail",
    text: "The page you're looking for doesn't exist or has been moved. Let's get you back to something sweet.",
    home: "Back to home",
    shop: "Browse products",
  },
  footer: {
    about: "Premium natural raisins, almonds, honey and dates — hand-selected and delivered fresh across the United States.",
    shop: "Shop",
    company: "Company",
    contact: "Contact",
    rights: "All rights reserved.",
    made: "Made with care in the USA.",
    social: "Follow us",
  },
  common: {
    natural: "100% Natural",
    bestseller: "Bestseller",
    new: "New",
    whatsappFloat: "Chat with us on WhatsApp",
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  nav: {
    home: "الرئيسية",
    products: "المنتجات",
    about: "من نحن",
    shipping: "الشحن والإرجاع",
    contact: "اتصل بنا",
    orderNow: "اطلب الآن",
    menu: "القائمة",
    closeMenu: "إغلاق القائمة",
    openMenu: "فتح القائمة",
    skip: "تخطَّ إلى المحتوى",
  },
  controls: {
    language: "English",
    languageLabel: "التبديل إلى اللغة الإنجليزية",
    themeLight: "التبديل إلى الوضع الفاتح",
    themeDark: "التبديل إلى الوضع الداكن",
    cart: "فتح السلة",
  },
  hero: {
    eyebrow: "محصود بعناية · يُشحن لكل الولايات",
    titleA: "أجود ما في الطبيعة،",
    titleB: "يصل إلى باب بيتك.",
    subtitle:
      "زبيب مجفف بالشمس، لوز مقرمش، عسل ذهبي خام، وتمر مجهول طري — طبيعي 100%، منتقى يدوياً، ويُشحن بسرعة إلى جميع الولايات الخمسين.",
    ctaPrimary: "تسوّق المجموعة",
    ctaSecondary: "اطلب عبر واتساب",
    badgeNatural: "طبيعي 100%",
    badgeRating: "4.9 / 5 من أكثر من 1,200 تقييم",
    badgeShipping: "يُشحن خلال 24 ساعة",
    scroll: "مرّر",
  },
  features: [
    { title: "توصيل لكل أمريكا", text: "من مين حتى هاواي" },
    { title: "جودة طبيعية 100%", text: "بدون إضافات أو مواد حافظة" },
    { title: "دفع آمن", text: "عملية دفع موثوقة ومحمية" },
    { title: "شحن سريع", text: "يُرسل خلال 24 ساعة" },
  ],
  products: {
    eyebrow: "مجموعتنا",
    title: "أربعة كنوز من الطبيعة",
    subtitle: "كل دفعة نتذوقها ونفرزها ونعبئها طازجة — ليصل إلى مائدتك منتج نقي وصادق ومليء بالنكهة.",
    viewAll: "عرض كل المنتجات",
    addToCart: "أضف للسلة",
    added: "تمت الإضافة",
    whatsapp: "واتساب",
    orderWhatsapp: "اطلب عبر واتساب",
    from: "يبدأ من",
    details: "عرض التفاصيل",
    pageTitle: "تسوّق جميع المنتجات",
    pageSubtitle: "نقية وطبيعية ومعبأة بعناية. صفِّ حسب الفئة أو رتّب حسب السعر.",
    searchPlaceholder: "ابحث عن منتج…",
    searchLabel: "البحث في المنتجات",
    all: "الكل",
    sortLabel: "ترتيب حسب",
    sortFeatured: "المميزة",
    sortLow: "السعر: من الأقل للأعلى",
    sortHigh: "السعر: من الأعلى للأقل",
    empty: "لا توجد منتجات مطابقة لبحثك.",
    reset: "إعادة ضبط الفلاتر",
    results: "منتجات",
  },
  product: {
    back: "العودة إلى المنتجات",
    weight: "اختر الحجم",
    quantity: "الكمية",
    decrease: "إنقاص الكمية",
    increase: "زيادة الكمية",
    inStock: "متوفر — يُشحن خلال 24 ساعة",
    origin: "المنشأ",
    benefits: "لماذا ستحبه",
    nutrition: "القيمة الغذائية (لكل 100 غ)",
    storage: "طريقة الحفظ",
    related: "قد يعجبك أيضاً",
    reviews: "تقييم",
    guarantee: "رضاك مضمون أو نعيد لك أموالك",
    freeShip: "شحن مجاني للطلبات فوق",
  },
  why: {
    eyebrow: "لماذا البركة",
    title: "جودة تتذوقها، وثقة تشعر بها",
    items: [
      { title: "محاصيل منتقاة يدوياً", text: "نتعامل مباشرة مع مزارعين ونحّالين موثوقين، ونختار أعلى درجات الجودة فقط." },
      { title: "لا شيء صناعي", text: "بدون سكر مضاف أو مواد حافظة أو حشوات. الطعام كما خلقه الله." },
      { title: "تعبئة طازجة عند الطلب", text: "مغلّف بعبوات آمنة وقابلة لإعادة الإغلاق للحفاظ على الطزاجة والنكهة." },
      { title: "توصيل لكل الولايات", text: "شحن موثوق لكل ولاية أمريكية مع رقم تتبع لكل طلب." },
      { title: "دعم حقيقي وسريع", text: "تحدّث معنا مباشرة عبر واتساب أو الهاتف — ردود سريعة وودودة." },
      { title: "ضمان الرضا", text: "لم يعجبك المنتج؟ نستبدله أو نعيد لك المبلغ." },
    ],
  },
  stats: { title: "موثوقون لدى العائلات في كل أمريكا" },
  testimonials: {
    eyebrow: "آراء عملائنا",
    title: "ماذا يقول عملاؤنا",
    items: [
      { name: "سارة م.", location: "هيوستن، تكساس", text: "التمر المجهول طري وطازج بشكل لا يصدق — أفضل من أي شيء في المتاجر القريبة. وصل خلال ثلاثة أيام.", product: "تمر مجهول" },
      { name: "عمر ك.", location: "ديربورن، ميشيغان", text: "عسل خام حقيقي تشعر بالفرق في طعمه. الطلب عبر واتساب كان سريعاً وردّوا فوراً.", product: "عسل خام" },
      { name: "جيسيكا ل.", location: "سان دييغو، كاليفورنيا", text: "لوز مقرمش ونظيف، والزبيب ممتلئ وحلو. أطفالي يتناولونه كل يوم الآن.", product: "لوز وزبيب" },
      { name: "أحمد ر.", location: "بروكلين، نيويورك", text: "تغليف جميل وجودة ممتازة. أرسلت هدية لوالديّ وقد أحبّاها كثيراً.", product: "طلب هدية" },
    ],
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    title: "لديك سؤال؟ لدينا الإجابة.",
    items: [
      { q: "هل توصلون إلى كل الولايات الأمريكية؟", a: "نعم. نوصل إلى جميع الولايات الخمسين بما فيها ألاسكا وهاواي. تصل معظم الطلبات خلال 2–5 أيام عمل." },
      { q: "كيف أقدّم طلبي؟", a: "أضف المنتجات إلى السلة واضغط «إتمام الطلب عبر واتساب»، أو اضغط زر واتساب في أي منتج. سنؤكد الطلب والمبلغ وتفاصيل التوصيل في المحادثة." },
      { q: "هل منتجاتكم طبيعية 100% فعلاً؟", a: "بالتأكيد. الزبيب واللوز والعسل والتمر لدينا خالية من السكر المضاف والمواد الحافظة وأي مكونات صناعية." },
      { q: "كم تكلفة الشحن؟", a: "الشحن مجاني للطلبات فوق 75$. للطلبات الأصغر يتم احتساب سعر ثابت عند التأكيد حسب ولايتك." },
      { q: "كيف أحفظ المنتجات؟", a: "احفظها في مكان بارد وجاف بعيداً عن الشمس. التمر واللوز يبقيان أطزج في الثلاجة. العسل لا يفسد أبداً — والتبلور أمر طبيعي." },
      { q: "ماذا لو لم أكن راضياً؟", a: "تواصل معنا خلال 14 يوماً من الاستلام، وسنستبدل المنتج أو نعيد لك المبلغ كاملاً بكل سرور." },
    ],
  },
  cta: {
    title: "اطلب الآن — توصيل لكل الولايات.",
    subtitle: "راسلنا على واتساب أو اتصل بنا مباشرة. سنعبئ طلبك طازجاً ونشحنه خلال 24 ساعة.",
    whatsapp: "اطلب عبر واتساب",
    call: "اتصل بنا",
  },
  cart: {
    title: "سلة التسوق",
    empty: "سلتك فارغة",
    emptyText: "اكتشف مجموعتنا الطبيعية وأضف منتجاتك المفضلة.",
    browse: "تصفّح المنتجات",
    subtotal: "المجموع الفرعي",
    shippingNote: "يتم احتساب الشحن عند تأكيد الطلب.",
    freeShipLeft: "متبقية للحصول على شحن مجاني",
    freeShipDone: "مبروك! حصلت على شحن مجاني",
    checkout: "إتمام الطلب عبر واتساب",
    remove: "حذف",
    close: "إغلاق السلة",
    clear: "إفراغ السلة",
    orderIntro: "مرحباً البركة للمنتجات الطبيعية، أرغب في طلب:",
    orderTotal: "المجموع",
    orderOutro: "يرجى تأكيد التوصيل إلى عنواني. شكراً لكم!",
  },
  whatsappMsg: {
    product: "مرحباً البركة للمنتجات الطبيعية! أرغب في طلب:",
    general: "مرحباً البركة للمنتجات الطبيعية! أرغب في تقديم طلب.",
    size: "الحجم",
    qty: "الكمية",
  },
  about: {
    metaTitle: "من نحن",
    eyebrow: "قصتنا",
    title: "جذورنا في الأصالة، وخدمتنا بعناية",
    intro: "البركة — بدأت بإيمان بسيط: أن أنقى الأطعمة هي تلك التي أتقنتها الطبيعة. نحمل النكهات التي نشأنا عليها إلى موائد العائلات في كل أمريكا.",
    storyTitle: "من البستان إلى باب بيتك",
    story: [
      "نعمل مع مزارعين ونحّالين يشاركوننا احترام الأرض. كل حبة زبيب مجففة بالشمس، وكل لوزة مقرمشة وكاملة، وكل جرة عسل خام وغير مصفّى، وكل تمرة طرية وحلوة بطبيعتها.",
      "نفحص ونتذوق كل دفعة قبل تعبئتها طازجة عند الطلب، ثم نشحنها بسرعة إلى أي عنوان في الولايات المتحدة. بلا وسطاء ولا رفوف مستودعات طويلة — فقط طعام طبيعي وصادق.",
    ],
    valuesTitle: "ما نؤمن به",
    values: [
      { title: "النقاء", text: "طعام حقيقي بلا إضافات وبلا انتقاص." },
      { title: "الأمانة", text: "أسعار واضحة، ومصادر واضحة، وتواصل حقيقي مع عملائنا." },
      { title: "العناية", text: "نعبئ كل طلب يدوياً وكأنه ذاهب إلى عائلتنا." },
    ],
  },
  contact: {
    metaTitle: "اتصل بنا",
    eyebrow: "تواصل معنا",
    title: "يسعدنا سماعك",
    subtitle: "أسئلة عن طلب، أو بيع بالجملة، أو هدايا؟ أرسل لنا رسالة — نرد عادةً خلال ساعة في أوقات العمل.",
    formTitle: "أرسل رسالة",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف (اختياري)",
    subject: "المنتج المطلوب",
    subjectNone: "استفسار عام",
    message: "الرسالة",
    sendWhatsapp: "أرسل عبر واتساب",
    sendEmail: "أرسل عبر البريد",
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    success: "جارٍ فتح التطبيق لإرسال الرسالة…",
    phonesTitle: "اتصال أو واتساب",
    hoursTitle: "ساعات العمل",
    hours: [
      { day: "الاثنين – الجمعة", time: "9:00 ص – 8:00 م (بتوقيت الشرق)" },
      { day: "السبت", time: "10:00 ص – 6:00 م (بتوقيت الشرق)" },
      { day: "الأحد", time: "12:00 م – 5:00 م (بتوقيت الشرق)" },
    ],
    emailTitle: "البريد الإلكتروني",
    areaTitle: "منطقة الخدمة",
    area: "نشحن إلى جميع الولايات الأمريكية الخمسين",
    msgIntro: "رسالة جديدة من الموقع",
  },
  shipping: {
    metaTitle: "الشحن والإرجاع",
    eyebrow: "السياسات",
    title: "سياسة الشحن والإرجاع",
    subtitle: "واضحة وبسيطة وعادلة — لتطلب بكل ثقة.",
    sections: [
      {
        title: "أين نشحن",
        points: [
          "نشحن إلى جميع الولايات الخمسين، بما فيها ألاسكا وهاواي وعناوين APO/FPO.",
          "تُعبأ الطلبات طازجة وتُرسل خلال 24 ساعة (من الاثنين إلى السبت).",
        ],
      },
      {
        title: "مدة التوصيل",
        points: [
          "الشحن العادي: 2–5 أيام عمل.",
          "الشحن السريع: 1–2 يوم عمل (عند الطلب).",
          "ألاسكا وهاواي: 4–7 أيام عمل.",
        ],
      },
      {
        title: "تكلفة الشحن",
        points: [
          "شحن عادي مجاني لجميع الطلبات فوق 75$.",
          "الطلبات أقل من 75$: سعر ثابت يبدأ من 7.99$ ويُؤكَّد مع إجمالي الطلب.",
          "نرسل رقم تتبع مع كل طلب.",
        ],
      },
      {
        title: "الإرجاع والاسترداد",
        points: [
          "إن لم تكن راضياً تماماً، تواصل معنا خلال 14 يوماً من الاستلام.",
          "المنتجات التالفة أو الخاطئة نستبدلها أو نعيد ثمنها كاملاً — فقط أرسل لنا صورة.",
          "لسلامة الغذاء لا يمكن إعادة بيع المنتجات المفتوحة، لكننا سنجد دائماً حلاً عادلاً.",
          "تتم معالجة المبالغ المستردة خلال 3–5 أيام عمل إلى وسيلة الدفع الأصلية.",
        ],
      },
    ],
    helpTitle: "تحتاج مساعدة في طلبك؟",
    helpText: "فريقنا على بُعد رسالة واحدة.",
  },
  notFound: {
    title: "يبدو أن هذه الصفحة ضلّت الطريق",
    text: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نعيدك إلى شيء حلو.",
    home: "العودة للرئيسية",
    shop: "تصفّح المنتجات",
  },
  footer: {
    about: "زبيب ولوز وعسل وتمر طبيعي فاخر — منتقى يدوياً ويصل طازجاً إلى كل أنحاء الولايات المتحدة.",
    shop: "المتجر",
    company: "الشركة",
    contact: "التواصل",
    rights: "جميع الحقوق محفوظة.",
    made: "صُنع بعناية في الولايات المتحدة.",
    social: "تابعنا",
  },
  common: {
    natural: "طبيعي 100%",
    bestseller: "الأكثر مبيعاً",
    new: "جديد",
    whatsappFloat: "تحدث معنا عبر واتساب",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

/* ═══════════════ 3) روابط التنقل ═══════════════ */
export const navLinks = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
  { href: "/about", key: "about" },
  { href: "/shipping-returns", key: "shipping" },
  { href: "/contact", key: "contact" },
] as const;
