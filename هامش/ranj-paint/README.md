# 🎨 رَنْج - Ranj Paint

> **لمساتك تروي حكاية الجدران**

موقع متكامل لخدمات الدهانات والديكور، مصمم بأحدث المعايير التقنية وقابل للاستضافة المجانية على GitHub Pages.

---

## 📋 المتطلبات

- متصفح حديث (Chrome, Firefox, Safari, Edge)
- لا يحتاج إلى خادم (Static Site)

---

## 🚀 طريقة التشغيل محلياً

### الطريقة الأولى: باستخدام Live Server (VS Code)

1. افتح المجلد في VS Code
2. انقر بزر الماوس الأيمن على `index.html`
3. اختر **"Open with Live Server"**

### الطريقة الثانية: باستخدام Python

```bash
# انتقل إلى مجلد المشروع
cd ranj-paint

# تشغيل خادم HTTP بسيط
python -m http.server 8000

# افتح المتصفح على
# http://localhost:8000
```

### الطريقة الثالثة: باستخدام Node.js

```bash
# تثبيت live-server عالمياً
npm install -g live-server

# تشغيل المشروع
cd ranj-paint
live-server
```

---

## 🌐 رفع الموقع على GitHub Pages

### الخطوة 1: إنشاء مستودع على GitHub

1. سجل دخولك على [GitHub](https://github.com)
2. أنشئ مستودعاً جديداً باسم `ranj-paint` (أو أي اسم)
3. اختر **Public** (مستودع عام)

### الخطوة 2: رفع الملفات

```bash
# انتقل إلى مجلد المشروع
cd ranj-paint

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# حفظ التغييرات
git commit -m "Initial commit - Ranj Paint website"

# ربط المستودع (استبدل USERNAME باسم المستخدم الخاص بك)
git remote add origin https://github.com/USERNAME/ranj-paint.git

# رفع الملفات
git push -u origin main
```

### الخطوة 3: تفعيل GitHub Pages

1. اذهب إلى صفحة المستودع على GitHub
2. اذهب إلى **Settings** → **Pages**
3. في قسم **Source**، اختر:
   - Branch: `main`
   - Folder: `/ (root)`
4. انقر **Save**
5. انتظر 1-2 دقيقة، ثم سيكون موقعك متاحاً على:
   ```
   https://USERNAME.github.io/ranj-paint/
   ```

---

## ⚙️ إعداد Formspree (نموذج التواصل)

1. سجل دخولك على [Formspree](https://formspree.io)
2. أنشئ نموذجاً جديداً
3. احصل على **Form ID** الخاص بك
4. افتح `contact.html` واستبدل:
   ```html
   action="https://formspree.io/f/YOUR_FORMSPREE_ID"
   ```
   بـ:
   ```html
   action="https://formspree.io/f/xnqkvepo"  <!-- مثال -->
   ```
5. أعد رفع الملفات

---

## 📁 هيكل الملفات

```
ranj-paint/
├── index.html          # الصفحة الرئيسية
├── about.html          # من نحن
├── services.html       # الخدمات
├── gallery.html        # معرض الأعمال
├── contact.html        # اتصل بنا
├── css/
│   └── styles.css      # ملف الأنماط الرئيسي
├── js/
│   └── main.js         # ملف الجافاسكربت الرئيسي
├── assets/
│   └── images/         # مجلد الصور (فارغ - نستخدم روابط خارجية)
├── robots.txt          # ملف robots للـ SEO
├── sitemap.xml         # خريطة الموقع
└── README.md           # هذا الملف
```

---

## 🎨 المميزات

- ✅ تصميم عصري ومتجاوب (Mobile-First)
- ✅ تحميل سريع مع تحسين SEO
- ✅ تأثيرات حركية عند التمرير (Scroll Animations)
- ✅ معرض صور مع فلتر تفاعلي وLightbox
- ✅ عداد إنجازات متحرك
- ✅ نموذج تواصل متكامل مع Formspree
- ✅ خريطة Google Maps تفاعلية
- ✅ واجهة مستخدم عربية بالكامل
- ✅ ألوان فاخرة (ذهبي + رمادي داكن + بيج)

---

## 🛠️ التقنيات المستخدمة

- HTML5 Semantic
- CSS3 (Flexbox + Grid + Variables)
- Vanilla JavaScript (ES6+)
- Google Fonts (Tajawal)
- Font Awesome 6
- Formspree API
- Google Maps Embed
- GitHub Pages Hosting

---

## 📞 معلومات التواصل

| البيان | التفاصيل |
|--------|----------|
| الاسم | أسامة منصور المريسي |
| الجوال | +967 770 200 970 |
| البريد | 2025ooss@gmail.com |
| الموقع | https://te-2026.netlify.app/ |

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2026 رَنْج للدهانات والديكور

---

<p align="center">
  <strong>صنع بحب ❤️ في اليمن</strong>
</p>
