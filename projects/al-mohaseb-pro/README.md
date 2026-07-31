# المحاسب المالي Pro

## نظام محاسبة متكامل للأعمال

نظام محاسبي احترافي يعمل على المتصفح، مصمم للعالم العربي مع واجهة عربية RTL.

### الميزات

- **لوحة تحكم تفاعلية** - إحصائيات ورسوم بيانية
- **إدارة الفواتير** - إنشاء، تعديل، طباعة، QR Code
- **إدارة العملاء** - سجل كامل للعملاء
- **إدارة المنتجات** - كتالوج منتجات وخدمات
- **إدارة المصروفات** - تتبع التكاليف
- **التقارير المالية** - أرباح/خسائر، مبيعات، مصروفات
- **النسخ الاحتياطي** - تصدير واستيراد البيانات
- **دعم PWA** - يعمل بدون إنترنت
- **تصميم متجاوب** - يعمل على جميع الأجهزة

### البيانات التجريبية

```
البريد: admin@almohaseb.com
كلمة المرور: admin123
```

### الهيكل

```
al-mohaseb-pro/
├── css/
│   └── design-system.css      # نظام التصميم الموحد
├── js/
│   ├── core/
│   │   ├── storage.js         # مدير التخزين
│   │   ├── app.js             # متحكم التطبيق
│   │   └── ui.js              # مدير الواجهة
│   ├── utils/
│   │   └── helpers.js         # دوال مساعدة
│   └── modules/
│       ├── dashboard.js       # لوحة التحكم
│       ├── invoices.js        # الفواتير
│       ├── customers.js       # العملاء
│       ├── products.js        # المنتجات
│       ├── expenses.js        # المصروفات
│       ├── reports.js         # التقارير
│       ├── settings.js        # الإعدادات
│       └── auth.js            # المصادقة
├── pages/
│   ├── dashboard.html
│   ├── invoices/
│   ├── customers/
│   ├── products/
│   ├── expenses/
│   ├── reports/
│   ├── settings/
│   └── auth/
├── index.html                 # صفحة الدخول
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
└── README.md
```

### التشغيل

افتح `index.html` في أي متصفح حديث.

### التقنيات

- HTML5 / CSS3 / JavaScript (Vanilla)
- Chart.js للرسوم البيانية
- IndexedDB + localStorage للتخزين
- Service Worker للعمل بدون إنترنت
