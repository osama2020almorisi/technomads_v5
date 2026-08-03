# ديوان الحكمة — النسخة السحابية

نسخة كاملة تعمل كتطبيق Web RTL، وتدعم:
- Firebase Authentication: Google + Anonymous
- Cloud Firestore
- مزامنة لحظية Real-time
- Firestore offline persistence
- نسخة محلية احتياطية LocalStorage
- إضافة / تعديل / حذف الحكم
- البحث والتصفية والتصنيفات
- المفضلة
- حكمة يومية
- إحصائيات
- وضع ليلي
- تصميم متجاوب للهاتف
- قواعد Firestore و index جاهزان

## 1) إعداد Firebase

1. افتح Firebase Console وأنشئ مشروعاً.
2. أنشئ Web App داخل المشروع.
3. انسخ إعدادات firebaseConfig وضعها في:
   `assets/firebase-config.js`
4. من Authentication → Sign-in method فعّل:
   - Google
   - Anonymous
5. أنشئ Firestore Database.
6. طبّق محتوى `firestore.rules` على Firestore Rules.
7. يمكن نشر `firestore.indexes.json` عبر Firebase CLI.

## 2) التشغيل

لا تفتح `index.html` مباشرة من `file://` إذا أردت اختبار Firebase.
استخدم خادماً محلياً، مثلاً:

Python:
`python -m http.server 8000`

ثم افتح:
`http://localhost:8000`

أو انشر المجلد على Netlify / Firebase Hosting / GitHub Pages.

## 3) ملاحظة مهمة عن البيانات

الاقتباسات السحابية مخزنة بهذا الشكل:

users/{uid}/quotes/{quoteId}

وكل مستخدم يستطيع قراءة وكتابة مجموعته فقط.
القواعد تمنع المستخدم من تعديل بيانات مستخدم آخر.

## 4) نشر Firebase Hosting

بعد تثبيت Firebase CLI:

`firebase login`
`firebase init hosting firestore`
`firebase deploy`

عند اختيار Hosting اجعل مجلد النشر هو مجلد المشروع الذي يحتوي `index.html`.

## 5) Google Authentication

إذا ظهر خطأ `auth/unauthorized-domain`:
أضف نطاق موقعك إلى:
Firebase Console → Authentication → Settings → Authorized domains

## 6) لا تضع Service Account

ملف `firebase-config.js` مخصص لإعدادات Web App العامة. لا تضع فيه private key أو service account credentials.

## الملفات

index.html
assets/style.css
assets/app.js
assets/firebase-config.js
data.json
firestore.rules
firestore.indexes.json
README.md
