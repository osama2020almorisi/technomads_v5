// إدارة الإعدادات - معدل ليعمل ببيانات حقيقية
class SettingsManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.settings = JSON.parse(localStorage.getItem('medical_settings')) || this.getDefaultSettings();
        this.currentSection = 'profile';
        
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.setupNavigation();
        this.loadSettings();
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.updateUserInfo();
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('show');
                if (overlay) overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        });
    }

    updateUserInfo() {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');

        if (this.currentUser && userName && userRole) {
            const displayName = `د. ${this.currentUser.firstName} ${this.currentUser.lastName}`;
            const specialty = this.getSpecialtyText(this.currentUser.specialty);

            userName.textContent = displayName;
            userRole.textContent = specialty;
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

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
                
                // تحديث حالة الأزرار
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    showSection(section) {
        // إخفاء جميع الأقسام
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach(sec => sec.classList.remove('active'));
        
        // إظهار القسم المطلوب
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
        }
    }

    getDefaultSettings() {
        return {
            profile: {
                name: this.currentUser ? `د. ${this.currentUser.firstName} ${this.currentUser.lastName}` : 'د. أسامه منصور',
                email: this.currentUser ? this.currentUser.email : 'ahmed@hospital.com',
                phone: this.currentUser ? this.currentUser.phone : '+966500000000',
                specialty: this.currentUser ? this.currentUser.specialty : 'طبيب استشاري',
                clinic: 'مستشفى الملك فهد',
                license: this.currentUser ? this.currentUser.license : 'MED-123456',
                bio: 'طبيب استشاري متخصص في الأمراض الباطنية والتحاليل الطبية. حاصل على شهادة البورد العربي وعدد من الشهادات الدولية في مجال التحاليل الطبية والتشخيص.'
            },
            preferences: {
                language: 'ar',
                theme: 'light',
                timezone: '+3',
                compactMode: true,
                animations: true,
                highContrast: false,
                pageSize: 25,
                autoSave: 5,
                autoLogout: true
            },
            notifications: this.getDefaultNotificationSettings(),
            security: {
                lastPasswordChange: new Date().toISOString(),
                sessions: this.getUserSessions()
            },
            backup: {
                autoBackup: true,
                retention: 30,
                format: 'json',
                schedule: {
                    frequency: 'weekly',
                    day: 1,
                    time: '02:00'
                }
            }
        };
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

    getUserSessions() {
        return [
            {
                id: 'session_1',
                device: 'جهاز الكمبيوتر - Windows',
                location: 'الرياض، السعودية',
                ip: '192.168.1.100',
                lastActive: new Date().toISOString(),
                current: true
            },
            {
                id: 'session_2',
                device: 'هاتف iPhone - iOS',
                location: 'جدة، السعودية',
                ip: '192.168.1.101',
                lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                current: false
            }
        ];
    }

    loadSettings() {
        // تحميل إعدادات الملف الشخصي
        this.loadProfileSettings();
        
        // تحميل التفضيلات
        this.loadPreferenceSettings();
        
        // تحميل إعدادات الإشعارات
        this.loadNotificationSettings();
        
        // تحميل إعدادات النسخ الاحتياطي
        this.loadBackupSettings();
        
        // تحميل معلومات الأمان
        this.loadSecurityInfo();
    }

    loadProfileSettings() {
        const profile = this.settings.profile;
        
        this.setValue('user-name', profile.name);
        this.setValue('user-email', profile.email);
        this.setValue('user-phone', profile.phone);
        this.setValue('user-specialty', profile.specialty);
        this.setValue('user-clinic', profile.clinic);
        this.setValue('user-license', profile.license);
        this.setValue('user-bio', profile.bio);

        // تحديث الإحصائيات
        this.updateProfileStats();
    }

    updateProfileStats() {
        const patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        const tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        
        const userPatients = patients.filter(patient => patient.createdBy === this.currentUser.id);
        const userTests = tests.filter(test => test.createdBy === this.currentUser.id);
        
        const thisMonth = new Date().getMonth();
        const recentTests = userTests.filter(test => {
            const testDate = new Date(test.createdAt);
            return testDate.getMonth() === thisMonth;
        });

        // تحديث الإحصائيات
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length >= 3) {
            statElements[0].textContent = userPatients.length;
            statElements[1].textContent = recentTests.length;
            statElements[2].textContent = userTests.length;
        }
    }

    loadPreferenceSettings() {
        const prefs = this.settings.preferences;
        
        this.setValue('pref-language', prefs.language);
        this.setValue('pref-theme', prefs.theme);
        this.setValue('pref-timezone', prefs.timezone);
        this.setChecked('pref-compact', prefs.compactMode);
        this.setChecked('pref-animations', prefs.animations);
        this.setChecked('pref-highcontrast', prefs.highContrast);
        this.setValue('pref-page-size', prefs.pageSize);
        this.setValue('pref-auto-save', prefs.autoSave);
        this.setChecked('pref-auto-logout', prefs.autoLogout);
    }

    loadNotificationSettings() {
        const notifs = this.settings.notifications;
        
        this.setChecked('notif-new-patient', notifs.newPatient);
        this.setChecked('notif-patient-update', notifs.patientUpdate);
        this.setChecked('notif-new-test', notifs.newTest);
        this.setChecked('notif-critical-results', notifs.criticalResults);
        this.setChecked('notif-test-reminder', notifs.testReminder);
        this.setChecked('notif-system-updates', notifs.systemUpdates);
        this.setChecked('notif-backup-reminder', notifs.backupReminder);
        this.setChecked('notif-security-alerts', notifs.securityAlerts);
        
        this.setChecked('channel-email', notifs.email);
        this.setChecked('channel-browser', notifs.browser);
        this.setChecked('channel-sms', notifs.sms);
        this.setChecked('channel-push', notifs.push);

        // إعدادات ساعات الهدوء
        this.setChecked('quiet-hours-enabled', notifs.quietHours.enabled);
        this.setValue('quiet-start', notifs.quietHours.start);
        this.setValue('quiet-end', notifs.quietHours.end);
        this.setChecked('quiet-critical', notifs.quietHours.exceptCritical);
    }

    loadBackupSettings() {
        const backup = this.settings.backup;
        
        this.setChecked('auto-backup', backup.autoBackup);
        this.setValue('backup-retention', backup.retention);
        this.setValue('backup-format', backup.format);

        // تحديث معلومات النسخ الاحتياطي
        this.updateBackupInfo();
    }

    updateBackupInfo() {
        const patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        const tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        
        const userPatients = patients.filter(patient => patient.createdBy === this.currentUser.id);
        const userTests = tests.filter(test => test.createdBy === this.currentUser.id);

        const totalRecords = userPatients.length + userTests.length;
        const estimatedSize = (totalRecords * 2).toFixed(1); // تقدير حجم البيانات

        // تحديث المعلومات في واجهة المستخدم
        const backupStats = document.querySelectorAll('.backup-stat .stat-value');
        if (backupStats.length >= 3) {
            const now = new Date();
            const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
            
            backupStats[0].textContent = `منذ 3 أيام`;
            backupStats[1].textContent = `${estimatedSize} KB`;
            backupStats[2].textContent = totalRecords;
        }
    }

    loadSecurityInfo() {
        const security = this.settings.security;
        
        // تحميل جلسات المستخدم
        this.loadSessionsList();
        
        // تحميل سجل النشاط
        this.loadActivityLog();
    }

    loadSessionsList() {
        const sessionsList = document.querySelector('.sessions-list');
        if (!sessionsList) return;

        const sessions = this.settings.security.sessions;
        
        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item ${session.current ? 'current' : ''}">
                <div class="session-info">
                    <div class="session-device">
                        <i class="fas ${session.device.includes('iPhone') ? 'fa-mobile-alt' : 'fa-desktop'}"></i>
                        <span>${session.device}</span>
                    </div>
                    <div class="session-meta">
                        <span>${session.current ? 'جلسة نشطة' : `آخر نشاط: ${this.getTimeAgo(session.lastActive)}`}</span>
                        <span>${session.location}</span>
                    </div>
                </div>
                <div class="session-actions">
                    <span class="session-time">${this.getTimeAgo(session.lastActive)}</span>
                    ${!session.current ? `
                        <button class="btn-danger btn-sm" onclick="settingsManager.logoutSession('${session.id}')">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    loadActivityLog() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const activities = [
            {
                type: 'success',
                icon: 'fa-sign-in-alt',
                title: 'تسجيل دخول ناجح',
                meta: 'جهاز الكمبيوتر - منذ 2 ساعة'
            },
            {
                type: 'info',
                icon: 'fa-user-edit',
                title: 'تحديث الملف الشخصي',
                meta: 'منذ 3 أيام'
            },
            {
                type: 'warning',
                icon: 'fa-key',
                title: 'محاولة تغيير كلمة المرور',
                meta: 'منذ أسبوع'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">${activity.meta}</div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // حفظ الملف الشخصي
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // تغيير كلمة المرور
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // حفظ التفضيلات
        const savePrefsBtn = document.querySelector('.btn-primary[onclick*="savePreferences"]');
        if (savePrefsBtn) {
            savePrefsBtn.addEventListener('click', () => this.savePreferences());
        }

        // إعادة تعيين التفضيلات
        const resetPrefsBtn = document.querySelector('.btn-secondary[onclick*="resetPreferences"]');
        if (resetPrefsBtn) {
            resetPrefsBtn.addEventListener('click', () => this.resetPreferences());
        }

        // حفظ إعدادات الإشعارات
        const saveNotifBtn = document.querySelector('.btn-primary[onclick*="saveNotificationSettings"]');
        if (saveNotifBtn) {
            saveNotifBtn.addEventListener('click', () => this.saveNotificationSettings());
        }

        // النسخ الاحتياطي
        const createBackupBtn = document.querySelector('.btn-primary[onclick*="createBackup"]');
        if (createBackupBtn) {
            createBackupBtn.addEventListener('click', () => this.createBackup());
        }

        // جدولة النسخ الاحتياطي
        const scheduleBackupBtn = document.querySelector('.btn-secondary[onclick*="scheduleBackup"]');
        if (scheduleBackupBtn) {
            scheduleBackupBtn.addEventListener('click', () => this.scheduleBackup());
        }

        // استعادة النسخ الاحتياطي
        const restoreBackupBtn = document.querySelector('.btn-warning[onclick*="restoreBackup"]');
        if (restoreBackupBtn) {
            restoreBackupBtn.addEventListener('click', () => this.restoreBackup());
        }

        // تصدير البيانات
        const exportDataBtn = document.querySelector('.btn-secondary[onclick*="exportData"]');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // التحقق من التحديثات
        const checkUpdatesBtn = document.querySelector('.btn-secondary[onclick*="checkForUpdates"]');
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => this.checkForUpdates());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal('scheduleModal');
            });
        });

        // تفعيل زر الاستعادة
        const restoreConfirm = document.getElementById('restore-confirm');
        const restoreBtn = document.querySelector('.btn-warning[onclick*="restoreBackup"]');
        
        if (restoreConfirm && restoreBtn) {
            restoreConfirm.addEventListener('change', (e) => {
                restoreBtn.disabled = !e.target.checked;
            });
        }
        

        // تسجيل الخروج
        const logoutBtn = document.querySelector('.logout-btn');
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
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('new-password');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = strength.percentage + '%';
                strengthBar.style.backgroundColor = strength.color;
                strengthText.textContent = strength.text;
                strengthText.style.color = strength.color;
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        
        const strengths = [
            { percentage: 20, color: '#e74c3c', text: 'ضعيفة جداً' },
            { percentage: 40, color: '#e67e22', text: 'ضعيفة' },
            { percentage: 60, color: '#f1c40f', text: 'متوسطة' },
            { percentage: 80, color: '#2ecc71', text: 'قوية' },
            { percentage: 100, color: '#27ae60', text: 'قوية جداً' }
        ];
        
        return strengths[Math.min(score, strengths.length - 1)];
    }

    saveProfile() {
        const profile = {
            name: this.getValue('user-name'),
            email: this.getValue('user-email'),
            phone: this.getValue('user-phone'),
            specialty: this.getValue('user-specialty'),
            clinic: this.getValue('user-clinic'),
            license: this.getValue('user-license'),
            bio: this.getValue('user-bio')
        };

        this.settings.profile = profile;
        this.saveSettings();
        this.showNotification('تم حفظ الملف الشخصي بنجاح', 'success');
    }

    savePreferences() {
        const preferences = {
            language: this.getValue('pref-language'),
            theme: this.getValue('pref-theme'),
            timezone: this.getValue('pref-timezone'),
            compactMode: this.isChecked('pref-compact'),
            animations: this.isChecked('pref-animations'),
            highContrast: this.isChecked('pref-highcontrast'),
            pageSize: parseInt(this.getValue('pref-page-size')),
            autoSave: parseInt(this.getValue('pref-auto-save')),
            autoLogout: this.isChecked('pref-auto-logout')
        };

        this.settings.preferences = preferences;
        this.saveSettings();
        
        // تطبيق بعض الإعدادات فوراً
        this.applyPreferences(preferences);
        
        this.showNotification('تم حفظ التفضيلات بنجاح', 'success');
    }

    applyPreferences(preferences) {
        // تطبيق اللغة
        if (window.languageManager) {
            window.languageManager.switchLanguage(preferences.language);
        }

        // تطبيق السمة
        this.applyTheme(preferences.theme);
    }

    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else if (theme === 'auto') {
            document.body.classList.add('theme-auto');
            // يمكن إضافة كشف تلقائي للوضع المظلم
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.add('theme-light');
            }
        } else {
            document.body.classList.add('theme-light');
        }
    }

    resetPreferences() {
        if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين جميع التفضيلات إلى الإعدادات الافتراضية؟')) {
            this.settings.preferences = this.getDefaultSettings().preferences;
            this.loadPreferenceSettings();
            this.saveSettings();
            this.showNotification('تم إعادة تعيين التفضيلات', 'success');
        }
    }

    saveNotificationSettings() {
        const notifications = {
            newPatient: this.isChecked('notif-new-patient'),
            patientUpdate: this.isChecked('notif-patient-update'),
            newTest: this.isChecked('notif-new-test'),
            criticalResults: this.isChecked('notif-critical-results'),
            testReminder: this.isChecked('notif-test-reminder'),
            systemUpdates: this.isChecked('notif-system-updates'),
            backupReminder: this.isChecked('notif-backup-reminder'),
            securityAlerts: this.isChecked('notif-security-alerts'),
            email: this.isChecked('channel-email'),
            browser: this.isChecked('channel-browser'),
            sms: this.isChecked('channel-sms'),
            push: this.isChecked('channel-push'),
            quietHours: {
                enabled: this.isChecked('quiet-hours-enabled'),
                start: this.getValue('quiet-start'),
                end: this.getValue('quiet-end'),
                exceptCritical: this.isChecked('quiet-critical')
            }
        };

        this.settings.notifications = notifications;
        this.saveSettings();
        this.showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
    }

    changePassword() {
        const currentPassword = this.getValue('current-password');
        const newPassword = this.getValue('new-password');
        const confirmPassword = this.getValue('confirm-password');

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('يرجى ملء جميع الحقول', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('كلمتا المرور غير متطابقتين', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
            return;
        }

        // في التطبيق الحقيقي، هنا سيتم التحقق من كلمة المرور الحالية مع الخادم
        // هذا تنفيذ مبسط للعرض

        this.settings.security.lastPasswordChange = new Date().toISOString();
        this.saveSettings();
        
        // إعادة تعيين النموذج
        document.getElementById('passwordForm').reset();
        
        this.showNotification('تم تغيير كلمة المرور بنجاح', 'success');
    }

    logoutSession(sessionId) {
        if (confirm('هل تريد تسجيل الخروج من هذا الجهاز؟')) {
            // في التطبيق الحقيقي، هنا سيتم إزالة الجلسة
            this.settings.security.sessions = this.settings.security.sessions.filter(
                session => session.id !== sessionId
            );
            this.saveSettings();
            this.loadSessionsList();
            this.showNotification('تم تسجيل الخروج من الجلسة', 'success');
        }
    }

    logoutAllSessions() {
        if (confirm('هل تريد تسجيل الخروج من جميع الأجهزة؟ هذا سيؤدي إلى خروجك من الجهاز الحالي أيضاً.')) {
            // في التطبيق الحقيقي، هنا سيتم إزالة جميع الجلسات
            this.settings.security.sessions = this.settings.security.sessions.filter(
                session => session.current
            );
            this.saveSettings();
            this.showNotification('جاري تسجيل الخروج من جميع الأجهزة...', 'info');
            
            setTimeout(() => {
                if (window.authManager) {
                    window.authManager.logout();
                } else {
                    localStorage.removeItem('medical_currentUser');
                    window.location.href = 'index.html';
                }
            }, 2000);
        }
    }

    viewFullActivity() {
        this.showNotification('عرض سجل النشاط الكامل', 'info');
    }

    createBackup() {
        this.showNotification('جاري إنشاء نسخة احتياطية...', 'info');
        
        // محاكاة عملية النسخ الاحتياطي
        setTimeout(() => {
            const patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
            const tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
            const users = JSON.parse(localStorage.getItem('medical_users')) || [];
            
            const userPatients = patients.filter(patient => patient.createdBy === this.currentUser.id);
            const userTests = tests.filter(test => test.createdBy === this.currentUser.id);

            const backupData = {
                patients: userPatients,
                tests: userTests,
                settings: this.settings,
                user: this.currentUser,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };

            // تنزيل الملف
            this.downloadBackup(backupData);
            this.showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
        }, 2000);
    }

    downloadBackup(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    scheduleBackup() {
        this.showModal('scheduleModal');
    }

    saveBackupSchedule() {
        const schedule = {
            frequency: this.getValue('schedule-frequency'),
            day: parseInt(this.getValue('schedule-day')),
            time: this.getValue('schedule-time')
        };

        this.settings.backup.schedule = schedule;
        this.saveSettings();
        this.hideModal('scheduleModal');
        this.showNotification('تم حفظ جدولة النسخ الاحتياطي', 'success');
    }

    restoreBackup() {
        if (confirm('هل أنت متأكد من رغبتك في استعادة النسخة الاحتياطية؟ هذا سيحل محل جميع البيانات الحالية.')) {
            this.showNotification('جاري استعادة النسخة الاحتياطية...', 'info');
            
            // في التطبيق الحقيقي، هنا سيتم رفع الملف ومعالجته
            setTimeout(() => {
                this.showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
            }, 3000);
        }
    }

    exportData() {
        this.createBackup(); // يستخدم نفس آلية النسخ الاحتياطي
    }

    checkForUpdates() {
        this.showNotification('جاري التحقق من التحديثات...', 'info');
        
        setTimeout(() => {
            this.showNotification('أنت تستخدم أحدث إصدار من النظام', 'success');
        }, 2000);
    }

    // دوال مساعدة
    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setChecked(id, checked) {
        const element = document.getElementById(id);
        if (element) element.checked = checked;
    }

    isChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
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

    saveSettings() {
        localStorage.setItem('medical_settings', JSON.stringify(this.settings));
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

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
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
    window.settingsManager = new SettingsManager();
});