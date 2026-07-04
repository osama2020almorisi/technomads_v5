/* ============================================================
   TechNomads Age Calculator v3.0 - Add/Edit Birthday Form
   الريادة التقنية اليمنية | Yemen Tech Pioneering
   ============================================================ */

let currentId = null;
let tempImage = null;

// ====== Initialization ======
document.addEventListener('DOMContentLoaded', function() {
    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        currentId = id;
        loadBirthdayData(id);
        updateEditMode();
    }

    // Image upload
    initImageUpload();
});

function updateEditMode() {
    const formTitle = document.getElementById('formTitle');
    const pageTag = document.getElementById('pageTag');
    const formHeroIcon = document.getElementById('formHeroIcon');
    const submitText = document.getElementById('submitText');

    if (formTitle) formTitle.textContent = 'تعديل بيانات المولود';
    if (pageTag) pageTag.textContent = 'تعديل مولود';
    if (formHeroIcon) formHeroIcon.className = 'fas fa-edit';
    if (submitText) submitText.textContent = 'حفظ التعديلات';
}

// ====== Load Birthday Data ======
function loadBirthdayData(id) {
    const list = getBirthdays();
    const birthday = list.find(item => item.id == id);
    if (!birthday) {
        showToast('البيانات غير موجودة', 'error');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('name').value = birthday.name || '';
    document.getElementById('type').value = birthday.type || 'person';
    document.getElementById('date').value = birthday.date || '';
    document.getElementById('time').value = birthday.time || '00:00';
    document.getElementById('notes').value = birthday.notes || '';
    document.getElementById('isRecurring').checked = birthday.isRecurring || false;

    if (birthday.image) {
        tempImage = birthday.image;
        showImagePreview(birthday.image);
    }
}

// ====== Image Upload ======
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('image');
    const removeBtn = document.getElementById('removeImage');

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', (e) => {
            if (e.target.closest('.remove-image')) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', handleImageUpload);
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage();
        });
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('الرجاء اختيار ملف صورة صالح', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        tempImage = ev.target.result;
        showImagePreview(tempImage);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageData) {
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = imageData;
}

function removeImage() {
    tempImage = null;
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview = document.getElementById('uploadPreview');
    const fileInput = document.getElementById('image');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// ====== Save Form ======
function saveForm() {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;

    if (!name) {
        showToast('الرجاء إدخال الاسم', 'error');
        document.getElementById('name').focus();
        return;
    }

    if (!date) {
        showToast('الرجاء إدخال تاريخ الميلاد', 'error');
        document.getElementById('date').focus();
        return;
    }

    const data = {
        id: currentId ? parseInt(currentId) : null,
        name: name,
        type: document.getElementById('type').value,
        date: date,
        time: document.getElementById('time').value || '00:00',
        notes: document.getElementById('notes').value.trim(),
        isRecurring: document.getElementById('isRecurring').checked,
        image: tempImage,
        updatedAt: new Date().toISOString()
    };

    if (!currentId) {
        data.createdAt = new Date().toISOString();
    }

    const success = saveBirthday(data);
    if (success) {
        showToast(currentId ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
}
