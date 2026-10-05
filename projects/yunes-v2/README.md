# YUNES Travel & Education V2

نسخة V2 احترافية قابلة للتطوير لمكتب YUNES Travel & Education.

## تشغيل سريع

يتطلب Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

ثم افتح:

`http://localhost:3000/ar`

## قاعدة البيانات

للاستخدام الكامل:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

بيانات seed تتضمن مستخدم إدارة تجريبيًا:

- Email: `admin@yunes.local`
- Password: `ChangeMe123!`

**غيّر كلمة المرور واحذف هذا الحساب التجريبي قبل الإنتاج.**

## الصفحات

- `/ar` و `/en`
- `/ar/about`
- `/ar/services`
- `/ar/destinations`
- `/ar/packages`
- `/ar/blog`
- `/ar/faq`
- `/ar/contact`
- `/ar/request`
- `/ar/privacy`
- `/ar/terms`
- `/admin/login`
- `/admin/dashboard`

## API

- `POST /api/requests`
- `POST /api/contact`
- `GET /api/health`

## بيانات التواصل

WhatsApp: +967770200970

Email: 2025ooss@gmail.com

## الإنتاج

1. أنشئ PostgreSQL على Railway أو Supabase.
2. أضف `DATABASE_URL` في Vercel.
3. أضف مفاتيح Resend/Cloudinary/reCAPTCHA عند تفعيلها.
4. شغّل `npm run build` محليًا قبل النشر.
5. استخدم `npx prisma migrate deploy` في بيئة الإنتاج.

## ملاحظات إطلاق مهمة

هذه النسخة تحتوي على واجهة فعلية ومكونات تشغيلية وقاعدة بيانات وAPI، لكنها لا تعتبر نظامًا ماليًا أو نظام حجز مباشر مع شركات الطيران. أي ربط مع GDS أو بوابة دفع أو حسابات اجتماعية يحتاج مفاتيح وحسابات مزود حقيقية.
