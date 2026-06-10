// assets/js/calculator.js - النسخة المحسنة والكاملة

let liveInterval = null;        // معرف العداد الحي
let currentBirthDate = null;    // تخزين تاريخ الميلاد الحالي للعداد

// ====================== التهيئة ======================
document.addEventListener('DOMContentLoaded', function() {
    loadSavedList();

    // التحقق من وجود id في الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        loadBirthdayById(id);
    }

    // استعادة آخر تاريخ محسوب إذا كان موجوداً في sessionStorage (اختياري)
    restoreLastCalculation();
});

// ====================== قائمة السجلات المحفوظة ======================
function loadSavedList() {
    const list = getBirthdays();
    const savedList = document.getElementById('savedList');
    const savedSection = document.getElementById('savedSection');

    if (list.length === 0) {
        savedSection.style.display = 'none';
        return;
    }

    savedSection.style.display = 'block';
    savedList.innerHTML = '<option value="">-- اختر مولوداً --</option>' +
        list.map(item => `<option value="${item.id}">${escapeHtml(item.name)} (${item.date})</option>`).join('');

    savedList.addEventListener('change', function(e) {
        const id = e.target.value;
        if (id) {
            loadBirthdayById(id);
        } else {
            // إذا اختار "-- اختر مولوداً --" نقوم بتفريغ الحقول وإيقاف العداد
            clearFields();
        }
    });
}

function loadBirthdayById(id) {
    const list = getBirthdays();
    const birthday = list.find(item => item.id == id);
    if (!birthday) return;

    document.getElementById('birthDate').value = birthday.date;
    document.getElementById('birthTime').value = birthday.time || '00:00';

    // حساب العمر وعرضه
    calculateAgeUI();

    // تحديث عنوان الصفحة
    document.title = `${birthday.name} - حاسبة العمر`;
}

function clearFields() {
    document.getElementById('birthDate').value = '';
    document.getElementById('birthTime').value = '00:00';
    stopLiveCounter();
    resetResultDisplay();
    document.title = 'حاسبة العمر الذكية';
}

function resetResultDisplay() {
    document.getElementById('yearsValue').innerText = '0';
    document.getElementById('monthsValue').innerText = '0';
    document.getElementById('daysValue').innerText = '0';
    document.getElementById('totalDays').innerText = '0';
    document.getElementById('totalHours').innerText = '0';
    document.getElementById('totalMinutes').innerText = '0';
    document.getElementById('hijriYears').innerText = '0';
    document.getElementById('hijriMonths').innerText = '0';
    document.getElementById('hijriDays').innerText = '0';
    document.getElementById('counterSeconds').innerText = '0';
}

// ====================== حساب العمر وعرضه ======================
function calculateAgeUI() {
    const date = document.getElementById('birthDate').value;
    const time = document.getElementById('birthTime').value || '00:00';

    if (!date) {
        alert('الرجاء إدخال تاريخ الميلاد');
        return;
    }

    const age = calculateAge(date, time);
    if (!age) {
        alert('تاريخ غير صالح');
        return;
    }

    // حفظ تاريخ الميلاد للعداد
    currentBirthDate = age.birthDate;

    // عرض النتيجة الميلادية
    document.getElementById('yearsValue').innerText = age.years;
    document.getElementById('monthsValue').innerText = age.months;
    document.getElementById('daysValue').innerText = age.days;
    document.getElementById('totalDays').innerText = age.totalDays.toLocaleString();
    document.getElementById('totalHours').innerText = age.totalHours.toLocaleString();
    document.getElementById('totalMinutes').innerText = age.totalMinutes.toLocaleString();

    // حساب وعرض العمر الهجري باستخدام الدالة من main.js
    const hijriAge = calculateHijriAge(age.birthDate);
    document.getElementById('hijriYears').innerText = hijriAge.years;
    document.getElementById('hijriMonths').innerText = hijriAge.months;
    document.getElementById('hijriDays').innerText = hijriAge.days;

    // بدء العداد الحي
    startLiveCounter(age.birthDate);

    // حفظ آخر حساب في sessionStorage (اختياري)
    sessionStorage.setItem('lastBirthDate', date);
    sessionStorage.setItem('lastBirthTime', time);
}

// ====================== العداد الحي ======================
function startLiveCounter(birthDate) {
    stopLiveCounter(); // إيقاف أي عداد سابق

    const counterSpan = document.getElementById('counterSeconds');

    function updateCounter() {
        const now = new Date();
        const diffMs = now - birthDate;
        const totalSeconds = Math.floor(diffMs / 1000);
        counterSpan.innerText = totalSeconds.toLocaleString();
    }

    updateCounter(); // تحديث فوري
    liveInterval = setInterval(updateCounter, 1000);
}

function stopLiveCounter() {
    if (liveInterval) {
        clearInterval(liveInterval);
        liveInterval = null;
    }
}

// إيقاف العداد عند مغادرة الصفحة
window.addEventListener('beforeunload', function() {
    stopLiveCounter();
});

// ====================== استعادة آخر عملية حساب (اختياري) ======================
function restoreLastCalculation() {
    const lastDate = sessionStorage.getItem('lastBirthDate');
    const lastTime = sessionStorage.getItem('lastBirthTime');
    if (lastDate) {
        document.getElementById('birthDate').value = lastDate;
        document.getElementById('birthTime').value = lastTime || '00:00';
        calculateAgeUI();
    }
}