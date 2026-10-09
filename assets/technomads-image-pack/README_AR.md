# TechNomads — حزمة صور المشاريع ثلاثية الأبعاد

حزمة صور محلية بصيغة SVG، بطابع تقني ثلاثي الأبعاد وألوان متناسقة، منظّمة لتطابق معرفات المشاريع الموجودة في `portfolio.js`.

## المحتويات
- `images/projects/اسم-المشروع/cover.svg` — صورة الغلاف.
- `images/projects/اسم-المشروع/gallery-1.svg` إلى `gallery-3.svg` — ثلاث صور معرض إضافية.
- `manifest.json` — مسارات جميع المشاريع والصور.
- `images/preview/technomads-portfolio-overview.png` — لوحة معاينة عامة إن توفرت.

**عدد المشاريع:** 67  
**إجمالي الصور:** 268 (4 صور لكل مشروع)

## مثال ربط المسارات في JavaScript
```js
'ecommerce-website': {
  cover: 'images/projects/ecommerce-website/cover.svg',
  gallery: [
    'images/projects/ecommerce-website/gallery-1.svg',
    'images/projects/ecommerce-website/gallery-2.svg',
    'images/projects/ecommerce-website/gallery-3.svg'
  ]
}
```

## ملاحظات
- الصور محلية ولا تعتمد على `picsum.photos` أو اتصال بالإنترنت.
- أسماء المجلدات تطابق معرفات المشاريع، بما فيها الأحرف الكبيرة والشرطة السفلية.
- SVG خفيف وواضح عند التكبير ومتوافق مع المتصفحات الحديثة والهواتف.
- هذه رسومات واجهات تقنية ثلاثية الأبعاد أصلية وليست لقطات شاشة فعلية من التطبيقات.
- ضع مجلد `images` داخل موقعك، ثم عدّل مسارات `cover` و`gallery` في `portfolio.js` حسب المثال.
