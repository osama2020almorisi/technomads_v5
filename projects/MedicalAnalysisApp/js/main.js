// الملف الرئيسي للنظام - إدارة التنقل والتأثيرات العامة مع بيانات حقيقية
class MainSystem {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupLoadingScreen();
        this.setupMobileMenu();
        this.setupAnimations();
        this.setupRealDataHandlers();
    }

    setupNavigation() {
        // منع السلوك الافتراضي للروابط
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#"]')) {
                e.preventDefault();
            }
        });

        // تأثيرات التنقل السلس
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollEffects() {
        // تأثير الشريط التنقل عند التمرير
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        if (navbar) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.backdropFilter = 'blur(10px)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'white';
                    navbar.style.backdropFilter = 'none';
                    navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                }

                // إخفاء/إظهار الشريط بناءً على اتجاه التمرير
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
            }, { passive: true });
        }

        // ظهور العناصر عند التمرير
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // مراقبة العناصر لإضافة تأثيرات الظهور
        const animatedElements = document.querySelectorAll('.feature-card, .step, .preview-stat');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    setupLoadingScreen() {
        // إخفاء شاشة التحميل بعد تحميل الصفحة
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingOverlay = document.querySelector('.loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.opacity = '0';
                    loadingOverlay.style.visibility = 'hidden';
                    loadingOverlay.style.transition = 'all 0.5s ease';
                    
                    setTimeout(() => {
                        loadingOverlay.remove();
                    }, 500);
                }
            }, 1000);
        });

        // إظهار شاشة التحميل عند الانتقال بين الصفحات
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes('javascript:') && 
                !link.getAttribute('href').startsWith('#')) {
                const loadingOverlay = document.querySelector('.loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.opacity = '1';
                    loadingOverlay.style.visibility = 'visible';
                }
            }
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.isMenuOpen = !this.isMenuOpen;
                navMenu.classList.toggle('active');
                navToggle.querySelector('i').classList.toggle('fa-bars');
                navToggle.querySelector('i').classList.toggle('fa-times');
                
                // تأثيرات القائمة
                if (this.isMenuOpen) {
                    document.body.style.overflow = 'hidden';
                    navMenu.style.transform = 'translateX(0)';
                } else {
                    document.body.style.overflow = '';
                    navMenu.style.transform = 'translateX(100%)';
                }
            });

            // إغلاق القائمة عند النقر على رابط
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.querySelector('i').classList.add('fa-bars');
                    navToggle.querySelector('i').classList.remove('fa-times');
                    document.body.style.overflow = '';
                    this.isMenuOpen = false;
                });
            });
        }
    }

    setupAnimations() {
        // تأثيرات التمرير اللطيف
        this.setupSmoothScrolling();
        
        // تأثيرات التحويم
        this.setupHoverEffects();
    }

    setupSmoothScrolling() {
        // تحسين أداء التمرير
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateScrollEffects() {
        // تحديث المؤشرات والتأثيرات بناءً على الموقع
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // تأثير التلاشي للعناصر
        const elements = document.querySelectorAll('.fade-on-scroll');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementVisible = 150;
            
            if (scrollY > elementTop - windowHeight + elementVisible) {
                el.classList.add('active');
            }
        });
    }

    setupHoverEffects() {
        // تأثيرات التحويم للبطاقات
        const cards = document.querySelectorAll('.feature-card, .dashboard-preview');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // تأثيرات الأزرار
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    setupRealDataHandlers() {
        // تحديث الإحصائيات بالبيانات الحقيقية
        this.updateRealTimeStats();
        
        // إعداد معالجات البحث
        this.setupSearchHandlers();
        
        // تحديث واجهة المستخدم بناءً على حالة المصادقة
        this.updateUIForAuthentication();
    }

    updateRealTimeStats() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        
        // تحديث الإحصائيات في لوحة التحكم
        this.updateDashboardStats(user);
        
        // تحديث الإحصائيات في معاينة اللوحة
        this.updatePreviewStats(user);
    }

    updateDashboardStats(user) {
        const totalPatients = user.patients?.length || 0;
        const totalTests = user.tests?.length || 0;
        const pendingReviews = user.tests?.filter(t => t.status === 'pending').length || 0;
        
        // تحديث بطاقات الإحصائيات
        const totalPatientsEl = document.getElementById('total-patients');
        const totalTestsEl = document.getElementById('total-tests');
        const pendingReviewsEl = document.getElementById('pending-reviews');
        
        if (totalPatientsEl) totalPatientsEl.textContent = totalPatients;
        if (totalTestsEl) totalTestsEl.textContent = totalTests;
        if (pendingReviewsEl) pendingReviewsEl.textContent = pendingReviews;
    }

    updatePreviewStats(user) {
        const totalPatients = user.patients?.length || 0;
        const today = new Date().toISOString().split('T')[0];
        const testsToday = user.tests?.filter(t => 
            t.createdAt && t.createdAt.startsWith(today)
        ).length || 0;

        // تحديث الإحصائيات في المعاينة
        const patientStats = document.querySelectorAll('.preview-stat-number');
        if (patientStats.length >= 2) {
            patientStats[0].textContent = totalPatients;
            patientStats[1].textContent = testsToday;
        }
    }

    setupSearchHandlers() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }
    }

    handleGlobalSearch(query) {
        if (!query.trim()) {
            // إعادة عرض جميع البيانات إذا كان البحث فارغاً
            this.updateRealTimeStats();
            return;
        }

        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        const searchTerm = query.toLowerCase();

        // البحث في المرضى
        const filteredPatients = user.patients?.filter(patient => 
            patient.name?.toLowerCase().includes(searchTerm) ||
            patient.medicalId?.toLowerCase().includes(searchTerm)
        ) || [];

        // البحث في التحاليل
        const filteredTests = user.tests?.filter(test => 
            test.patientName?.toLowerCase().includes(searchTerm) ||
            test.type?.toLowerCase().includes(searchTerm)
        ) || [];

        // تحديث الواجهة بنتائج البحث
        this.displaySearchResults(filteredPatients, filteredTests);
    }

    displaySearchResults(patients, tests) {
        // هنا يمكن تحديث واجهة المستخدم لعرض نتائج البحث
        // هذا يعتمد على الصفحة الحالية والتصميم
        console.log('نتائج البحث:', { patients, tests });
    }

    updateUIForAuthentication() {
        const authManager = window.authManager;
        if (!authManager) return;

        // تحديث الروابط في الصفحة الرئيسية بناءً على حالة المصادقة
        if (authManager.currentUser) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
    }

    updateUIForLoggedInUser() {
        const authManager = window.authManager;
        if (!authManager.currentUser) return;

        // تحديث الروابط في الصفحة الرئيسية
        const loginBtn = document.querySelector('a[href="login.html"]');
        const registerBtn = document.querySelector('a[href="register.html"]');
        
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'لوحة التحكم';
            loginBtn.href = 'dashboard.html';
            registerBtn.style.display = 'none';
        }

        // تحديث الإحصائيات بالبيانات الحقيقية
        this.updateRealTimeStats();
    }

    updateUIForLoggedOutUser() {
        // إعادة تعيين الروابط للحالة العادية
        const loginBtn = document.querySelector('a[href="dashboard.html"]');
        const registerBtn = document.querySelector('a.nav-link.primary-btn');
        
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'تسجيل الدخول';
            loginBtn.href = 'login.html';
            registerBtn.style.display = 'block';
        }
    }

    // دالة مساعدة للانتقال بين الصفحات مع تأثيرات
    navigateTo(url, data = {}) {
        const loadingOverlay = document.querySelector('.loading-overlay') || this.createLoadingOverlay();
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
        
        // حفظ البيانات إذا لزم الأمر
        if (Object.keys(data).length > 0) {
            sessionStorage.setItem('pageData', JSON.stringify(data));
        }
        
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-logo">
                    <i class="fas fa-heartbeat pulse-animation"></i>
                </div>
                <h3>Pulse Health System</h3>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
                <p>جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // دالة مساعدة لعرض البيانات الحقيقية في القوائم
    displayRealDataList(containerId, data, itemRenderer) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(containerId);
            return;
        }

        container.innerHTML = data.map(item => itemRenderer(item)).join('');
    }

    getEmptyStateHTML(containerId) {
        const emptyStates = {
            'recent-patients-list': `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>لا يوجد مرضى مسجلين بعد</p>
                    <button class="btn-primary" onclick="location.href='patients.html'">إضافة أول مريض</button>
                </div>
            `,
            'recent-tests-list': `
                <div class="empty-state">
                    <i class="fas fa-vial"></i>
                    <p>لا توجد تحاليل مسجلة بعد</p>
                    <button class="btn-primary" onclick="location.href='analysis.html'">تسجيل أول تحليل</button>
                </div>
            `,
            'notifications-list': `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات حالياً</p>
                </div>
            `
        };

        return emptyStates[containerId] || `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>لا توجد بيانات لعرضها</p>
            </div>
        `;
    }
}

// CSS إضافي للحركات والتأثيرات
const additionalStyles = `
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

    .animate-in {
        animation: medicalSlideIn 0.6s ease-out forwards;
    }
    
    .fade-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .fade-on-scroll.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes medicalSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .nav-menu {
        transition: transform 0.3s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            transform: translateX(100%);
        }
        
        .nav-menu.active {
            transform: translateX(0);
        }
    }

    .input-focused {
        position: relative;
    }

    .has-value {
        border-color: var(--success) !important;
    }

    .medical-heartbeat {
        animation: heartbeat 1.5s ease-in-out infinite;
    }

    @keyframes heartbeat {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;

// إضافة الأنماط الإضافية
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// تهيئة النظام الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    window.mainSystem = new MainSystem();
});

// دالة مساعدة للتحقق من صحة النماذج
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}

// دالة مساعدة لتنسيق التواريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}