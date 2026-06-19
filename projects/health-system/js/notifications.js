// إدارة الإشعارات والتنبيهات - معدل ليعمل ببيانات حقيقية
class NotificationsManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        this.notifications = JSON.parse(localStorage.getItem('medical_notifications')) || this.getDefaultNotifications();
        this.filteredNotifications = [];
        this.currentView = 'list';
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.filters = {
            status: 'all',
            type: 'all',
            date: 'all'
        };
        
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.setupEventListeners();
        this.applyFilters();
        this.updateStats();
        this.setupViewToggle();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // التصفية
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.date = e.target.value;
                this.applyFilters();
            });
        }

        // التصفح
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('settingsModal');
                this.hideModal('detailModal');
            });
        });

        // تبويبات الإعدادات
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
                
                tabButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.authManager) {
                    window.authManager.logout();
                } else {
                    localStorage.removeItem('medical_currentUser');
                    window.location.href = 'index.html';
                }
            });
        }

        // تطبيق وإعادة تعيين التصفية
        const applyBtn = document.querySelector('.btn-secondary[onclick*="applyFilters"]');
        const resetBtn = document.querySelector('.btn-secondary[onclick*="resetFilters"]');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // حفظ إعدادات الإشعارات
        const saveSettingsBtn = document.querySelector('.btn-primary[onclick*="saveNotificationSettings"]');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveNotificationSettings());
        }
    }

    updateUserInfo() {
        const userName = document.getElementById('user-display-name');
        const userSpecialty = document.getElementById('user-specialty');

        if (this.currentUser) {
            const displayName = `د. ${this.currentUser.firstName} ${this.currentUser.lastName}`;
            const specialty = this.getSpecialtyText(this.currentUser.specialty);

            if (userName) userName.textContent = displayName;
            if (userSpecialty) userSpecialty.textContent = specialty;
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

    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const container = document.getElementById('notifications-container');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                if (container) {
                    container.className = `notifications-container ${this.currentView}-view`;
                }
                
                this.renderNotifications();
            });
        });
    }

    getDefaultNotifications() {
        // تحميل إشعارات المستخدم الحالي فقط
        const userNotifications = [];
        
        // إضافة إشعارات من التحاليل الحرجة
        const userTests = this.tests.filter(test => 
            test.createdBy === this.currentUser.id && test.status === 'critical'
        );
        
        userTests.forEach(test => {
            const patient = this.patients.find(p => p.id === test.patientId);
            if (patient) {
                userNotifications.push({
                    id: 'notif_' + Date.now() + Math.random(),
                    type: 'critical',
                    title: 'نتيجة حرجة تحتاج مراجعة',
                    message: `مريض ${patient.name} - تحليل ${test.testType} أظهر نتائج حرجة تحتاج إلى مراجعة فورية`,
                    patientId: patient.id,
                    testId: test.id,
                    timestamp: test.createdAt,
                    read: false,
                    priority: 'high',
                    createdBy: this.currentUser.id
                });
            }
        });

        return userNotifications;
    }

    applyFilters() {
        // تحميل إشعارات المستخدم الحالي فقط
        const userNotifications = this.notifications.filter(notification => 
            notification.createdBy === this.currentUser.id
        );

        this.filteredNotifications = userNotifications.filter(notification => {
            // تصفية حسب الحالة
            const statusMatch = this.filters.status === 'all' || 
                (this.filters.status === 'unread' && !notification.read) ||
                (this.filters.status === 'read' && notification.read);
            
            // تصفية حسب النوع
            const typeMatch = this.filters.type === 'all' || notification.type === this.filters.type;
            
            // تصفية حسب التاريخ
            const dateMatch = this.filterByDate(notification.timestamp, this.filters.date);
            
            return statusMatch && typeMatch && dateMatch;
        });

        // الترتيب حسب الوقت (الأحدث أولاً)
        this.filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        this.currentPage = 1;
        this.renderNotifications();
        this.updatePagination();
        this.updateStats();
    }

    filterByDate(timestamp, filter) {
        if (!filter || filter === 'all') return true;

        const date = new Date(timestamp);
        const now = new Date();
        
        switch (filter) {
            case 'today':
                return date.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return date >= monthAgo;
            default:
                return true;
        }
    }

    resetFilters() {
        this.filters = {
            status: 'all',
            type: 'all',
            date: 'all'
        };
        
        // تحديث واجهة المستخدم
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');
        
        if (statusFilter) statusFilter.value = 'all';
        if (typeFilter) typeFilter.value = 'all';
        if (dateFilter) dateFilter.value = 'all';
        
        this.applyFilters();
    }

    renderNotifications() {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentNotifications = this.filteredNotifications.slice(startIndex, endIndex);

        if (currentNotifications.length === 0) {
            container.innerHTML = this.getEmptyState();
            const paginationFooter = document.querySelector('.pagination-footer');
            if (paginationFooter) paginationFooter.style.display = 'none';
            return;
        }

        if (this.currentView === 'list') {
            container.innerHTML = currentNotifications.map(notification => this.createNotificationItem(notification)).join('');
        } else {
            container.innerHTML = currentNotifications.map(notification => this.createNotificationCard(notification)).join('');
        }

        const paginationFooter = document.querySelector('.pagination-footer');
        if (paginationFooter) paginationFooter.style.display = 'flex';
    }

    createNotificationItem(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const iconClass = notification.type;
        const unreadClass = !notification.read ? 'unread' : '';

        return `
            <div class="notification-item ${unreadClass} ${notification.type}" data-notification-id="${notification.id}">
                ${!notification.read ? '<div class="unread-badge"></div>' : ''}
                <div class="notification-icon ${iconClass}">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h3 class="notification-title">${notification.title}</h3>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">
                        <span class="notification-type ${notification.type}">${this.getTypeText(notification.type)}</span>
                        ${notification.patientId ? '<span class="patient-badge">مرتبط بمريض</span>' : ''}
                        ${notification.priority === 'high' ? '<span class="priority-badge">عالي الأولوية</span>' : ''}
                    </div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                        <button class="btn-icon" onclick="notificationsManager.markAsRead('${notification.id}')" title="تعليم كمقروء">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon" onclick="notificationsManager.viewDetails('${notification.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="notificationsManager.deleteNotification('${notification.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createNotificationCard(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const iconClass = notification.type;
        const unreadClass = !notification.read ? 'unread' : '';

        return `
            <div class="notification-card ${unreadClass} ${notification.type}" data-notification-id="${notification.id}">
                ${!notification.read ? '<div class="unread-badge"></div>' : ''}
                <div class="notification-card-header">
                    <div class="notification-card-icon ${iconClass}">
                        <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-card-info">
                        <h3 class="notification-card-title">${notification.title}</h3>
                        <span class="notification-card-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="notification-card-body">
                    <p class="notification-card-message">${notification.message}</p>
                    <div class="notification-card-meta">
                        <span class="notification-type ${notification.type}">${this.getTypeText(notification.type)}</span>
                        ${notification.priority === 'high' ? '<span class="priority-badge">عالي الأولوية</span>' : ''}
                    </div>
                </div>
                <div class="notification-card-actions">
                    ${!notification.read ? `
                        <button class="btn-icon" onclick="notificationsManager.markAsRead('${notification.id}')" title="تعليم كمقروء">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon" onclick="notificationsManager.viewDetails('${notification.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="notificationsManager.deleteNotification('${notification.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'critical': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'reminder': 'fa-bell'
        };
        return icons[type] || 'fa-bell';
    }

    getTypeText(type) {
        const types = {
            'critical': 'حرج',
            'warning': 'تحذير',
            'info': 'معلومات',
            'success': 'نجاح',
            'reminder': 'تذكير'
        };
        return types[type] || 'إشعار';
    }

    getTimeAgo(timestamp) {
        const date = new Date(timestamp);
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
            return date.toLocaleDateString('ar-EG');
        }
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>لا توجد إشعارات</h3>
                <p>ستظهر هنا جميع الإشعارات والتنبيهات الخاصة بنظامك</p>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        const currentCount = Math.min(this.itemsPerPage, this.filteredNotifications.length - ((this.currentPage - 1) * this.itemsPerPage));
        
        const currentCountElem = document.getElementById('current-count');
        const totalCountElem = document.getElementById('total-count');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (currentCountElem) currentCountElem.textContent = currentCount;
        if (totalCountElem) totalCountElem.textContent = this.filteredNotifications.length;
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.querySelector('.page-numbers');
        if (!pageNumbers) return;
        
        let pagesHtml = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const active = i === this.currentPage ? 'active' : '';
            pagesHtml += `<span class="page-number ${active}" onclick="notificationsManager.goToPage(${i})">${i}</span>`;
        }
        
        pageNumbers.innerHTML = pagesHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNotifications();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderNotifications();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderNotifications();
            this.updatePagination();
        }
    }

    updateStats() {
        const userNotifications = this.notifications.filter(notification => 
            notification.createdBy === this.currentUser.id
        );

        const total = userNotifications.length;
        const unread = userNotifications.filter(n => !n.read).length;
        const critical = userNotifications.filter(n => n.type === 'critical').length;
        const today = userNotifications.filter(n => {
            const date = new Date(n.timestamp);
            return date.toDateString() === new Date().toDateString();
        }).length;

        const totalElem = document.getElementById('total-notifications');
        const unreadElem = document.getElementById('unread-notifications');
        const criticalElem = document.getElementById('critical-notifications');
        const todayElem = document.getElementById('today-notifications');

        if (totalElem) totalElem.textContent = total;
        if (unreadElem) unreadElem.textContent = unread;
        if (criticalElem) criticalElem.textContent = critical;
        if (todayElem) todayElem.textContent = today;

        // تحديث العداد في الشريط الجانبي
        const sidebarBadge = document.querySelector('.new-notifications');
        if (sidebarBadge) {
            sidebarBadge.textContent = unread;
            sidebarBadge.style.display = unread > 0 ? 'flex' : 'none';
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم تعليم الإشعار كمقروء', 'success');
        }
    }

    markAllAsRead() {
        const userNotifications = this.notifications.filter(notification => 
            notification.createdBy === this.currentUser.id && !notification.read
        );

        if (userNotifications.length === 0) {
            this.showNotification('لا توجد إشعارات غير مقروءة', 'info');
            return;
        }

        if (confirm('هل تريد تعليم جميع الإشعارات كمقروءة؟')) {
            userNotifications.forEach(notification => {
                notification.read = true;
            });
            
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم تعليم جميع الإشعارات كمقروءة', 'success');
        }
    }

    deleteNotification(notificationId) {
        if (confirm('هل تريد حذف هذا الإشعار؟')) {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم حذف الإشعار', 'success');
        }
    }

    clearAll() {
        const userNotifications = this.notifications.filter(notification => 
            notification.createdBy === this.currentUser.id
        );

        if (userNotifications.length === 0) {
            this.showNotification('لا توجد إشعارات', 'info');
            return;
        }

        if (confirm('هل تريد حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            this.notifications = this.notifications.filter(notification => 
                notification.createdBy !== this.currentUser.id
            );
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم حذف جميع الإشعارات', 'success');
        }
    }

    viewDetails(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        const modal = document.getElementById('detailModal');
        const title = document.getElementById('notification-title');
        const detail = document.getElementById('notification-detail');

        if (title) title.textContent = notification.title;
        
        let patientInfo = '';
        if (notification.patientId) {
            const patient = this.patients.find(p => p.id === notification.patientId);
            if (patient) {
                patientInfo = `
                    <div class="detail-patient">
                        <strong>المريض:</strong> ${patient.name} (${patient.medicalId})
                    </div>
                `;
            }
        }

        if (detail) {
            detail.innerHTML = `
                <div class="detail-header">
                    <div class="detail-icon ${notification.type}">
                        <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="detail-title">
                        <h4>${notification.title}</h4>
                        <div class="detail-meta">
                            <span><i class="fas fa-clock"></i> ${this.getTimeAgo(notification.timestamp)}</span>
                            <span class="notification-type ${notification.type}">${this.getTypeText(notification.type)}</span>
                            ${notification.priority === 'high' ? '<span class="priority-badge">عالي الأولوية</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="detail-content">
                    <div class="detail-message">
                        <p>${notification.message}</p>
                    </div>
                    ${patientInfo}
                    ${notification.testId ? `
                        <div class="detail-test">
                            <strong>رقم التحليل:</strong> ${notification.testId}
                        </div>
                    ` : ''}
                </div>
                <div class="detail-actions">
                    ${!notification.read ? `
                        <button class="btn-primary" onclick="notificationsManager.markAsRead('${notification.id}')">
                            <i class="fas fa-check"></i>
                            تعليم كمقروء
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="notificationsManager.hideModal('detailModal')">
                        <i class="fas fa-times"></i>
                        إغلاق
                    </button>
                </div>
            `;
        }

        if (modal) modal.classList.add('show');

        // تعليم كمقروء عند العرض
        if (!notification.read) {
            this.markAsRead(notificationId);
        }
    }

    showTab(tab) {
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => pane.classList.remove('active'));
        
        const targetPane = document.getElementById(`${tab}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    showSettings() {
        this.showModal('settingsModal');
        this.loadNotificationSettings();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    loadNotificationSettings() {
        const settings = JSON.parse(localStorage.getItem('medical_notification_settings')) || this.getDefaultNotificationSettings();
        
        // تحميل إعدادات التفضيلات
        document.getElementById('notif-new-patient').checked = settings.newPatient;
        document.getElementById('notif-patient-update').checked = settings.patientUpdate;
        document.getElementById('notif-new-test').checked = settings.newTest;
        document.getElementById('notif-critical-results').checked = settings.criticalResults;
        document.getElementById('notif-test-reminder').checked = settings.testReminder;
        document.getElementById('notif-system-updates').checked = settings.systemUpdates;
        document.getElementById('notif-backup-reminder').checked = settings.backupReminder;
        document.getElementById('notif-security-alerts').checked = settings.securityAlerts;
        
        // تحميل إعدادات القنوات
        document.getElementById('channel-email').checked = settings.email;
        document.getElementById('channel-browser').checked = settings.browser;
        document.getElementById('channel-sms').checked = settings.sms;
        document.getElementById('channel-push').checked = settings.push;

        // تحميل إعدادات ساعات الهدوء
        document.getElementById('quiet-hours-enabled').checked = settings.quietHours.enabled;
        document.getElementById('quiet-start').value = settings.quietHours.start;
        document.getElementById('quiet-end').value = settings.quietHours.end;
        document.getElementById('quiet-critical').checked = settings.quietHours.exceptCritical;
    }

    getDefaultNotificationSettings() {
        return {
            newPatient: true,
            patientUpdate: true,
            newTest: true,
            criticalResults: true,
            testReminder: false,
            systemUpdates: true,
            backupReminder: false,
            securityAlerts: true,
            email: true,
            browser: true,
            sms: false,
            push: false,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '07:00',
                exceptCritical: true
            }
        };
    }

    saveNotificationSettings() {
        const settings = {
            newPatient: document.getElementById('notif-new-patient').checked,
            patientUpdate: document.getElementById('notif-patient-update').checked,
            newTest: document.getElementById('notif-new-test').checked,
            criticalResults: document.getElementById('notif-critical-results').checked,
            testReminder: document.getElementById('notif-test-reminder').checked,
            systemUpdates: document.getElementById('notif-system-updates').checked,
            backupReminder: document.getElementById('notif-backup-reminder').checked,
            securityAlerts: document.getElementById('notif-security-alerts').checked,
            email: document.getElementById('channel-email').checked,
            browser: document.getElementById('channel-browser').checked,
            sms: document.getElementById('channel-sms').checked,
            push: document.getElementById('channel-push').checked,
            quietHours: {
                enabled: document.getElementById('quiet-hours-enabled').checked,
                start: document.getElementById('quiet-start').value,
                end: document.getElementById('quiet-end').value,
                exceptCritical: document.getElementById('quiet-critical').checked
            }
        };

        localStorage.setItem('medical_notification_settings', JSON.stringify(settings));
        this.showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
        this.hideModal('settingsModal');
    }

    saveNotifications() {
        localStorage.setItem('medical_notifications', JSON.stringify(this.notifications));
    }

    // دالة لإضافة إشعار جديد من أجزاء أخرى في النظام
    addNotification(notificationData) {
        const newNotification = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
            createdBy: this.currentUser.id,
            ...notificationData
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.applyFilters();
        
        // إظهار إشعار للمستخدم إذا كانت الإعدادات تسمح بذلك
        this.showDesktopNotification(newNotification);
        
        return newNotification.id;
    }

    showDesktopNotification(notification) {
        // التحقق من إعدادات المستخدم
        const settings = JSON.parse(localStorage.getItem('medical_notification_settings')) || this.getDefaultNotificationSettings();
        
        if (!settings.browser) return;

        // التحقق من دعم الإشعارات في المتصفح
        if (!("Notification" in window)) {
            return;
        }

        // التحقق من ساعات الهدوء
        if (this.isQuietHours() && !(settings.quietHours.exceptCritical && notification.type === 'critical')) {
            return;
        }

        // طلب الإذن لعرض الإشعارات
        if (Notification.permission === "granted") {
            this.createDesktopNotification(notification);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createDesktopNotification(notification);
                }
            });
        }
    }

    isQuietHours() {
        const settings = JSON.parse(localStorage.getItem('medical_notification_settings')) || this.getDefaultNotificationSettings();
        
        if (!settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const start = settings.quietHours.start;
        const end = settings.quietHours.end;

        if (start <= end) {
            return currentTime >= start && currentTime < end;
        } else {
            return currentTime >= start || currentTime < end;
        }
    }

    createDesktopNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.priority === 'high'
        };

        const desktopNotification = new Notification(notification.title, options);
        
        desktopNotification.onclick = () => {
            window.focus();
            this.viewDetails(notification.id);
            desktopNotification.close();
        };

        // إغلاق الإشعار تلقائياً بعد 5 ثوان (ما لم يكن عالي الأولوية)
        if (notification.priority !== 'high') {
            setTimeout(() => {
                desktopNotification.close();
            }, 5000);
        }
    }

    showNotification(message, type = 'info') {
        // استخدام نظام الإشعارات من authManager إذا كان متاحاً
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            // تنفيذ بدائي للإشعارات
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border-right: 4px solid ${this.getNotificationColor(type)};
                z-index: 3000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#2ecc71',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.notificationsManager = new NotificationsManager();
});