// مدير الأدوية المتقدم - نظام الشرائط المرئية

let medicines = [];
let notificationInterval;
let currentFilter = 'all';

// تحميل البيانات عند بدء الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
    updateStats();
    checkForNotifications();
    
    // حساب إجمالي الجرعات تلقائياً
    const pillsPerStrip = document.getElementById('pillsPerStrip');
    const numberOfStrips = document.getElementById('numberOfStrips');
    const totalDosesDisplay = document.getElementById('totalDosesDisplay');
    
    function updateTotalDoses() {
        const total = (parseInt(pillsPerStrip.value) || 0) * (parseInt(numberOfStrips.value) || 0);
        totalDosesDisplay.value = total + ' جرعة';
    }
    
    pillsPerStrip.addEventListener('input', updateTotalDoses);
    numberOfStrips.addEventListener('input', updateTotalDoses);
    
    notificationInterval = setInterval(() => {
        checkForNotifications();
        updateStats();
    }, 60000);
    
    document.getElementById('medicineForm').addEventListener('submit', saveMedicine);
});

// تحميل الأدوية من localStorage
function loadMedicines() {
    const saved = localStorage.getItem('medicines');
    if (saved) {
        medicines = JSON.parse(saved);
    } else {
        // بيانات تجريبية - علاج المعدة
        medicines = [
            {
                id: Date.now(),
                patientName: 'أحمد محمد',
                medicineName: 'علاج المعدة (أموكسيسيلين)',
                medicineType: 'tablet',
                medicineColor: '#4caf50',
                medicineImage: '',
                pillsPerStrip: 7,
                numberOfStrips: 2,
                totalDoses: 14,
                dosesHistory: {}, // تخزين تواريخ أخذ الجرعات
                schedule: [
                    { time: '09:00', label: 'صباحاً - بعد الإفطار' },
                    { time: '21:00', label: 'مساءً - بعد العشاء' }
                ],
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                instructions: 'يؤخذ بعد الأكل مع كوب ماء. مدة العلاج 14 يوماً متواصلة.',
                notificationsEnabled: true,
                lastUpdated: new Date().toISOString()
            }
        ];
        saveToLocalStorage();
    }
    renderMedicines();
}

// حفظ البيانات
function saveToLocalStorage() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
}

// عرض الأدوية مع الشرائط
function renderMedicines() {
    const grid = document.getElementById('medicinesGrid');
    if (!grid) return;
    
    if (medicines.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <p>لا توجد أدوية. أضف دواء جديد لبدء المتابعة</p>
                <button class="btn-add-medicine" onclick="openMedicineModal()">إضافة دواء جديد</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = medicines.map(medicine => createMedicineCard(medicine)).join('');
}

// إنشاء بطاقة دواء مع شريط مرئي
function createMedicineCard(medicine) {
    const totalPills = medicine.totalDoses;
    const takenCount = getTakenCountToday(medicine);
    const remaining = totalPills - takenCount;
    const progressPercent = (takenCount / totalPills) * 100;
    
    // تحديد شكل الحبة حسب النوع
    const pillClass = medicine.medicineType === 'capsule' ? 'capsule' : '';
    
    // عرض الحبات في الشريط (عرض أول 7 حبات في البطاقة)
    const pillsToShow = Math.min(medicine.pillsPerStrip, 14);
    let pillsHtml = '';
    
    for (let i = 0; i < pillsToShow; i++) {
        const isTaken = isPillTakenForToday(medicine, i);
        pillsHtml += `
            <div class="pill ${pillClass} ${isTaken ? 'taken' : ''}" 
                 style="background: linear-gradient(135deg, ${medicine.medicineColor}, ${lightenColor(medicine.medicineColor, 20)})"
                 data-pill-index="${i}"
                 onclick="takePillFromCard(${medicine.id}, ${i})">
                <span class="pill-number">${i + 1}</span>
            </div>
        `;
    }
    
    // عرض مواعيد الجرعات
    const scheduleHtml = medicine.schedule.map(s => `
        <span><i class="fas fa-clock"></i> ${s.time} - ${s.label}</span>
    `).join('');
    
    return `
        <div class="medicine-card" data-id="${medicine.id}">
            <div class="card-header">
                <h3><i class="fas ${medicine.medicineType === 'liquid' ? 'fa-flask' : 'fa-capsules'}"></i> ${medicine.medicineName}</h3>
                <div class="patient-badge">
                    <i class="fas fa-user"></i> ${medicine.patientName}
                </div>
            </div>
            
            <div class="strip-container">
                <div class="strip">
                    <div class="strip-title">
                        <i class="fas fa-square"></i> شريط الدواء (${medicine.pillsPerStrip} حبة)
                    </div>
                    <div class="pills-grid">
                        ${pillsHtml}
                    </div>
                </div>
            </div>
            
            <div class="dose-info">
                <div class="dose-time">
                    ${scheduleHtml}
                </div>
                <div class="progress-info">
                    <span>${takenCount}/${totalPills}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn-take" onclick="takeMedicineFull(${medicine.id})">
                    <i class="fas fa-check"></i> تسجيل جرعة اليوم
                </button>
                <button class="btn-details" onclick="showDetails(${medicine.id})">
                    <i class="fas fa-eye"></i> عرض الشريط كاملاً
                </button>
                <button class="btn-edit" onclick="editMedicine(${medicine.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteMedicine(${medicine.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// أخذ حبة محددة من البطاقة
function takePillFromCard(medicineId, pillIndex) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    // تحديد أي وقت جرعة (صباحي أو مسائي)
    let doseType = 'morning';
    if (medicine.schedule.length > 1) {
        doseType = currentHour < 15 ? 'morning' : 'evening';
    }
    
    const doseKey = `${today}_${doseType}`;
    
    if (medicine.dosesHistory && medicine.dosesHistory[doseKey]) {
        showToastMessage('⚠️ تم أخذ هذه الجرعة مسبقاً اليوم', 'warning');
        return;
    }
    
    if (!medicine.dosesHistory) medicine.dosesHistory = {};
    medicine.dosesHistory[doseKey] = {
        takenAt: new Date().toISOString(),
        pillIndex: pillIndex
    };
    
    medicine.lastUpdated = new Date().toISOString();
    saveToLocalStorage();
    renderMedicines();
    updateStats();
    
    showToastMessage(`✓ تم تسجيل جرعة ${medicine.medicineName} (${doseType === 'morning' ? 'صباحاً' : 'مساءً'})`, 'success');
    
    // تأثير بصري إضافي
    const pillElement = document.querySelector(`.pill[data-pill-index="${pillIndex}"]`);
    if (pillElement) {
        pillElement.classList.add('taking');
        setTimeout(() => {
            pillElement.classList.remove('taking');
        }, 300);
    }
}

// تسجيل جرعة كاملة لليوم
function takeMedicineFull(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    const today = new Date().toISOString().split('T')[0];
    let takenAny = false;
    
    medicine.schedule.forEach((s, index) => {
        const doseKey = `${today}_${index === 0 ? 'morning' : 'evening'}`;
        if (!medicine.dosesHistory || !medicine.dosesHistory[doseKey]) {
            if (!medicine.dosesHistory) medicine.dosesHistory = {};
            medicine.dosesHistory[doseKey] = {
                takenAt: new Date().toISOString(),
                auto: true
            };
            takenAny = true;
        }
    });
    
    if (takenAny) {
        saveToLocalStorage();
        renderMedicines();
        updateStats();
        showToastMessage(`✓ تم تسجيل جرعات اليوم لـ ${medicine.medicineName}`, 'success');
    } else {
        showToastMessage(`⚠️ جميع جرعات ${medicine.medicineName} لليوم تم تسجيلها مسبقاً`, 'warning');
    }
}

// التحقق مما إذا كانت الحبة قد أخذت لليوم
function isPillTakenForToday(medicine, pillIndex) {
    const today = new Date().toISOString().split('T')[0];
    if (!medicine.dosesHistory) return false;
    
    for (const [key, value] of Object.entries(medicine.dosesHistory)) {
        if (key.startsWith(today) && value.pillIndex === pillIndex) {
            return true;
        }
    }
    return false;
}

// الحصول على عدد الجرعات المأخوذة اليوم
function getTakenCountToday(medicine) {
    const today = new Date().toISOString().split('T')[0];
    if (!medicine.dosesHistory) return 0;
    
    let count = 0;
    for (const key of Object.keys(medicine.dosesHistory)) {
        if (key.startsWith(today)) {
            count++;
        }
    }
    return count;
}

// عرض تفاصيل الدواء مع الشريط الكامل
function showDetails(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('detailsContent');
    
    let stripsHtml = '';
    const totalPills = medicine.totalDoses;
    const pillsPerStrip = medicine.pillsPerStrip;
    const numberOfStrips = medicine.numberOfStrips;
    
    const pillClass = medicine.medicineType === 'capsule' ? 'capsule' : '';
    
    // عرض كل الأشرطة
    for (let stripIndex = 0; stripIndex < numberOfStrips; stripIndex++) {
        let pillsHtml = '';
        const startPill = stripIndex * pillsPerStrip;
        
        for (let i = 0; i < pillsPerStrip; i++) {
            const pillNumber = startPill + i + 1;
            const isTaken = isPillTakenForToday(medicine, i);
            
            pillsHtml += `
                <div class="pill ${pillClass} ${isTaken ? 'taken' : ''}" 
                     style="background: linear-gradient(135deg, ${medicine.medicineColor}, ${lightenColor(medicine.medicineColor, 20)})"
                     onclick="takePillFromCard(${medicine.id}, ${i})">
                    <span class="pill-number">${pillNumber}</span>
                </div>
            `;
        }
        
        stripsHtml += `
            <div class="strip-card">
                <h4><i class="fas fa-square"></i> الشريط ${stripIndex + 1} (${pillsPerStrip} حبة)</h4>
                <div class="pills-grid">
                    ${pillsHtml}
                </div>
            </div>
        `;
    }
    
    const scheduleHtml = medicine.schedule.map(s => `
        <div class="detail-row">
            <span class="detail-label">⏰ ${s.label}:</span>
            <span>${s.time}</span>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="full-strip-view">
            <div class="detail-row">
                <span class="detail-label">👤 المريض:</span>
                <span>${medicine.patientName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">💊 الدواء:</span>
                <span>${medicine.medicineName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">📦 النوع:</span>
                <span>${medicine.medicineType === 'tablet' ? 'أقراص' : (medicine.medicineType === 'capsule' ? 'كبسولات' : 'شراب')}</span>
            </div>
            ${scheduleHtml}
            <div class="detail-row">
                <span class="detail-label">📅 تاريخ البدء:</span>
                <span>${medicine.startDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">📝 التعليمات:</span>
                <span>${medicine.instructions || 'لا توجد تعليمات'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">📊 الإجمالي:</span>
                <span>${totalPills} جرعة (${numberOfStrips} شريط × ${pillsPerStrip} حبة)</span>
            </div>
            <hr style="margin: 20px 0;">
            <h3 style="margin-bottom: 15px;">🖼️ عرض الشرائط كاملة</h3>
            ${stripsHtml}
        </div>
    `;
    
    modal.style.display = 'block';
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalMedicines').textContent = medicines.length;
    
    let totalTakenToday = 0;
    let totalPossibleToday = 0;
    
    medicines.forEach(medicine => {
        const taken = getTakenCountToday(medicine);
        totalTakenToday += taken;
        totalPossibleToday += medicine.schedule.length;
    });
    
    const completionRate = totalPossibleToday > 0 ? Math.round((totalTakenToday / totalPossibleToday) * 100) : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
    document.getElementById('takenToday').textContent = totalTakenToday;
    
    const missed = totalPossibleToday - totalTakenToday;
    document.getElementById('missedToday').textContent = missed;
}

// فحص التنبيهات
function checkForNotifications() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    
    medicines.forEach(medicine => {
        if (!medicine.notificationsEnabled) return;
        
        medicine.schedule.forEach(schedule => {
            if (schedule.time === currentTime) {
                const doseKey = `${today}_${schedule.time.includes('09') ? 'morning' : 'evening'}`;
                
                if (!medicine.dosesHistory || !medicine.dosesHistory[doseKey]) {
                    showNotification(medicine, schedule);
                }
            }
        });
    });
}

// عرض الإشعار
function showNotification(medicine, schedule) {
    if (Notification.permission === 'granted') {
        new Notification(`🔔 موعد تناول ${medicine.medicineName}`, {
            body: `المريض: ${medicine.patientName} - ${schedule.label}`,
            icon: medicine.medicineImage || 'https://via.placeholder.com/100',
            tag: medicine.id.toString()
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerHTML = `
        <strong>${medicine.medicineName}</strong><br>
        المريض: ${medicine.patientName}<br>
        ${schedule.label}
    `;
    toast.classList.add('show');
    
    const audio = document.getElementById('notificationSound');
    audio.play().catch(e => console.log());
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
    
    // تغيير لون الخلفية
    document.body.style.backgroundColor = '#fff3e0';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 3000);
}

// إضافة أو تعديل دواء
function openMedicineModal(medicine = null) {
    const modal = document.getElementById('medicineModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (medicine) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل دواء';
        document.getElementById('medicineId').value = medicine.id;
        document.getElementById('patientName').value = medicine.patientName;
        document.getElementById('medicineName').value = medicine.medicineName;
        document.getElementById('medicineType').value = medicine.medicineType || 'tablet';
        document.getElementById('medicineColor').value = medicine.medicineColor || '#4caf50';
        document.getElementById('medicineImage').value = medicine.medicineImage || '';
        document.getElementById('pillsPerStrip').value = medicine.pillsPerStrip;
        document.getElementById('numberOfStrips').value = medicine.numberOfStrips;
        document.getElementById('time1').value = medicine.schedule[0]?.time || '09:00';
        document.getElementById('time2').value = medicine.schedule[1]?.time || '';
        document.getElementById('startDate').value = medicine.startDate;
        document.getElementById('endDate').value = medicine.endDate || '';
        document.getElementById('instructions').value = medicine.instructions || '';
        document.getElementById('notificationsEnabled').checked = medicine.notificationsEnabled;
    } else {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة دواء جديد';
        document.getElementById('medicineForm').reset();
        document.getElementById('medicineId').value = '';
        document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('pillsPerStrip').value = 7;
        document.getElementById('numberOfStrips').value = 2;
        document.getElementById('time1').value = '09:00';
        document.getElementById('notificationsEnabled').checked = true;
    }
    
    // تحديث إجمالي الجرعات
    const total = (parseInt(document.getElementById('pillsPerStrip').value) || 0) * 
                  (parseInt(document.getElementById('numberOfStrips').value) || 0);
    document.getElementById('totalDosesDisplay').value = total + ' جرعة';
    
    modal.style.display = 'block';
}

function closeMedicineModal() {
    document.getElementById('medicineModal').style.display = 'none';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function saveMedicine(e) {
    e.preventDefault();
    
    const id = document.getElementById('medicineId').value;
    const pillsPerStrip = parseInt(document.getElementById('pillsPerStrip').value);
    const numberOfStrips = parseInt(document.getElementById('numberOfStrips').value);
    const totalDoses = pillsPerStrip * numberOfStrips;
    
    const schedule = [];
    const time1 = document.getElementById('time1').value;
    if (time1) schedule.push({ time: time1, label: 'الجرعة الأولى' });
    
    const time2 = document.getElementById('time2').value;
    if (time2) schedule.push({ time: time2, label: 'الجرعة الثانية' });
    
    const medicineData = {
        patientName: document.getElementById('patientName').value,
        medicineName: document.getElementById('medicineName').value,
        medicineType: document.getElementById('medicineType').value,
        medicineColor: document.getElementById('medicineColor').value,
        medicineImage: document.getElementById('medicineImage').value,
        pillsPerStrip: pillsPerStrip,
        numberOfStrips: numberOfStrips,
        totalDoses: totalDoses,
        schedule: schedule,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value || null,
        instructions: document.getElementById('instructions').value,
        notificationsEnabled: document.getElementById('notificationsEnabled').checked,
        dosesHistory: {},
        lastUpdated: new Date().toISOString()
    };
    
    if (id) {
        const index = medicines.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            // الحفاظ على سجل الجرعات القديم
            medicineData.dosesHistory = medicines[index].dosesHistory || {};
            medicines[index] = { ...medicineData, id: parseInt(id) };
        }
    } else {
        medicineData.id = Date.now();
        medicines.push(medicineData);
    }
    
    saveToLocalStorage();
    renderMedicines();
    updateStats();
    closeMedicineModal();
    showToastMessage(`✓ تم ${id ? 'تعديل' : 'إضافة'} الدواء بنجاح`, 'success');
}

function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) openMedicineModal(medicine);
}

function deleteMedicine(id) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا الدواء؟')) {
        medicines = medicines.filter(m => m.id !== id);
        saveToLocalStorage();
        renderMedicines();
        updateStats();
        showToastMessage('✓ تم حذف الدواء', 'success');
    }
}

// وظائف مساعدة
function lightenColor(color, percent) {
    // تفتيح اللون
    return color;
}

function showToastMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4caf50' : '#ff9800'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 1200;
        font-weight: bold;
        animation: slideUp 0.3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// إغلاق المودال
window.onclick = function(event) {
    if (event.target === document.getElementById('medicineModal')) closeMedicineModal();
    if (event.target === document.getElementById('detailsModal')) closeDetailsModal();
}

// طلب إذن الإشعارات
if (Notification.permission === 'default') Notification.requestPermission();