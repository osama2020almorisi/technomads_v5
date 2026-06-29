// js/base.js - المدير الأساسي لجميع المديرين الآخرين
class BaseManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    // تحميل المستخدم الحالي
    loadCurrentUser() {
        try {
            this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser'));
        } catch (error) {
            console.error('Error loading current user:', error);
            this.currentUser = null;
        }
        return this.currentUser;
    }

    // تحميل البيانات من localStorage
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return [];
        }
    }

    // حفظ البيانات إلى localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    // تصفية البيانات الخاصة بالمستخدم الحالي
    filterUserData(data, userId = null) {
        const id = userId || (this.currentUser ? this.currentUser.id : null);
        if (!id) return data;
        return data.filter(item => item.createdBy === id);
    }

    // إعداد القائمة الجانبية للهواتف
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('show');
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeSidebar && sidebar && overlay) {
            closeSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        if (overlay && sidebar) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        // إغلاق القائمة عند النقر على رابط
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar) sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        });
    }

    // تحديث معلومات المستخدم في الشريط الجانبي
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

    // الحصول على نص التخصص
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

    // عرض إشعار
    showNotification(message, type = 'info') {
        // استخدام نظام الإشعارات من authManager إذا كان متاحاً
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
            return;
        }

        // تنفيذ بدائي للإشعارات
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        const colors = {
            'success': '#2ecc71',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-right: 4px solid ${colors[type] || '#3498db'};
            z-index: 3000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            direction: rtl;
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
        }, 3000);
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

    // تنسيق التاريخ
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'تاريخ غير معروف';
        }
    }

    // حساب العمر
    calculateAge(birthDate) {
        if (!birthDate) return 'غير محدد';

        try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();

            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }

            return age;
        } catch (error) {
            return 'غير محدد';
        }
    }

    // إنشاء معرف فريد
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    // التحقق من صحة البريد الإلكتروني
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // التحقق من صحة رقم الهاتف
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
    }

    // إعداد تبديل اللغة
    setupLanguageSwitcher() {
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const currentLang = document.documentElement.lang;
                if (window.languageManager) {
                    window.languageManager.switchLanguage(
                        currentLang === 'ar' ? 'en' : 'ar'
                    );
                }
            });
        }
    }
}

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseManager;
}