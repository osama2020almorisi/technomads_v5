/* ============================================================
   TechNomads Age Calculator v3.0 - Upcoming Birthdays
   الريادة التقنية اليمنية | Yemen Tech Pioneering
   ============================================================ */

let currentRange = 30;
let countdownInterval = null;
let notificationInterval = null;

// ====== Initialization ======
document.addEventListener('DOMContentLoaded', function() {
    // Range chips
    const rangeChips = document.querySelectorAll('.range-chip');
    rangeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            rangeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentRange = parseInt(chip.dataset.range);
            loadUpcoming();
        });
    });

    // Load data
    loadUpcoming();

    // Notifications
    requestNotificationPermission();
    startNotificationCheck();

    // Start countdown updates
    startCountdownUpdates();
});

// ====== Load Upcoming ======
function loadUpcoming() {
    const list = getBirthdays();
    const container = document.getElementById('upcomingList');
    const badge = document.getElementById('upcomingBadge');

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>لا توجد بيانات لعرضها</p>
            </div>
        `;
        if (badge) badge.textContent = '0';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingList = [];

    list.forEach(item => {
        const birthDate = new Date(item.date);
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (nextBirthday < today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }

        const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= currentRange) {
            const nextAge = nextBirthday.getFullYear() - birthDate.getFullYear();
            upcomingList.push({
                ...item,
                nextBirthday,
                diffDays,
                nextAge
            });
        }
    });

    upcomingList.sort((a, b) => a.diffDays - b.diffDays);

    if (upcomingList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>لا توجد أعياد خلال الـ ${currentRange} يوم القادمة</p>
            </div>
        `;
        if (badge) badge.textContent = '0';
        return;
    }

    if (badge) badge.textContent = upcomingList.length;

    const typeIcons = { person: '👤', animal: '🐾', other: '🎁' };
    const typeNames = { person: 'إنسان', animal: 'حيوان', other: 'آخر' };

    container.innerHTML = upcomingList.map((item, index) => {
        const isUrgent = item.diffDays <= 3 && item.diffDays > 0;
        const isToday = item.diffDays === 0;
        const cardClass = isToday ? 'today' : (isUrgent ? 'urgent' : '');
        const daysClass = isToday ? 'today' : (isUrgent ? 'urgent' : '');

        const daysText = item.diffDays === 0 ? 'اليوم' :
                         item.diffDays === 1 ? 'غداً' :
                         `بعد ${item.diffDays}`;

        const timestamp = item.nextBirthday.getTime();
        const delay = index * 50;

        return `
            <div class="upcoming-card ${cardClass}" style="animation-delay: ${delay}ms">
                <div class="upcoming-card-header">
                    <div class="upcoming-avatar">
                        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : (typeIcons[item.type] || '👤')}
                    </div>
                    <div class="upcoming-info">
                        <div class="upcoming-name">${escapeHtml(item.name)}</div>
                        <div class="upcoming-meta">
                            <span class="upcoming-age">${item.nextAge} سنة</span>
                            <span class="upcoming-type ${item.type}">${typeIcons[item.type]} ${typeNames[item.type]}</span>
                        </div>
                    </div>
                    <div class="upcoming-days ${daysClass}">
                        <span class="days-number">${item.diffDays === 0 ? '🎉' : item.diffDays}</span>
                        <span class="days-label">${daysText}</span>
                    </div>
                </div>
                <div class="upcoming-countdown">
                    <span class="countdown-label">العد التنازلي</span>
                    <span class="countdown-value" data-timestamp="${timestamp}">--:--:--</span>
                </div>
            </div>
        `;
    }).join('');
}

// ====== Countdown Updates ======
function startCountdownUpdates() {
    if (countdownInterval) clearInterval(countdownInterval);

    function updateAllCountdowns() {
        const countdownValues = document.querySelectorAll('.countdown-value');
        if (!countdownValues.length) return;

        const now = new Date().getTime();

        countdownValues.forEach(cell => {
            const timestamp = parseInt(cell.dataset.timestamp);
            if (!timestamp) return;

            const diff = timestamp - now;

            if (diff <= 0) {
                cell.innerHTML = '🎉 الآن!';
                cell.style.color = 'var(--color-success)';
            } else {
                const days = Math.floor(diff / 86400000);
                const hours = Math.floor((diff % 86400000) / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);

                const timeStr = days > 0
                    ? `${days}ي ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
                    : `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
                cell.textContent = timeStr;
            }
        });
    }

    updateAllCountdowns();
    countdownInterval = setInterval(updateAllCountdowns, 1000);
}

// ====== Notifications ======
function requestNotificationPermission() {
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

function checkUpcomingNotifications() {
    if (window.Notification && Notification.permission !== 'granted') return;

    const list = getBirthdays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    list.forEach(item => {
        const bd = new Date(item.date);
        let nextBirthday = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const diffDays = Math.ceil((nextBirthday - today) / 86400000);

        const notificationKey = `notified_${item.id}_${nextBirthday.getTime()}`;
        const alreadyNotified = localStorage.getItem(notificationKey);

        if (diffDays === 1 && !alreadyNotified) {
            new Notification('🎂 عيد ميلاد قريب!', {
                body: `${item.name} سيحتفل بعيد ميلاده غداً!`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039409.png'
            });
            localStorage.setItem(notificationKey, 'true');
        } else if (diffDays === 0 && !alreadyNotified) {
            new Notification('🎉 عيد ميلاد سعيد!', {
                body: `اليوم هو عيد ميلاد ${item.name}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039409.png'
            });
            localStorage.setItem(notificationKey, 'true');
        }
    });
}

function startNotificationCheck() {
    setTimeout(checkUpcomingNotifications, 2000);
    notificationInterval = setInterval(checkUpcomingNotifications, 3600000);
}

// Cleanup
window.addEventListener('beforeunload', function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (notificationInterval) clearInterval(notificationInterval);
});
