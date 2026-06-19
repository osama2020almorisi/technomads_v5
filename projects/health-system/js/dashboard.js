// نظام لوحة التحكم المحسن مع البيانات الحقيقية
class MedicalDashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        this.appointments = JSON.parse(localStorage.getItem('medical_appointments')) || [];
        this.notifications = JSON.parse(localStorage.getItem('medical_notifications')) || [];
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateStats();
        this.loadRecentData();
        this.setupSearch();
        this.setupLanguageSwitcher();
    }

    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
    }

    setupEventListeners() {
        // تبديل الشريط الجانبي للهواتف
        this.setupMobileMenu();
        
        // إدارة النماذج
        this.setupModals();
        
        // تفعيل الإحصائيات كأزرار
        this.setupStatCards();
        
        // تسجيل الخروج
        this.setupLogout();
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('show');
                overlay.style.display = 'block';
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
            });
        }
    }

    setupModals() {
        // إغلاق النماذج
        const closeModalButtons = document.querySelectorAll('.close-modal');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAppointmentModal();
            });
        });

        // نموذج حجز الموعد
        const appointmentForm = document.getElementById('appointmentForm');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAppointment();
            });
        }
    }

    setupStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                this.handleStatCardClick(action);
            });
        });
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.authManager) {
                    window.authManager.logout();
                } else {
                    localStorage.removeItem('medical_currentUser');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    setupLanguageSwitcher() {
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const currentLang = document.documentElement.lang;
                if (currentLang === 'ar') {
                    this.switchToEnglish();
                } else {
                    this.switchToArabic();
                }
            });
        }
    }

    switchToEnglish() {
        if (window.languageManager) {
            window.languageManager.switchLanguage('en');
        }
    }

    switchToArabic() {
        if (window.languageManager) {
            window.languageManager.switchLanguage('ar');
        }
    }

    loadDashboardData() {
        // تحديث معلومات المستخدم
        this.updateUserInfo();
        
        // تحديث عدادات الإشعارات
        this.updateNotificationCounters();
    }

    updateUserInfo() {
        const welcomeMessage = document.getElementById('welcome-message');
        const userName = document.getElementById('user-display-name');
        const userSpecialty = document.getElementById('user-specialty');

        if (this.currentUser) {
            const displayName = `د. ${this.currentUser.firstName} ${this.currentUser.lastName}`;
            const specialty = this.getSpecialtyText(this.currentUser.specialty);

            if (welcomeMessage) {
                welcomeMessage.textContent = `مرحباً بعودتك، ${displayName}`;
            }
            if (userName) {
                userName.textContent = displayName;
            }
            if (userSpecialty) {
                userSpecialty.textContent = specialty;
            }
        }
    }

    getSpecialtyText(specialty) {
        const specialties = {
            'general': 'طب عام',
            'internal': 'باطنية',
            'cardiology': 'قلب',
            'endocrinology': 'غدد صماء',
            'other': 'طبيب'
        };
        return specialties[specialty] || 'طبيب';
    }

    updateNotificationCounters() {
        const newNotifications = this.notifications.filter(n => !n.read).length;
        const newTests = this.tests.filter(t => t.status === 'pending').length;

        // تحديث الشارات
        const notificationBadge = document.querySelector('.new-notifications');
        const testBadge = document.querySelector('.new-tests');
        const mobileNotification = document.querySelector('.notification-count');

        if (notificationBadge) notificationBadge.textContent = newNotifications;
        if (testBadge) testBadge.textContent = newTests;
        if (mobileNotification) mobileNotification.textContent = newNotifications;
    }

    updateStats() {
        // إجمالي المرضى
        document.getElementById('total-patients').textContent = this.patients.length;
        
        // إجمالي التحاليل
        document.getElementById('total-tests').textContent = this.tests.length;
        
        // التحاليل التي تحتاج مراجعة
        const pendingReviews = this.tests.filter(t => 
            t.status === 'critical' || t.status === 'warning'
        ).length;
        document.getElementById('pending-reviews').textContent = pendingReviews;

        // المواعيد القادمة هذا الأسبوع
        const upcoming = this.getUpcomingAppointments();
        document.getElementById('upcoming-appointments').textContent = upcoming.length;
    }

    getUpcomingAppointments() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return this.appointments.filter(appointment => {
            const appDate = new Date(appointment.date);
            return appDate <= nextWeek && appDate >= new Date();
        });
    }

    loadRecentData() {
        this.loadRecentPatients();
        this.loadRecentTests();
        this.loadNotifications();
    }

    loadRecentPatients() {
        const container = document.getElementById('recent-patients-list');
        if (!container) return;

        const recentPatients = this.patients
            .filter(patient => patient.createdBy === this.currentUser?.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentPatients.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('patients');
            return;
        }

        container.innerHTML = recentPatients.map(patient => `
            <div class="patient-item" data-patient-id="${patient.id}">
                <div class="patient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                    <h4>${patient.name}</h4>
                    <p>العمر: ${patient.age} سنة</p>
                    <small>تم الإضافة: ${this.formatDate(patient.createdAt)}</small>
                </div>
                <div class="patient-status">
                    <span class="status-badge new">جديد</span>
                </div>
            </div>
        `).join('');

        // إضافة حدث النقر لفتح تفاصيل المريض
        container.querySelectorAll('.patient-item').forEach(item => {
            item.addEventListener('click', () => {
                const patientId = item.getAttribute('data-patient-id');
                this.viewPatientDetails(patientId);
            });
        });
    }

    loadRecentTests() {
        const container = document.getElementById('recent-tests-list');
        if (!container) return;

        const recentTests = this.tests
            .filter(test => test.createdBy === this.currentUser?.id)
            .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
            .slice(0, 5);

        if (recentTests.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('tests');
            return;
        }

        container.innerHTML = recentTests.map(test => {
            const patient = this.patients.find(p => p.id === test.patientId);
            const statusClass = this.getTestStatusClass(test.status);
            const statusIcon = this.getTestStatusIcon(test.status);
            const statusText = this.getTestStatusText(test.status);

            return `
                <div class="test-item" data-test-id="${test.id}">
                    <div class="test-type">
                        <i class="fas ${this.getTestTypeIcon(test.testType)}"></i>
                        <span>${test.testType}</span>
                    </div>
                    <div class="test-patient">
                        <strong>${patient ? patient.name : 'مريض محذوف'}</strong>
                        <span>${patient ? `العمر: ${patient.age}` : 'N/A'}</span>
                    </div>
                    <div class="test-date">
                        <i class="far fa-calendar"></i>
                        <span>${this.formatDate(test.testDate)}</span>
                    </div>
                    <div class="test-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');

        // إضافة حدث النقر لفتح تفاصيل التحليل
        container.querySelectorAll('.test-item').forEach(item => {
            item.addEventListener('click', () => {
                const testId = item.getAttribute('data-test-id');
                this.viewTestDetails(testId);
            });
        });
    }

    loadNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        const importantNotifications = this.notifications
            .filter(n => n.important && !n.read)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (importantNotifications.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('notifications');
            return;
        }

        container.innerHTML = importantNotifications.map(notification => {
            const typeClass = this.getNotificationTypeClass(notification.type);
            const typeIcon = this.getNotificationTypeIcon(notification.type);

            return `
                <div class="notification-item ${typeClass}" data-notification-id="${notification.id}">
                    <div class="notification-icon">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <span class="notification-time">${this.formatTime(notification.date)}</span>
                    </div>
                </div>
            `;
        }).join('');

        // إضافة حدث النقر لتمييز الإشعار كمقروء
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.getAttribute('data-notification-id');
                this.markNotificationAsRead(notificationId);
            });
        });
    }

    getEmptyStateHTML(type) {
        const states = {
            'patients': {
                icon: 'fa-user-plus',
                message: 'no_patients_message',
                button: 'add_first_patient',
                action: "location.href='patient.html'"
            },
            'tests': {
                icon: 'fa-vial',
                message: 'no_tests_message',
                button: 'add_first_test',
                action: "location.href='analysis.html'"
            },
            'notifications': {
                icon: 'fa-bell-slash',
                message: 'no_notifications_message',
                button: null,
                action: null
            }
        };

        const state = states[type];
        const buttonHTML = state.button ? 
            `<button class="btn-primary" onclick="${state.action}" data-i18n="${state.button}">إضافة أول مريض</button>` : '';

        return `
            <div class="empty-state">
                <i class="fas ${state.icon}"></i>
                <p data-i18n="${state.message}">لا يوجد مرضى مسجلين بعد</p>
                ${buttonHTML}
            </div>
        `;
    }

    setupSearch() {
        const searchInput = document.getElementById('global-search');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput && searchClear) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    searchClear.style.display = 'block';
                    this.performSearch(e.target.value);
                } else {
                    searchClear.style.display = 'none';
                    this.clearSearch();
                }
            });

            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                this.clearSearch();
            });
        }
    }

    performSearch(query) {
        query = query.toLowerCase().trim();
        
        if (query.length < 2) return;

        // البحث في المرضى
        const patientResults = this.patients.filter(patient =>
            patient.name.toLowerCase().includes(query) ||
            (patient.medicalId && patient.medicalId.toLowerCase().includes(query))
        );

        // البحث في التحاليل
        const testResults = this.tests.filter(test =>
            test.testType.toLowerCase().includes(query) ||
            test.notes.toLowerCase().includes(query)
        );

        // عرض نتائج البحث (يمكن تطوير هذا الجزء لعرض النتائج في واجهة مخصصة)
        this.displaySearchResults(patientResults, testResults);
    }

    displaySearchResults(patients, tests) {
        // هنا يمكن تطوير واجهة لعرض نتائج البحث
        console.log('نتائج البحث:', { patients, tests });
        
        // مؤقتاً: عرض تنبيه بعدد النتائج
        if (patients.length > 0 || tests.length > 0) {
            this.showNotification(
                `تم العثور على ${patients.length} مريض و ${tests.length} تحليل`,
                'info'
            );
        }
    }

    clearSearch() {
        this.loadRecentData();
    }

    // معالجة النقر على بطاقات الإحصائيات
    handleStatCardClick(action) {
        const actions = {
            'patients': () => location.href = 'patients.html',
            'tests': () => location.href = 'analysis.html',
            'reviews': () => location.href = 'analysis.html?filter=pending',
            'appointments': () => this.showAppointmentModal()
        };
        
        if (actions[action]) {
            actions[action]();
        }
    }

    // إدارة نموذج حجز الموعد
    showAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        const patientSelect = document.getElementById('patientSelect');
        
        // تعبئة قائمة المرضى
        const userPatients = this.patients.filter(p => p.createdBy === this.currentUser?.id);
        patientSelect.innerHTML = '<option value="" data-i18n="select_patient_option">اختر المريض</option>' +
            userPatients.map(patient => 
                `<option value="${patient.id}">${patient.name} - ${patient.age} سنة</option>`
            ).join('');
        
        // تعيين التاريخ الافتراضي (غداً)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('appointmentDate').value = tomorrow.toISOString().split('T')[0];
        
        // تعيين الوقت الافتراضي (9:00 صباحاً)
        document.getElementById('appointmentTime').value = '09:00';
        
        modal.classList.add('show');
    }

    hideAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        modal.classList.remove('show');
    }

    saveAppointment() {
        const form = document.getElementById('appointmentForm');
        const formData = new FormData(form);
        
        const appointment = {
            id: 'appt_' + Date.now(),
            patientId: formData.get('patientSelect'),
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            type: formData.get('appointmentType'),
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id,
            status: 'scheduled'
        };

        // التحقق من البيانات
        if (!appointment.patientId) {
            this.showNotification('يرجى اختيار المريض', 'error');
            return;
        }

        this.appointments.push(appointment);
        localStorage.setItem('medical_appointments', JSON.stringify(this.appointments));
        
        // إضافة إشعار
        const patient = this.patients.find(p => p.id === appointment.patientId);
        this.addNotification({
            id: 'notif_' + Date.now(),
            title: 'موعد جديد',
            message: `تم حجز موعد ${this.getAppointmentTypeText(appointment.type)} للمريض ${patient?.name || 'غير معروف'}`,
            type: 'reminder',
            important: true,
            date: new Date().toISOString(),
            read: false,
            createdBy: this.currentUser.id
        });

        this.hideAppointmentModal();
        form.reset();
        this.updateStats();
        
        this.showNotification('تم حجز الموعد بنجاح!', 'success');
    }

    getAppointmentTypeText(type) {
        const types = {
            'consultation': 'استشارة',
            'followup': 'متابعة',
            'test': 'تحليل',
            'review': 'مراجعة نتائج'
        };
        return types[type] || type;
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        localStorage.setItem('medical_notifications', JSON.stringify(this.notifications));
        this.loadNotifications();
        this.updateNotificationCounters();
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('medical_notifications', JSON.stringify(this.notifications));
            this.loadNotifications();
            this.updateNotificationCounters();
        }
    }

    viewPatientDetails(patientId) {
        // حفظ معرف المريض في sessionStorage للاستخدام في صفحة التفاصيل
        sessionStorage.setItem('currentPatientId', patientId);
        window.location.href = 'patient-details.html';
    }

    viewTestDetails(testId) {
        // حفظ معرف التحليل في sessionStorage للاستخدام في صفحة التفاصيل
        sessionStorage.setItem('currentTestId', testId);
        window.location.href = 'test-details.html';
    }

    showNotification(message, type = 'info') {
        // استخدام نظام الإشعارات من authManager إذا كان متاحاً
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            // تنفيذ بدائي للإشعارات
            alert(message);
        }
    }

    // ===== دوال مساعدة =====

    getTestTypeIcon(testType) {
        const icons = {
            'سكر الدم': 'fa-tint',
            'وظائف الكبد': 'fa-liver',
            'وظائف الكلى': 'fa-kidney',
            'تحليل الدم الكامل': 'fa-vial',
            'دهون الدم': 'fa-chart-line'
        };
        return icons[testType] || 'fa-vial';
    }

    getTestStatusClass(status) {
        const classes = {
            'normal': 'normal',
            'warning': 'warning',
            'critical': 'critical',
            'pending': 'pending'
        };
        return classes[status] || 'pending';
    }

    getTestStatusIcon(status) {
        const icons = {
            'normal': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'critical': 'fa-exclamation-circle',
            'pending': 'fa-clock'
        };
        return icons[status] || 'fa-clock';
    }

    getTestStatusText(status) {
        const texts = {
            'normal': 'طبيعي',
            'warning': 'يحتاج مراجعة',
            'critical': 'حرج',
            'pending': 'قيد الانتظار'
        };
        return texts[status] || 'قيد الانتظار';
    }

    getNotificationTypeClass(type) {
        const classes = {
            'urgent': 'urgent',
            'reminder': 'reminder',
            'info': 'info'
        };
        return classes[type] || 'info';
    }

    getNotificationTypeIcon(type) {
        const icons = {
            'urgent': 'fa-exclamation-triangle',
            'reminder': 'fa-calendar-alt',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG');
        } catch (error) {
            return 'تاريخ غير معروف';
        }
    }

    formatTime(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) {
                return 'الآن';
            } else if (minutes < 60) {
                return `منذ ${minutes} دقيقة`;
            } else if (hours < 24) {
                return `منذ ${hours} ساعة`;
            } else if (days < 7) {
                return `منذ ${days} يوم`;
            } else {
                return this.formatDate(dateString);
            }
        } catch (error) {
            return 'وقت غير معروف';
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // الانتظار حتى يتم تحميل نظام اللغة أولاً
    if (window.languageManager && window.languageManager.isReady()) {
        window.dashboard = new MedicalDashboard();
    } else {
        // إذا لم يكن نظام اللغة جاهزاً، ننتظر حتى يصبح جاهزاً
        const checkLanguageManager = setInterval(() => {
            if (window.languageManager && window.languageManager.isReady()) {
                clearInterval(checkLanguageManager);
                window.dashboard = new MedicalDashboard();
            }
        }, 100);
    }
});