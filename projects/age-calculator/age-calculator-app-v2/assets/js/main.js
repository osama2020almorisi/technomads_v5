// assets/js/main.js - النسخة المنظمة والكاملة

// ====================== الأساسيات ======================
function getBirthdays() {
    try {
        return JSON.parse(localStorage.getItem('birthdays')) || [];
    } catch (e) {
        console.error('خطأ في قراءة البيانات:', e);
        return [];
    }
}

function saveBirthday(data) {
    if (!data.name || !data.date) {
        alert('الرجاء إدخال الاسم والتاريخ على الأقل');
        return false;
    }
    let list = getBirthdays();
    if (!data.id) {
        data.id = Date.now();
        list.push(data);
    } else {
        list = list.map(item => item.id == data.id ? data : item);
    }
    localStorage.setItem('birthdays', JSON.stringify(list));
    return true;
}

function deleteBirthday(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    let list = getBirthdays().filter(item => item.id != id);
    localStorage.setItem('birthdays', JSON.stringify(list));
    if (typeof loadTable === 'function') loadTable();
    else window.location.href = 'index.html';
}

// ====================== حساب العمر ======================
function calculateAge(dateString, timeString = '00:00') {
    const birthDate = new Date(dateString + 'T' + timeString);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return null;

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const diffMs = today - birthDate;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalSeconds = Math.floor(diffMs / 1000);

    return { years, months, days, totalDays, totalHours, totalMinutes, totalSeconds, birthDate, today };
}

function formatAge(age) {
    if (!age) return 'تاريخ غير صالح';
    return `${age.years} سنة و ${age.months} شهر و ${age.days} يوم`;
}

// ====================== التنقل ======================
function goAdd(id) {
    window.location.href = id ? `add-birthday.html?id=${id}` : 'add-birthday.html';
}

function viewBirthday(id) {
    window.location.href = `calculator.html?id=${id}`;
}

// ====================== عرض الجدول (مع التصفية والترتيب) ======================
let currentSort = { column: 'name', order: 'asc' };
let currentFilteredList = [];

function loadTable() {
    const list = getBirthdays();
    document.getElementById('totalRecords').innerText = list.length;
    updateStatistics(list);
    currentFilteredList = [...list]; // نسخة للتصفية
    renderTable(currentFilteredList);
}

function renderTable(list) {
    const tbody = document.querySelector('#birthdayTable tbody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-message"><i class="fas fa-smile-wink"></i> لا توجد بيانات حالياً، أضف مولودك الأول!</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const age = calculateAge(item.date, item.time || '00:00');
        const ageText = item.isRecurring ? '🎉 حدث سنوي' : (age ? formatAge(age) : '--');
        const imageHtml = item.image ? `<img src="${item.image}" class="table-image">` : '';
        return `
            <tr data-id="${item.id}">
                <td>${imageHtml} ${escapeHtml(item.name)}</td>
                <td>${formatDate(item.date)} ${item.time ? escapeHtml(item.time) : ''}</td>
                <td>${ageText}</td>
                <td>
                    <button class="action-btn edit" onclick="goAdd(${item.id})" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteBirthday(${item.id})" title="حذف"><i class="fas fa-trash-alt"></i></button>
                    <button class="action-btn view" onclick="viewBirthday(${item.id})" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                    <button class="action-btn share" onclick="shareBirthday(${item.id})" title="مشاركة"><i class="fab fa-whatsapp"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// ====================== تصفية وترتيب ======================
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const list = getBirthdays();

    currentFilteredList = list.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.date.includes(searchTerm);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // تطبيق الترتيب الحالي على القائمة المفلترة
    sortTable(currentSort.column, currentSort.order, false); // false يعني لا تغير currentSort
}

function sortTable(column, order, updateSortState = true) {
    if (updateSortState) {
        currentSort = { column, order };
    }
    const list = [...currentFilteredList]; // نعمل على القائمة المفلترة
    list.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        if (column === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        if (order === 'asc') return valA > valB ? 1 : -1;
        else return valA < valB ? 1 : -1;
    });
    renderTable(list);
}

// ربط أحداث التصفية والترتيب بعد تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', filterTable);
    document.getElementById('typeFilter')?.addEventListener('change', filterTable);
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            const order = currentSort.column === column && currentSort.order === 'asc' ? 'desc' : 'asc';
            sortTable(column, order);
        });
    });
});

// ====================== إحصائيات ======================
function updateStatistics(list) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = list.filter(item => {
        const bd = new Date(item.date);
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next.setFullYear(next.getFullYear() + 1);
        return Math.ceil((next - today) / 86400000) <= 30;
    });
    document.getElementById('upcomingCount').innerText = upcoming.length;

    let nearest = null, nearestDays = Infinity;
    list.forEach(item => {
        const bd = new Date(item.date);
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next.setFullYear(next.getFullYear() + 1);
        const diff = Math.ceil((next - today) / 86400000);
        if (diff < nearestDays) {
            nearestDays = diff;
            nearest = item.name;
        }
    });
    document.getElementById('nearestBirthday').innerText = nearest ? `${nearest} (بعد ${nearestDays} يوم)` : '-';
}

// ====================== التاريخ الهجري ======================
function gregorianToHijri(date) {
    const gregYear = date.getFullYear();
    const dayOfYear = Math.floor((date - new Date(gregYear, 0, 0)) / 86400000);
    const hijriYear = Math.floor((gregYear - 622) * (33 / 32));
    const hijriDay = (dayOfYear % 354) + 1;
    const hijriMonth = Math.floor((hijriDay - 1) / 29.5);
    const monthNames = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
    return {
        year: hijriYear,
        month: Math.min(hijriMonth, 11) + 1,
        day: Math.floor(hijriDay - (hijriMonth * 29.5)) + 1,
        monthName: monthNames[Math.min(hijriMonth, 11)]
    };
}

function calculateHijriAge(birthDate) {
    const hijriBirth = gregorianToHijri(birthDate);
    const hijriToday = gregorianToHijri(new Date());
    let years = hijriToday.year - hijriBirth.year;
    let months = hijriToday.month - hijriBirth.month;
    let days = hijriToday.day - hijriBirth.day;
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    return { years, months, days };
}

// ====================== احتفالية ======================
function checkTodayBirthdays() {
    const list = getBirthdays();
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayBirthdays = list.filter(item => {
        const bd = new Date(item.date);
        return bd.getMonth() === todayMonth && bd.getDate() === todayDay;
    });
    if (todayBirthdays.length > 0) showCelebration(todayBirthdays);
}

function showCelebration(birthdays) {
    const names = birthdays.map(b => b.name).join('، ');
    const div = document.createElement('div');
    div.className = 'celebration-popup';
    div.innerHTML = `
        <div class="celebration-content">
            <i class="fas fa-birthday-cake"></i>
            <h2>🎉 عيد ميلاد سعيد! 🎉</h2>
            <p>اليوم هو عيد ميلاد: ${names}</p>
            <button onclick="this.parentElement.parentElement.remove()">إغلاق</button>
        </div>
    `;
    document.body.appendChild(div);
}

// ====================== الوضع الليلي ======================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            btn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }
}

// ====================== تصدير واستيراد ======================
function exportData() {
    const data = getBirthdays();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthdays-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('importFile').click();
}

document.getElementById('importFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const data = JSON.parse(ev.target.result);
            localStorage.setItem('birthdays', JSON.stringify(data));
            alert('تم استيراد البيانات بنجاح!');
            if (typeof loadTable === 'function') loadTable();
        } catch (err) {
            alert('خطأ في قراءة الملف: ' + err.message);
        }
    };
    reader.readAsText(file);
});

// ====================== مشاركة عبر واتساب ======================
function shareBirthday(id) {
    const item = getBirthdays().find(b => b.id == id);
    if (!item) return;
    const today = new Date();
    const bd = new Date(item.date);
    let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    const diff = Math.ceil((next - today) / 86400000);
    const text = `🎂 عيد ميلاد ${item.name} ${diff === 0 ? 'اليوم' : `بعد ${diff} يوم`}!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// ====================== الرسم البياني ======================
function renderChart() {
    const list = getBirthdays();
    const ageGroups = { '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41+': 0 };
    list.forEach(item => {
        if (item.isRecurring) return;
        const age = calculateAge(item.date).years;
        if (age <= 10) ageGroups['0-10']++;
        else if (age <= 20) ageGroups['11-20']++;
        else if (age <= 30) ageGroups['21-30']++;
        else if (age <= 40) ageGroups['31-40']++;
        else ageGroups['41+']++;
    });

    const ctx = document.getElementById('ageChart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'عدد المواليد',
                data: Object.values(ageGroups),
                backgroundColor: '#4361ee'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// استدعاء الرسم البياني بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderChart === 'function') renderChart();
});

// ====================== دوال مساعدة ======================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}