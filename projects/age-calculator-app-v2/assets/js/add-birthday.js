// assets/js/add-birthday.js - النسخة المحسنة والكاملة

let currentId = null;           // معرف التعديل إن وجد
let tempImage = null;           // تخزين الصورة المؤقتة (Base64)

// ====================== التهيئة ======================
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود id في الرابط (وضع التعديل)
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        currentId = id;
        loadBirthdayData(id);
        document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> تعديل المولود';
    }

    // إضافة مستمع لحدث تغيير الصورة
    document.getElementById('image').addEventListener('change', handleImageUpload);
});

// ====================== تحميل بيانات التعديل ======================
function loadBirthdayData(id) {
    const list = getBirthdays();
    const birthday = list.find(item => item.id == id);
    if (!birthday) {
        alert('البيانات غير موجودة');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('name').value = birthday.name || '';
    document.getElementById('type').value = birthday.type || 'person';
    document.getElementById('date').value = birthday.date || '';
    document.getElementById('time').value = birthday.time || '00:00';
    document.getElementById('notes').value = birthday.notes || '';
    document.getElementById('isRecurring').checked = birthday.isRecurring || false;

    // إذا كانت هناك صورة محفوظة، نعرضها في المعاينة
    if (birthday.image) {
        tempImage = birthday.image;
        showImagePreview(birthday.image);
    }
}

// ====================== معالجة رفع الصورة ======================
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف (صور فقط)
    if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة صالح');
        return;
    }

    // التحقق من الحجم (حد أقصى 2 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        tempImage = ev.target.result;
        showImagePreview(tempImage);
    };
    reader.readAsDataURL(file);
}

// عرض معاينة الصورة
function showImagePreview(imageData) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${imageData}" alt="معاينة">`;
}

// ====================== حفظ البيانات ======================
function saveForm() {
    // التحقق من المدخلات الأساسية
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;

    if (!name) {
        alert('الرجاء إدخال الاسم');
        document.getElementById('name').focus();
        return;
    }

    if (!date) {
        alert('الرجاء إدخال تاريخ الميلاد');
        document.getElementById('date').focus();
        return;
    }

    // تجهيز كائن البيانات
    const data = {
        id: currentId ? parseInt(currentId) : null,
        name: name,
        type: document.getElementById('type').value,
        date: date,
        time: document.getElementById('time').value || '00:00',
        notes: document.getElementById('notes').value.trim(),
        isRecurring: document.getElementById('isRecurring').checked,
        image: tempImage, // قد يكون null إذا لم يتم رفع صورة
        updatedAt: new Date().toISOString()
    };

    // إذا كانت إضافة جديدة، نضيف تاريخ الإنشاء
    if (!currentId) {
        data.createdAt = new Date().toISOString();
    }

    // حفظ البيانات باستخدام الدالة من main.js
    const success = saveBirthday(data);
    if (success) {
        alert(currentId ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        window.location.href = 'index.html';
    }
}