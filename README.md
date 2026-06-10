# TechNomads V3 - الريادة التقنية اليمنية

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://technomads-v3.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://technomads-v3.vercel.app)

## 🚀 نظرة عامة

TechNomads هي شركة رائدة في تقديم الحلول التقنية والرقمية في اليمن. هذا المستودع يحتوي على الموقع الرسمي للشركة - منصة متكاملة تعرض خدماتنا، أعمالنا، وفريقنا.

**الرابط المباشر:** [https://technomads-v3.vercel.app](https://technomads-v3.vercel.app)

## ✨ المميزات

- 📱 **تصميم متجاوب** - يعمل على جميع الأجهزة والشاشات
- 🌙 **وضع داكن/فاتح** - مع التبديل التلقائي حسب تفضيل النظام
- ⚡ **PWA** - يمكن تثبيته كتطبيق على الجوال
- 🎨 **رسوم متحركة** - AOS animations و particles.js
- 🔍 **SEO محسن** - Schema.org, Open Graph, Twitter Cards
- 🌐 **RTL كامل** - دعم كامل للغة العربية
- 🚀 **أداء عالي** - lazy loading, preconnect, compression

## 📁 هيكل المشروع

```
technomads-v3/
├── index.html              # الصفحة الرئيسية
├── services.html           # صفحة الخدمات
├── portfolio.html          # معرض الأعمال
├── team.html               # صفحة الفريق
├── contact.html            # صفحة التواصل
├── entertainment/
│   └── play.html           # صفحة الترفيه/التطبيقات
├── cv/
│   └── index.html          # السيرة الذاتية
├── css/
│   ├── main.css            # الأنماط الرئيسية
│   └── portfolio.css       # أنماط معرض الأعمال
├── js/
│   ├── main.js             # الجافاسكريبت الرئيسي
│   └── portfolio.js        # نظام معرض الأعمال
├── projects/               # مجلد المشاريع
│   ├── ecommerce-website/
│   ├── pharmacy-website/
│   ├── booking-system/
│   ├── financial-accountant/
│   ├── health-system/
│   ├── Cinema/
│   ├── travel-agency/
│   ├── app-store/
│   ├── quiz-platform/
│   ├── wit/
│   ├── project-structure/
│   ├── Cleaning Services/
│   ├── delivery-app/
│   ├── educational-app/
│   ├── MedicalAnalysisApp/
│   ├── treemix_app/
│   ├── brand-identity/
│   ├── logo-design/
│   ├── age-calculator/
│   ├── code-editor/
│   ├── color-generator/
│   ├── image-editor/
│   ├── fileuploader/
│   ├── localStorage/
│   ├── wifi-auto-connect/
│   ├── wifi-extractor/
│   ├── memory-game/
│   └── marketing-campaign/
├── images/                 # الصور والأيقونات
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker للـ PWA
├── sitemap.xml             # خريطة الموقع
├── robots.txt              # إرشادات محركات البحث
├── .htaccess               # إعدادات Apache
└── vercel.json             # إعدادات Vercel
```

## 🛠️ التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- HTML5 Semantic
- CSS3 (Variables, Grid, Flexbox, Animations)
- JavaScript (ES6+)
- AOS (Animate On Scroll)
- Particles.js
- Font Awesome 6

### التصميم
- Google Fonts: Tajawal (للعربية)
- CSS Variables للوضع الداكن/الفاتح
- Mobile-first responsive design
- RTL support

### الأداء
- Lazy loading للصور
- Preconnect للموارد الخارجية
- Service Worker للـ offline
- Browser caching
- Gzip compression

## 🚀 التشغيل المحلي

### المتطلبات
- أي متصفح حديث (Chrome, Firefox, Safari, Edge)
- خادم ويب محلي (مثل Live Server في VS Code)

### الخطوات
```bash
# 1. استنساخ المستودع
git clone https://github.com/osama2020almorisi/technomads-v3.git

# 2. الانتقال للمجلد
cd technomads-v3

# 3. تشغيل خادم محلي (مثال باستخدام Python)
python -m http.server 8000

# 4. فتح الموقع
# http://localhost:8000
```

## 📦 النشر (Deployment)

### على Vercel (الموصى به)
```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر
vercel --prod
```

### على Netlify
- اسحب وأفلت المجلد في [Netlify Drop](https://app.netlify.com/drop)
- أو اربط مستودع GitHub

### على Apache/cPanel
1. ارفع الملفات عبر FTP
2. تأكد من تفعيل mod_rewrite
3. ملف `.htaccess` جاهز للاستخدام

## 🔧 الإعدادات

### تغيير معلومات الشركة
في `js/main.js` و `index.html`:
- رقم الهاتف: `+967770200970`
- البريد الإلكتروني: `2025ooss@gmail.com`
- العنوان: صنعاء، اليمن

### تغيير روابط السوشيال ميديا
في جميع الصفحات، ابحث عن:
```html
<a href="https://www.facebook.com/share/1843Km6C4E/">...
<a href="https://www.linkedin.com/in/9o--sa">...
<a href="https://www.instagram.com/9o__sa">...
<a href="https://github.com/osama2020almorisi/">...
```

### إضافة مشروع جديد
في `js/portfolio.js`، أضف إلى `PROJECTS_DB`:
```javascript
{ 
  id: 'project-id', 
  name: 'اسم المشروع', 
  category: 'web', 
  description: 'وصف المشروع', 
  technologies: ['HTML', 'CSS', 'JS'], 
  date: '2024-01-01', 
  featured: true 
}
```

## 📝 SEO Checklist

- [x] عنوان فريد لكل صفحة
- [x] Meta description
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Schema.org JSON-LD
- [x] Canonical URLs
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Semantic HTML
- [x] Alt text للصور
- [x] Lazy loading
- [x] Responsive design

## 🔒 الأمان

- [x] HTTPS forced
- [x] Security headers (XSS, CSRF, Clickjacking)
- [x] Content Security Policy
- [x] Input validation
- [x] Sanitized output

## 📊 التحليلات

Google Analytics 4 مدمج. استبدل `G-XXXXXXXXXX` في `index.html` بـ Measurement ID الخاص بك:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID"></script>
<script>
  gtag('config', 'G-YOUR-ID');
</script>
```

## 🤝 المساهمة

نرحب بمساهماتكم! للمساهمة:
1. Fork المستودع
2. أنشئ فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص بموجب [MIT License](LICENSE).

## 👥 الفريق

- **أسامة منصور المريسي** - مدير الفريق ومطور Full Stack
- **زكريا ناجي المريسي** - مصمم UI/UX
- **عبده ثابت المريسي** - مطور Backend
- **عبدالرحمن المريسي** - مطور Frontend
- **أحمد الجوفي** - خبير أمن معلومات
- **أحمد الوجيه** - مسوق رقمي

## 📞 التواصل

- 📧 البريد: [2025ooss@gmail.com](mailto:2025ooss@gmail.com)
- 📱 الهاتف: [+967770200970](tel:+967770200970)
- 🌐 الموقع: [https://technomads-v3.vercel.app](https://technomads-v3.vercel.app)
- 📍 العنوان: صنعاء، الجمهورية اليمنية

---

<p align="center">
  صُنع بـ ❤️ في اليمن
</p>
'''

with open('/mnt/agents/output/README.md', 'w', encoding='utf-8') as f:
    f.write(readme)

