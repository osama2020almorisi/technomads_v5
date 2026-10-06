# YUNES Travel & Education — الموقع الرسمي

موقع إلكتروني احترافي متعدد الصفحات لمكتب **YUNES Travel & Education**، مبني بـ HTML5 + CSS3 + JavaScript Vanilla فقط، بدون أي إطار عمل أو مكتبة بناء.

---

## ✨ المميزات

- تصميم متجاوب 100% (Mobile-First)
- دعم RTL كامل للغة العربية
- وضع ليلي/نهاري مع حفظ التفضيل في `localStorage`
- سلايدر آراء العملاء بدون مكتبات خارجية
- فلترة وبحث فوري في الوجهات والمدونة
- نموذج طلب خدمة متعدد الخطوات (Wizard)
- تكامل واتساب + بريد إلكتروني + Google Maps
- PWA قابل للتثبيت + Service Worker للعمل دون اتصال
- SEO متقدم: Open Graph + Twitter Cards + Schema Markup
- إمكانية وصول كاملة (WCAG AA)

---

## 📂 هيكل الملفات

| المسار | الوصف |
|---|---|
| `index.html` | الصفحة الرئيسية |
| `about.html` | من نحن |
| `services.html` | الخدمات |
| `destinations.html` | الوجهات مع فلترة |
| `packages.html` | الباقات + جدول مقارنة |
| `blog.html` / `article.html` | المدونة والمقال |
| `faq.html` | الأسئلة الشائعة |
| `contact.html` | تواصل معنا |
| `request.html` | نموذج طلب خدمة |
| `privacy.html` / `terms.html` | صفحات قانونية |
| `404.html` / `thanks.html` | صفحات الحالة |
| `css/style.css` | التنسيقات الأساسية |
| `css/responsive.css` | قواعد الاستجابة |
| `css/dark.css` | الوضع الليلي |
| `js/main.js` | السكربت الرئيسي |
| `js/form.js` | منطق النماذج |
| `js/slider.js` | سلايدر آراء العملاء |
| `js/filter.js` | فلترة الوجهات/المدونة |
| `js/scroll.js` | تأثيرات التمرير |

---

## 🚀 التشغيل محليًا

```bash
# أي طريقة لبدء سيرفر محلي، مثال:
python -m http.server 8080
# أو
npx serve .