// نظام المصادقة المحسن - يعمل ببيانات المستخدم الحقيقية فقط
class SecureAuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('medical_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.setupPasswordStrength();
        this.setupMedicalAnimations();
    }

    // تشفير كلمة المرور
    hashPassword(password) {
        // في التطبيق الحقيقي نستخدم bcrypt، هذا نموذج مبسط
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36) + '_med_salt';
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    setupEventListeners() {
        // تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // إنشاء حساب
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // استعادة كلمة المرور
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // قوة كلمة المرور
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // تأثيرات الحقول
        this.setupInputAnimations();

        // تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // تبديل إظهار كلمة المرور
        this.setupPasswordToggle();
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentNode.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupMedicalAnimations() {
        // تأثيرات للشعار
        const logos = document.querySelectorAll('.nav-logo, .auth-logo');
        logos.forEach(logo => {
            logo.classList.add('medical-heartbeat');
        });
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('input-focused');
                input.style.borderColor = 'var(--primary)';
                input.style.boxShadow = '0 0 0 3px rgba(42, 125, 225, 0.1)';
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('input-focused');
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });

            input.addEventListener('input', () => {
                if (input.value) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        
        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        const strengthText = document.getElementById('password-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'ضعيفة جداً';
        let color = '#e74c3c';

        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/)) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 25;

        if (strength <= 25) {
            text = 'ضعيفة';
            color = 'var(--danger)';
        } else if (strength <= 50) {
            text = 'متوسطة';
            color = 'var(--warning)';
        } else if (strength <= 75) {
            text = 'جيدة';
            color = 'var(--info)';
        } else {
            text = 'قوية جداً';
            color = 'var(--success)';
        }

        strengthBar.style.width = Math.min(strength, 100) + '%';
        strengthBar.style.background = color;
        strengthBar.style.transition = 'all 0.5s ease';
        
        strengthText.textContent = text;
        strengthText.style.color = color;
        strengthText.style.transition = 'all 0.3s ease';
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!password || !confirmPassword) return;

        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--danger)';
            confirmPassword.style.animation = 'shake 0.5s';
            this.showFieldError(confirmPassword, 'كلمات المرور غير متطابقة');
        } else if (confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--success)';
            confirmPassword.style.animation = 'none';
            this.clearFieldError(confirmPassword);
        }
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger)';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleLogin() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        try {
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
                submitBtn.disabled = true;
            }

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked;

            const validation = this.validateLoginData(email, password);
            if (!validation.isValid) {
                this.showNotification(validation.message, 'error');
                return;
            }

            await this.delay(800);

            // البحث عن المستخدم بالبيانات الحقيقية فقط
            const user = this.users.find(u => u.email === email && this.verifyPassword(password, u.password));
            
            if (user && user.isActive !== false) {
                // تحديث آخر دخول
                user.lastLogin = new Date().toISOString();
                this.currentUser = user;
                localStorage.setItem('medical_currentUser', JSON.stringify(user));
                localStorage.setItem('medical_users', JSON.stringify(this.users));
                
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                this.showNotification(`مرحباً بعودتك د. ${user.firstName}`, 'success');
                
                await this.playSuccessAnimation();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification('بيانات الدخول غير صحيحة', 'error');
                this.playErrorAnimation();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('حدث خطأ غير متوقع', 'error');
        } finally {
            this.isProcessing = false;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
                submitBtn.disabled = false;
            }
        }
    }

    async handleRegister() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        
        try {
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
                submitBtn.disabled = true;
            }

            const formData = new FormData(document.getElementById('registerForm'));
            const userData = {
                id: 'user_' + Date.now(),
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim(),
                specialty: formData.get('specialty'),
                license: formData.get('license').trim(),
                password: formData.get('password'),
                role: 'doctor',
                createdAt: new Date().toISOString(),
                isActive: true,
                patients: [],
                tests: [],
                appointments: [],
                notifications: [],
                lastLogin: null
            };

            const validation = this.validateRegisterData(userData);
            if (!validation.isValid) {
                this.showNotification(validation.message, 'error');
                return;
            }

            // التحقق من عدم وجود مستخدم بنفس البريد
            if (this.users.find(u => u.email === userData.email)) {
                this.showNotification('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
                this.playErrorAnimation();
                return;
            }

            await this.delay(1500);

            // تشفير كلمة المرور قبل التخزين
            userData.password = this.hashPassword(userData.password);
            
            // إضافة المستخدم الجديد
            this.users.push(userData);
            this.currentUser = userData;
            
            localStorage.setItem('medical_users', JSON.stringify(this.users));
            localStorage.setItem('medical_currentUser', JSON.stringify(userData));

            this.showNotification('تم إنشاء الحساب بنجاح!', 'success');
            
            await this.playSuccessAnimation();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
        } finally {
            this.isProcessing = false;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء الحساب';
                submitBtn.disabled = false;
            }
        }
    }

    async handleForgotPassword() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const submitBtn = document.querySelector('#forgotPasswordForm button[type="submit"]');
        
        try {
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                submitBtn.disabled = true;
            }

            const email = document.getElementById('email').value.trim();

            if (!this.isValidEmail(email)) {
                this.showNotification('صيغة البريد الإلكتروني غير صحيحة', 'error');
                return;
            }

            // التحقق من وجود المستخدم
            const user = this.users.find(u => u.email === email);
            if (!user) {
                this.showNotification('لا يوجد حساب مرتبط بهذا البريد الإلكتروني', 'error');
                return;
            }

            await this.delay(1500);

            // محاكاة إرسال رابط استعادة كلمة المرور
            this.showNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('حدث خطأ أثناء إرسال رابط الاستعادة', 'error');
        } finally {
            this.isProcessing = false;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال رابط الاستعادة';
                submitBtn.disabled = false;
            }
        }
    }

    validateLoginData(email, password) {
        if (!email || !password) {
            return { isValid: false, message: 'يرجى ملء جميع الحقول' };
        }

        if (!this.isValidEmail(email)) {
            return { isValid: false, message: 'صيغة البريد الإلكتروني غير صحيحة' };
        }

        if (password.length < 6) {
            return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        return { isValid: true, message: 'البيانات صحيحة' };
    }

    validateRegisterData(data) {
        if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.specialty || !data.license || !data.password) {
            return { isValid: false, message: 'يرجى ملء جميع الحقول المطلوبة' };
        }

        if (!this.isValidEmail(data.email)) {
            return { isValid: false, message: 'صيغة البريد الإلكتروني غير صحيحة' };
        }

        if (!this.isValidPhone(data.phone)) {
            return { isValid: false, message: 'صيغة رقم الهاتف غير صحيحة' };
        }

        if (data.password.length < 8) {
            return { isValid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
        }

        const confirmPassword = document.getElementById('confirmPassword').value;
        if (data.password !== confirmPassword) {
            return { isValid: false, message: 'كلمتا المرور غير متطابقتين' };
        }

        if (!document.getElementById('agreeTerms')?.checked) {
            return { isValid: false, message: 'يرجى الموافقة على الشروط والأحكام' };
        }

        return { isValid: true, message: 'البيانات صحيحة' };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
    }

    checkAuthentication() {
        // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحات التسجيل
        if (this.currentUser) {
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html') ||
                window.location.pathname.includes('forgot-password.html') ||
                window.location.pathname.includes('index.html')) {
                window.location.href = 'dashboard.html';
            }
        }
        
        // إذا لم يكن مسجل دخول ويحاول الوصول للصفحات الداخلية
        if (!this.currentUser && (
            window.location.pathname.includes('dashboard.html') ||
            window.location.pathname.includes('patients.html') ||
            window.location.pathname.includes('analysis.html') ||
            window.location.pathname.includes('reports.html') ||
            window.location.pathname.includes('notifications.html') ||
            window.location.pathname.includes('settings.html')
        )) {
            window.location.href = 'login.html';
        }
    }

    logout() {
        this.playLogoutAnimation();
        setTimeout(() => {
            this.currentUser = null;
            localStorage.removeItem('medical_currentUser');
            localStorage.removeItem('rememberMe');
            this.showNotification('تم تسجيل الخروج بنجاح', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }, 1000);
    }

    async playSuccessAnimation() {
        const container = document.querySelector('.auth-container') || document.querySelector('.container');
        if (container) {
            container.style.transform = 'scale(0.95)';
            container.style.opacity = '0.8';
            await this.delay(300);
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
            container.style.transition = 'all 0.5s ease';
        }
    }

    playErrorAnimation() {
        const form = document.querySelector('form');
        if (form) {
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = 'none';
            }, 500);
        }
    }

    playLogoutAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'all 0.5s ease';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} medical-slide-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            border-right: 4px solid ${this.getNotificationColor(type)};
            z-index: 3000;
            max-width: 400px;
            direction: rtl;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            notification.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
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
            'success': 'var(--success)',
            'error': 'var(--danger)',
            'warning': 'var(--warning)',
            'info': 'var(--info)'
        };
        return colors[type] || 'var(--info)';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === دوال إدارة البيانات الحقيقية ===

    addPatient(patientData) {
        if (!this.currentUser) return false;
        
        const patient = {
            id: 'patient_' + Date.now(),
            ...patientData,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id,
            tests: [],
            appointments: []
        };
        
        // تحديث بيانات المستخدم
        if (!this.currentUser.patients) {
            this.currentUser.patients = [];
        }
        this.currentUser.patients.push(patient);
        this.updateUserData();
        return patient.id;
    }

    getPatients() {
        return this.currentUser?.patients || [];
    }

    getPatientById(patientId) {
        return this.currentUser?.patients?.find(p => p.id === patientId);
    }

    updatePatient(patientId, patientData) {
        if (!this.currentUser) return false;
        
        const patientIndex = this.currentUser.patients?.findIndex(p => p.id === patientId);
        if (patientIndex !== -1) {
            this.currentUser.patients[patientIndex] = {
                ...this.currentUser.patients[patientIndex],
                ...patientData,
                updatedAt: new Date().toISOString()
            };
            this.updateUserData();
            return true;
        }
        return false;
    }

    deletePatient(patientId) {
        if (!this.currentUser) return false;
        
        const patientIndex = this.currentUser.patients?.findIndex(p => p.id === patientId);
        if (patientIndex !== -1) {
            this.currentUser.patients.splice(patientIndex, 1);
            this.updateUserData();
            return true;
        }
        return false;
    }

    addTest(testData) {
        if (!this.currentUser) return false;
        
        const test = {
            id: 'test_' + Date.now(),
            ...testData,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id,
            status: 'pending'
        };
        
        // تحديث بيانات المستخدم
        if (!this.currentUser.tests) {
            this.currentUser.tests = [];
        }
        this.currentUser.tests.push(test);
        this.updateUserData();
        return test.id;
    }

    getTests() {
        return this.currentUser?.tests || [];
    }

    updateUserData() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('medical_users', JSON.stringify(this.users));
            localStorage.setItem('medical_currentUser', JSON.stringify(this.currentUser));
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // تحديث واجهة المستخدم بناءً على البيانات الحقيقية
    updateUIWithRealData() {
        if (!this.currentUser) return;

        // تحديث اسم المستخدم في الشريط الجانبي
        const userDisplayName = document.getElementById('user-display-name');
        const userSpecialty = document.getElementById('user-specialty');
        
        if (userDisplayName) {
            userDisplayName.textContent = `د. ${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        if (userSpecialty) {
            userSpecialty.textContent = this.getSpecialtyText(this.currentUser.specialty);
        }

        // تحديث رسالة الترحيب
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `مرحباً بعودتك، د. ${this.currentUser.firstName}`;
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

    // دالة لتهيئة البيانات الافتراضية إذا لزم الأمر
    initializeDefaultData() {
        if (this.users.length === 0) {
            // يمكن إضافة مستخدم افتراضي للتجربة
            const defaultUser = {
                id: 'user_default',
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'doctor@example.com',
                phone: '+966500000000',
                specialty: 'general',
                license: 'MED-000001',
                password: this.hashPassword('password123'),
                role: 'doctor',
                createdAt: new Date().toISOString(),
                isActive: true,
                patients: [],
                tests: [],
                appointments: [],
                notifications: [],
                lastLogin: null
            };
            
            this.users.push(defaultUser);
            localStorage.setItem('medical_users', JSON.stringify(this.users));
        }
    }
}

// دالة مساعدة للتبديل بين إظهار وإخفاء كلمة المرور
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// دالة للتحقق من صحة النماذج
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });

    return isValid;
}

// دالة لتنظيف الحقول بعد الإرسال
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        
        // تنظيف مؤشرات قوة كلمة المرور
        const strengthBar = document.getElementById('password-strength');
        const strengthText = document.getElementById('password-text');
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = 'قوة كلمة المرور';
    }
}

// تهيئة نظام المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new SecureAuthManager();
    
    // تهيئة البيانات الافتراضية إذا لزم الأمر
    window.authManager.initializeDefaultData();
    
    // تحديث الواجهة بالبيانات الحقيقية بعد التهيئة
    setTimeout(() => {
        if (window.authManager.currentUser) {
            window.authManager.updateUIWithRealData();
        }
    }, 100);
});

// إضافة أنماط CSS للحركات والتأثيرات
const authStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    .medical-heartbeat {
        animation: heartbeat 1.5s ease-in-out infinite;
    }
    
    @keyframes heartbeat {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .input-focused {
        position: relative;
    }
    
    .input-focused::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--primary);
        animation: inputFocus 0.3s ease;
    }
    
    @keyframes inputFocus {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
    }
    
    .has-value {
        border-color: var(--success) !important;
    }
    
    .field-error {
        color: var(--danger) !important;
        font-size: 12px !important;
        margin-top: 5px !important;
        animation: slideIn 0.3s ease;
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
    
    .notification.success {
        border-right-color: var(--success) !important;
    }
    
    .notification.error {
        border-right-color: var(--danger) !important;
    }
    
    .notification.warning {
        border-right-color: var(--warning) !important;
    }
    
    .notification.info {
        border-right-color: var(--info) !important;
    }
`;

// إضافة الأنماط إلى head
if (!document.querySelector('#auth-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'auth-styles';
    styleElement.textContent = authStyles;
    document.head.appendChild(styleElement);
}