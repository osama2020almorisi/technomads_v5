/* ============================================================
   TechNomads Age Calculator v3.0 - Core Engine
   الريادة التقنية اليمنية | Yemen Tech Pioneering
   ============================================================ */

// ====== Global State ======
let currentSort = { column: 'name', order: 'asc' };
let currentFilter = 'all';
let currentSearch = '';
let deleteTargetId = null;
let chartInstance = null;

// ====== Initialization ======
function initApp() {
    // Loading screen
    setTimeout(() => {
        const loader = document.getElementById('loadingScreen');
        if (loader) loader.classList.add('hidden');
    }, 1500);

    // Theme
    initTheme();

    // Navigation
    initNavigation();

    // Search & Filter
    initSearchFilter();

    // Sort
    initSort();

    // Load data
    if (document.getElementById('recordsList')) loadRecords();
    if (document.getElementById('ageChart')) renderChart();
    if (typeof checkTodayBirthdays === 'function') checkTodayBirthdays();

    // Update stats
    updateStats();
}

// ====== Theme System ======
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const btn = document.getElementById('themeToggle');
    if (btn) {
        updateThemeIcon(savedTheme);
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = theme === 'light'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
}

// ====== Navigation ======
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navDrawer = document.getElementById('navDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');

    if (menuToggle && navDrawer) {
        menuToggle.addEventListener('click', () => {
            navDrawer.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });
        if (drawerOverlay) {
            drawerOverlay.addEventListener('click', () => {
                navDrawer.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        }
    }

    // Close drawer on link click
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navDrawer) navDrawer.classList.remove('open');
            if (menuToggle) menuToggle.classList.remove('active');
        });
    });
}

// ====== Search & Filter ======
function initSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const chips = document.querySelectorAll('.chip');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase().trim();
            if (searchClear) {
                searchClear.classList.toggle('visible', currentSearch.length > 0);
            }
            loadRecords();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
                searchClear.classList.remove('visible');
                loadRecords();
                searchInput.focus();
            }
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            loadRecords();
        });
    });
}

// ====== Sort ======
function initSort() {
    const sortBtn = document.getElementById('sortBtn');
    const sortMenu = document.getElementById('sortMenu');

    if (sortBtn && sortMenu) {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortBtn.closest('.sort-dropdown').classList.toggle('open');
        });

        sortMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSort = {
                    column: btn.dataset.sort,
                    order: btn.dataset.order
                };
                sortBtn.closest('.sort-dropdown').classList.remove('open');
                loadRecords();
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sort-dropdown')) {
                document.querySelectorAll('.sort-dropdown').forEach(d => d.classList.remove('open'));
            }
        });
    }
}

// ====== Data Management ======
function getBirthdays() {
    try {
        return JSON.parse(localStorage.getItem('birthdays')) || [];
    } catch (e) {
        console.error('Error reading data:', e);
        return [];
    }
}

function saveBirthday(data) {
    if (!data.name || !data.date) {
        showToast('الرجاء إدخال الاسم والتاريخ', 'error');
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
    deleteTargetId = id;
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.add('active');
}

function confirmDelete() {
    if (deleteTargetId === null) return;
    let list = getBirthdays().filter(item => item.id != deleteTargetId);
    localStorage.setItem('birthdays', JSON.stringify(list));
    deleteTargetId = null;
    closeConfirmModal();
    loadRecords();
    updateStats();
    showToast('تم الحذف بنجاح', 'success');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    deleteTargetId = null;
}

// Bind confirm delete button
document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDelete);
});

// ====== Age Calculation ======
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

// ====== Hijri Conversion ======
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

// ====== Zodiac Sign ======
function getZodiacSign(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const signs = [
        { name: 'الجدي', icon: '♑', start: [1, 1], end: [1, 19] },
        { name: 'الدلو', icon: '♒', start: [1, 20], end: [2, 18] },
        { name: 'الحوت', icon: '♓', start: [2, 19], end: [3, 20] },
        { name: 'الحمل', icon: '♈', start: [3, 21], end: [4, 19] },
        { name: 'الثور', icon: '♉', start: [4, 20], end: [5, 20] },
        { name: 'الجوزاء', icon: '♊', start: [5, 21], end: [6, 20] },
        { name: 'السرطان', icon: '♋', start: [6, 21], end: [7, 22] },
        { name: 'الأسد', icon: '♌', start: [7, 23], end: [8, 22] },
        { name: 'العذراء', icon: '♍', start: [8, 23], end: [9, 22] },
        { name: 'الميزان', icon: '♎', start: [9, 23], end: [10, 22] },
        { name: 'العقرب', icon: '♏', start: [10, 23], end: [11, 21] },
        { name: 'القوس', icon: '♐', start: [11, 22], end: [12, 21] },
        { name: 'الجدي', icon: '♑', start: [12, 22], end: [12, 31] }
    ];
    return signs.find(s => {
        const startM = s.start[0], startD = s.start[1];
        const endM = s.end[0], endD = s.end[1];
        if (month === startM && day >= startD) return true;
        if (month === endM && day <= endD) return true;
        return false;
    }) || signs[0];
}

// ====== Records Loading ======
function loadRecords() {
    const container = document.getElementById('recordsList');
    if (!container) return;

    const list = getBirthdays();
    let filtered = list;

    // Apply search
    if (currentSearch) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(currentSearch) ||
            item.date.includes(currentSearch)
        );
    }

    // Apply filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(item => item.type === currentFilter);
    }

    // Apply sort
    filtered.sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];
        if (currentSort.column === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        if (currentSort.order === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-smile-wink"></i>
                <p>لا توجد بيانات حالياً، أضف مولودك الأول!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((item, index) => {
        const age = calculateAge(item.date, item.time || '00:00');
        const ageText = item.isRecurring ? '🎉 حدث سنوي' : (age ? formatAge(age) : '--');
        const typeIcons = { person: '👤', animal: '🐾', other: '🎁' };
        const typeNames = { person: 'إنسان', animal: 'حيوان', other: 'آخر' };
        const delay = index * 50;

        return `
            <div class="record-card" style="animation-delay: ${delay}ms">
                <div class="record-card-inner">
                    <div class="record-avatar">
                        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : typeIcons[item.type] || '👤'}
                    </div>
                    <div class="record-info">
                        <div class="record-name">${escapeHtml(item.name)}</div>
                        <div class="record-meta">
                            <span class="record-date"><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
                            <span class="record-age">${ageText}</span>
                            <span class="record-type ${item.type}">${typeIcons[item.type]} ${typeNames[item.type]}</span>
                        </div>
                    </div>
                    <div class="record-actions">
                        <button class="record-action view" onclick="viewBirthday(${item.id})" title="عرض"><i class="fas fa-eye"></i></button>
                        <button class="record-action edit" onclick="goAdd(${item.id})" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button class="record-action share" onclick="shareBirthday(${item.id})" title="مشاركة"><i class="fab fa-whatsapp"></i></button>
                        <button class="record-action delete" onclick="deleteBirthday(${item.id})" title="حذف"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ====== Statistics ======
function updateStats() {
    const list = getBirthdays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total records
    const totalEl = document.getElementById('totalRecords');
    if (totalEl) totalEl.textContent = list.length;

    // Upcoming count
    const upcoming = list.filter(item => {
        const bd = new Date(item.date);
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next.setFullYear(next.getFullYear() + 1);
        return Math.ceil((next - today) / 86400000) <= 30;
    });
    const upcomingEl = document.getElementById('upcomingCount');
    if (upcomingEl) upcomingEl.textContent = upcoming.length;

    // Nearest birthday
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
    const nearestEl = document.getElementById('nearestBirthday');
    if (nearestEl) nearestEl.textContent = nearest ? `${escapeHtml(nearest)}` : '-';
}

// ====== Chart ======
function renderChart() {
    const canvas = document.getElementById('ageChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const list = getBirthdays();
    const ageGroups = { '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41+': 0 };
    list.forEach(item => {
        if (item.isRecurring) return;
        const age = calculateAge(item.date);
        if (!age) return;
        const y = age.years;
        if (y <= 10) ageGroups['0-10']++;
        else if (y <= 20) ageGroups['11-20']++;
        else if (y <= 30) ageGroups['21-30']++;
        else if (y <= 40) ageGroups['31-40']++;
        else ageGroups['41+']++;
    });

    if (chartInstance) chartInstance.destroy();

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'عدد المواليد',
                data: Object.values(ageGroups),
                backgroundColor: [
                    'rgba(99,102,241,0.8)',
                    'rgba(139,92,246,0.8)',
                    'rgba(236,72,153,0.8)',
                    'rgba(245,158,11,0.8)',
                    'rgba(16,185,129,0.8)'
                ],
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    titleFont: { family: 'Tajawal', size: 14 },
                    bodyFont: { family: 'Tajawal', size: 13 },
                    padding: 12,
                    cornerRadius: 12,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.1)' },
                    ticks: { font: { family: 'Tajawal' }, color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Tajawal' }, color: '#94a3b8' }
                }
            }
        }
    });
}

// ====== Navigation Actions ======
function goAdd(id) {
    window.location.href = id ? `add-birthday.html?id=${id}` : 'add-birthday.html';
}

function viewBirthday(id) {
    window.location.href = `calculator.html?id=${id}`;
}

// ====== Share ======
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

// ====== Export/Import ======
function exportData() {
    const data = getBirthdays();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthdays-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير البيانات بنجاح', 'success');
}

function importData() {
    const input = document.getElementById('importFile');
    if (input) input.click();
}

document.addEventListener('DOMContentLoaded', () => {
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const data = JSON.parse(ev.target.result);
                    localStorage.setItem('birthdays', JSON.stringify(data));
                    showToast('تم استيراد البيانات بنجاح!', 'success');
                    loadRecords();
                    updateStats();
                    if (chartInstance) renderChart();
                } catch (err) {
                    showToast('خطأ في قراءة الملف', 'error');
                }
            };
            reader.readAsText(file);
            this.value = '';
        });
    }
});

// ====== Celebration ======
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
    const modal = document.getElementById('celebrationModal');
    const text = document.getElementById('celebrationText');
    const container = document.getElementById('confettiContainer');

    if (text) text.textContent = `اليوم هو عيد ميلاد: ${names}`;

    // Generate confetti
    if (container) {
        container.innerHTML = '';
        const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
        for (let i = 0; i < 30; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 2 + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(piece);
        }
    }

    if (modal) modal.classList.add('active');
}

function closeCelebration() {
    const modal = document.getElementById('celebrationModal');
    if (modal) modal.classList.remove('active');
}

// ====== Toast System ======
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
        <div class="toast-message">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
}

// ====== Utilities ======
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
