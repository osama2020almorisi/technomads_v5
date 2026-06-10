// نظام إدارة التنقل والتأثيرات
class NavigationManager {
    constructor() {
        this.isNavigating = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPageTransitions();
        this.setupScrollAnimations();
        this.setupMobileMenu();
    }

    setupNavigation() {
        // منع التنقل المتعدد
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && this.isInternalLink(link.href) && !this.isNavigating) {
                const href = link.getAttribute('href');
                
                if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            }
        });

        // التعامل مع زر الرجوع
        window.addEventListener('popstate', () => {
            this.handlePageLoad();
        });
    }

    isInternalLink(href) {
        return href.includes(window.location.origin) || href.startsWith('/') || !href.includes('://');
    }

    setupPageTransitions() {
        // إضافة تأثيرات الدخول للصفحة
        document.body.classList.add('page-transition');
        
        // إضافة class للمؤثرات الطبية
        this.addMedicalAnimations();
        
        // إخفاء شاشة التحميل بعد التهيئة
        this.hideLoadingScreen();
    }

    addMedicalAnimations() {
        // إضافة تأثيرات للعناصر المختلفة
        const medicalElements = document.querySelectorAll('.medical-element');
        medicalElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });

        // تأثيرات خاصة بالصفحات
        if (document.body.classList.contains('auth-page')) {
            this.addAuthPageAnimations();
        }
        
        if (document.body.classList.contains('index-page')) {
            this.addIndexPageAnimations();
        }
    }

    addAuthPageAnimations() {
        const benefits = document.querySelectorAll('.benefit');
        benefits.forEach((benefit, index) => {
            benefit.style.setProperty('--i', index);
        });

        const formElements = document.querySelectorAll('.form-group');
        formElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }

    addIndexPageAnimations() {
        // تأثيرات خاصة بالإحصائيات
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.classList.add('medical-heartbeat');
            }, index * 300);
        });
    }

    async navigateTo(url) {
        if (this.isNavigating) return;
        
        this.isNavigating = true;
        
        try {
            // تأثير الخروج
            await this.playExitAnimation();
            
            // الانتقال إلى الصفحة الجديدة
            window.location.href = url;
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.isNavigating = false;
        }
    }

    playExitAnimation() {
        return new Promise((resolve) => {
            const mainContent = document.querySelector('.auth-container') || 
                              document.querySelector('.container') || 
                              document.body;
            
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateX(30px)';
            mainContent.style.transition = 'all 0.5s ease-out';
            
            setTimeout(resolve, 500);
        });
    }

    handlePageLoad() {
        const mainContent = document.querySelector('.auth-container') || 
                          document.querySelector('.container') || 
                          document.body;
        
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateX(0)';
        this.addMedicalAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('medical-slide-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // مراقبة العناصر لإضافة المؤثرات
        const animatedElements = document.querySelectorAll('.feature-card, .step, .stat, .preview-stat');
        animatedElements.forEach(el => observer.observe(el));
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // تأثير للقائمة المتنقلة
                if (navMenu.classList.contains('active')) {
                    navMenu.style.animation = 'medicalSlideIn 0.3s ease-out';
                }
            });

            // إغلاق القائمة عند النقر على رابط
            const navLinks = navMenu.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    hideLoadingScreen() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingOverlay = document.querySelector('.loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.remove();
                    }, 1000);
                }
            }, 1000);
        });

        // fallback في حالة عدم تحميل الصفحة بالكامل
        setTimeout(() => {
            const loadingOverlay = document.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.remove();
                }, 1000);
            }
        }, 3000);
    }
}

// نظام التحميل
class LoadingManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupLoadingScreen();
    }

    setupLoadingScreen() {
        // التأكد من وجود شاشة التحميل
        if (!document.querySelector('.loading-overlay')) {
            const loadingHTML = `
                <div class="loading-overlay">
                    <div class="loading-content">
                        <div class="loading-logo">
                            <i class="fas fa-heartbeat medical-heartbeat"></i>
                        </div>
                        <h3>Pulse Health System</h3>
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                        <p>جاري تحميل النظام الصحي...</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loadingHTML);
        }
    }
}

// تهيئة جميع الأنظمة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام التنقل
    window.navigationManager = new NavigationManager();
    
    // تهيئة نظام التحميل
    window.loadingManager = new LoadingManager();
    
    // التأكد من تهيئة نظام المصادقة واللغة
    if (!window.authManager) {
        window.authManager = new AuthManager();
    }
    if (!window.languageManager) {
        window.languageManager = new LanguageManager();
    }
});

// إضافة تأثيرات للصفحة الحالية
function enhanceCurrentPage() {
    // تأثيرات خاصة بالصفحة الرئيسية
    if (document.body.classList.contains('index-page')) {
        addIndexPageAnimations();
    }
    
    // تأثيرات خاصة بصفحة تسجيل الدخول
    if (document.body.classList.contains('login-page')) {
        addLoginPageAnimations();
    }
    
    // تأثيرات خاصة بصفحة التسجيل
    if (document.body.classList.contains('register-page')) {
        addRegisterPageAnimations();
    }
}

function addIndexPageAnimations() {
    // تأثيرات إضافية للصفحة الرئيسية
    const heroButtons = document.querySelectorAll('.hero-actions .btn');
    heroButtons.forEach((btn, index) => {
        btn.style.animationDelay = `${index * 0.2}s`;
    });
}

function addLoginPageAnimations() {
    // تأثيرات خاصة بنموذج تسجيل الدخول
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.15}s`;
    });
}

function addRegisterPageAnimations() {
    // تأثيرات خاصة بصفحة التسجيل
    const benefits = document.querySelectorAll('.benefit');
    benefits.forEach((benefit, index) => {
        benefit.style.animationDelay = `${index * 0.1}s`;
    });
}

// تشغيل التأثيرات بعد تحميل الصفحة
window.addEventListener('load', enhanceCurrentPage);