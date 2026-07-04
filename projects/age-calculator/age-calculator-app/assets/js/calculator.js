/* ============================================================
   TechNomads Age Calculator v3.0 - Calculator Logic
   الريادة التقنية اليمنية | Yemen Tech Pioneering
   ============================================================ */

let liveInterval = null;
let currentBirthDate = null;

// ====== Initialization ======
document.addEventListener('DOMContentLoaded', function() {
    loadSavedList();

    // Check for ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        loadBirthdayById(id);
    }

    // Restore last calculation
    restoreLastCalculation();
});

// ====== Saved Records List ======
function loadSavedList() {
    const list = getBirthdays();
    const savedList = document.getElementById('savedList');
    const savedSection = document.getElementById('savedSection');

    if (!savedList) return;

    if (list.length === 0) {
        if (savedSection) savedSection.style.display = 'none';
        return;
    }

    if (savedSection) savedSection.style.display = 'block';
    savedList.innerHTML = '<option value="">اختر من السجلات المحفوظة...</option>' +
        list.map(item => `<option value="${item.id}">${escapeHtml(item.name)} (${item.date})</option>`).join('');

    savedList.addEventListener('change', function(e) {
        const id = e.target.value;
        if (id) {
            loadBirthdayById(id);
        } else {
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

    calculateAgeUI();

    // Update page title
    document.title = `${birthday.name} - حاسبة العمر | TechNomads`;
}

function clearFields() {
    document.getElementById('birthDate').value = '';
    document.getElementById('birthTime').value = '00:00';
    stopLiveCounter();
    resetResultDisplay();
    document.title = 'حاسبة العمر | TechNomads';
}

function resetResultDisplay() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = 'none';

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

    const zodiacCard = document.getElementById('zodiacCard');
    if (zodiacCard) zodiacCard.style.display = 'none';
}

// ====== Calculate Age ======
function calculateAgeUI() {
    const date = document.getElementById('birthDate').value;
    const time = document.getElementById('birthTime').value || '00:00';

    if (!date) {
        showToast('الرجاء إدخال تاريخ الميلاد', 'warning');
        return;
    }

    const age = calculateAge(date, time);
    if (!age) {
        showToast('تاريخ غير صالح', 'error');
        return;
    }

    currentBirthDate = age.birthDate;

    // Show results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = 'flex';

    // Gregorian
    document.getElementById('yearsValue').innerText = age.years;
    document.getElementById('monthsValue').innerText = age.months;
    document.getElementById('daysValue').innerText = age.days;
    document.getElementById('totalDays').innerText = age.totalDays.toLocaleString('ar-EG');
    document.getElementById('totalHours').innerText = age.totalHours.toLocaleString('ar-EG');
    document.getElementById('totalMinutes').innerText = age.totalMinutes.toLocaleString('ar-EG');

    // Hijri
    const hijriAge = calculateHijriAge(age.birthDate);
    document.getElementById('hijriYears').innerText = hijriAge.years;
    document.getElementById('hijriMonths').innerText = hijriAge.months;
    document.getElementById('hijriDays').innerText = hijriAge.days;

    // Zodiac
    const zodiac = getZodiacSign(age.birthDate);
    const zodiacCard = document.getElementById('zodiacCard');
    const zodiacIcon = document.getElementById('zodiacIcon');
    const zodiacName = document.getElementById('zodiacName');
    if (zodiacCard && zodiacIcon && zodiacName) {
        zodiacCard.style.display = 'flex';
        zodiacIcon.textContent = zodiac.icon;
        zodiacName.textContent = zodiac.name;
    }

    // Live counter
    startLiveCounter(age.birthDate);

    // Save to session
    sessionStorage.setItem('lastBirthDate', date);
    sessionStorage.setItem('lastBirthTime', time);

    showToast('تم حساب العمر بنجاح', 'success');
}

// ====== Live Counter ======
function startLiveCounter(birthDate) {
    stopLiveCounter();

    const counterSpan = document.getElementById('counterSeconds');
    if (!counterSpan) return;

    function updateCounter() {
        const now = new Date();
        const diffMs = now - birthDate;
        const totalSeconds = Math.floor(diffMs / 1000);
        counterSpan.innerText = totalSeconds.toLocaleString('ar-EG');
    }

    updateCounter();
    liveInterval = setInterval(updateCounter, 1000);
}

function stopLiveCounter() {
    if (liveInterval) {
        clearInterval(liveInterval);
        liveInterval = null;
    }
}

// ====== Restore Last Calculation ======
function restoreLastCalculation() {
    const lastDate = sessionStorage.getItem('lastBirthDate');
    const lastTime = sessionStorage.getItem('lastBirthTime');
    if (lastDate) {
        document.getElementById('birthDate').value = lastDate;
        document.getElementById('birthTime').value = lastTime || '00:00';
        calculateAgeUI();
    }
}

// Cleanup on page leave
window.addEventListener('beforeunload', function() {
    stopLiveCounter();
});
