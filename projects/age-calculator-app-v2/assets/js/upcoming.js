// assets/js/upcoming.js - النسخة المحسنة والكاملة مع جميع الميزات

let currentRange = 30;                 // النطاق الافتراضي
let countdownInterval = null;          // معرف دالة التحديث الدوري للعدادات
let notificationInterval = null;       // معرف دالة فحص الإشعارات

// ====================== التهيئة ======================
document.addEventListener('DOMContentLoaded', function() {
    // عناصر الصفحة
    const rangeSelect = document.getElementById('range');
    if (rangeSelect) {
        rangeSelect.addEventListener('change', function(e) {
            currentRange = parseInt(e.target.value);
            loadUpcoming();
        });
    }

    // تحميل البيانات أول مرة
    loadUpcoming();

    // طلب إذن الإشعارات وبدء الفحص الدوري
    requestNotificationPermission();
    startNotificationCheck();

    // بدء تحديث العدادات كل ثانية
    startCountdownUpdates();
});

// ====================== دوال تنظيف عند مغادرة الصفحة ======================
window.addEventListener('beforeunload', function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (notificationInterval) clearInterval(notificationInterval);
});

// ====================== تحميل وعرض الأعياد القادمة ======================
function loadUpcoming() {
    const list = getBirthdays();
    const tbody = document.getElementById('upcomingTable');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    <i class="fas fa-smile-wink"></i>
                    لا توجد بيانات لعرضها
                </td>
            </tr>
        `;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingList = [];

    list.forEach(item => {
        const birthDate = new Date(item.date);
        // تاريخ العيد القادم (هذه السنة)
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        // إذا كان قد مضى، نأخذه للعام القادم
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

    // ترتيب حسب الأيام المتبقية (الأقرب أولاً)
    upcomingList.sort((a, b) => a.diffDays - b.diffDays);

    if (upcomingList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    <i class="fas fa-calendar-times"></i>
                    لا توجد أعياد خلال الـ ${currentRange} يوم القادمة
                </td>
            </tr>
        `;
        return;
    }

    // بناء صفوف الجدول
    tbody.innerHTML = upcomingList.map(item => {
        const urgencyClass = item.diffDays <= 3 ? 'urgent' : '';
        const daysText = item.diffDays === 0 ? 'اليوم' :
                         item.diffDays === 1 ? 'غداً' :
                         `بعد ${item.diffDays} يوم`;

        let typeIcon = '';
        let typeName = '';
        switch (item.type) {
            case 'person': typeIcon = '👤'; typeName = 'إنسان'; break;
            case 'animal': typeIcon = '🐾'; typeName = 'حيوان'; break;
            default: typeIcon = '🎁'; typeName = 'آخر';
        }

        // نضيف خاصية data-timestamp لاستخدامها في العد التنازلي
        const timestamp = item.nextBirthday.getTime();

        return `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${item.nextAge} سنة</td>
                <td class="days-remaining ${urgencyClass}">${daysText}</td>
                <td class="countdown" data-timestamp="${timestamp}">
                    <span class="countdown-value">--:--:--</span>
                </td>
                <td>${typeIcon} ${typeName}</td>
            </tr>
        `;
    }).join('');
}

// ====================== العد التنازلي الحي ======================
function startCountdownUpdates() {
    // إذا كان هناك عداد سابق، نوقفه
    if (countdownInterval) clearInterval(countdownInterval);

    function updateAllCountdowns() {
        const countdownCells = document.querySelectorAll('.countdown');
        if (!countdownCells.length) return;

        const now = new Date().getTime();

        countdownCells.forEach(cell => {
            const timestamp = parseInt(cell.dataset.timestamp);
            if (!timestamp) return;

            const diff = timestamp - now;

            if (diff <= 0) {
                // العيد قد حل
                cell.innerHTML = '<span class="urgent">🎉 الآن!</span>';
            } else {
                const days = Math.floor(diff / 86400000);
                const hours = Math.floor((diff % 86400000) / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);

                // تنسيق الوقت (مع الحفاظ على الاتجاه)
                const timeStr = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                cell.innerHTML = `<span class="countdown-timer">${timeStr}</span>`;
            }
        });
    }

    // تحديث فوري
    updateAllCountdowns();

    // تحديث كل ثانية
    countdownInterval = setInterval(updateAllCountdowns, 1000);
}

// ====================== إشعارات سطح المكتب ======================
function requestNotificationPermission() {
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

function checkUpcomingNotifications() {
    // إذا لم يكن الإذن ممنوحاً، نخرج
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

        // نتحقق إذا كنا قد أرسلنا إشعاراً مسبقاً لهذا الحدث (نستخدم localStorage لتجنب التكرار)
        const notificationKey = `notified_${item.id}_${nextBirthday.getTime()}`;
        const alreadyNotified = localStorage.getItem(notificationKey);

        if (diffDays === 1 && !alreadyNotified) {
            // غداً
            new Notification('🎂 عيد ميلاد قريب!', {
                body: `${item.name} سيحتفل بعيد ميلاده غداً!`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039409.png'
            });
            localStorage.setItem(notificationKey, 'true');
        } else if (diffDays === 0 && !alreadyNotified) {
            // اليوم
            new Notification('🎉 عيد ميلاد سعيد!', {
                body: `اليوم هو عيد ميلاد ${item.name}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039409.png'
            });
            localStorage.setItem(notificationKey, 'true');
        }
    });

    // تنظيف الإشعارات القديمة من localStorage (اختياري: نحتفظ بها لمدة يوم مثلاً)
    // يمكن إضافة منطق لمسح المفاتيح التي مضى عليها وقت طويل
}

function startNotificationCheck() {
    // فحص أولي بعد ثانيتين (لإعطاء وقت لتحميل الصفحة)
    setTimeout(checkUpcomingNotifications, 2000);

    // ثم كل ساعة
    notificationInterval = setInterval(checkUpcomingNotifications, 3600000);
}