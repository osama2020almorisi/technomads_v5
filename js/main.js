/* ============================================
   TechNomads - Main JavaScript (Improved)
   الريادة التقنية اليمنية - نسخة محسنة
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة جميع المكونات
    initNavigation();
    initHeaderScroll();
    initTypingEffect();
    initCounters();
    initAppSlider();
    initParticles();
    initThemeToggle();
    initBackToTop();
    initNewsletterForm();
    initAOS();
    initLazyLoading();
    updateCopyrightYear();
    initSmoothScroll();
    initLanguageSwitcher();
    initLogoThemeSync();
});

/* ============================================
   NAVIGATION - التنقل
   ============================================ */
function initNavigation() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('close-nav-btn');

    if (!hamburgerBtn || !mobileNav) return;

    function toggleMenu() {
        mobileNav.classList.toggle('active');
        hamburgerBtn.classList.toggle('active');
        const isOpen = mobileNav.classList.contains('active');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        mobileNav.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }

    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', toggleMenu);
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!mobileNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            if (mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        }
    });

    // إغلاق القائمة عند النقر على رابط
    const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu();
        });
    });

    // إغلاق القائمة عند الضغط على Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });
}

/* ============================================
   HEADER SCROLL - تأثير التمرير على الهيدر
   ============================================ */
function initHeaderScroll() {
    let lastScroll = 0;
    const header = document.querySelector('.smart-header');
    let ticking = false;

    if (!header) return;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    if (currentScroll > lastScroll) {
                        // التمرير لأسفل
                        header.classList.add('scrolled-down');
                        header.classList.remove('scrolled-up');
                    } else {
                        // التمرير لأعلى
                        header.classList.add('scrolled-up');
                        header.classList.remove('scrolled-down');
                    }
                } else {
                    header.classList.remove('scrolled-up', 'scrolled-down');
                }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   TYPING EFFECT - تأثير الكتابة
   ============================================ */
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');

    if (!typingElement) return;

    const strings = JSON.parse(typingElement.getAttribute('data-strings') || '["ابتكارات رقمية"]');
    let currentStringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150;

    function type() {
        const currentString = strings[currentStringIndex];

        if (isDeleting) {
            typingElement.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 80;
        } else {
            typingElement.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150;
        }

        if (!isDeleting && charIndex === currentString.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentStringIndex = (currentStringIndex + 1) % strings.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

/* ============================================
   COUNTERS - العدادات
   ============================================ */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    if (counters.length === 0) return;

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            requestAnimationFrame(() => animateCounter(counter));
        } else {
            counter.innerText = target;
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                counter.innerText = '0';
                animateCounter(counter);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   APP SLIDER - شريط تطبيقات
   ============================================ */
function initAppSlider() {
    const appSlider = document.querySelector('.app-slider');

    if (!appSlider) return;

    const slides = appSlider.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentIndex = 0;

    function changeSlide() {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }

    // التحقق من تحميل الصور
    const checkImagesLoaded = () => {
        let allLoaded = true;
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img && !img.complete) {
                allLoaded = false;
            }
        });
        return allLoaded;
    };

    if (checkImagesLoaded()) {
        setInterval(changeSlide, 3000);
    } else {
        window.addEventListener('load', () => {
            setInterval(changeSlide, 3000);
        });
    }
}

/* ============================================
   PARTICLES JS - جسيمات الخلفية
   ============================================ */
function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    particlesJS('particles-js', {
        particles: {
            number: { 
                value: 80, 
                density: { enable: true, value_area: 800 } 
            },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { 
                enable: true, 
                distance: 150, 
                color: "#ffffff", 
                opacity: 0.3, 
                width: 1 
            },
            move: { 
                enable: true, 
                speed: 2, 
                direction: "none", 
                random: true, 
                straight: false, 
                out_mode: "out" 
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

/* ============================================
   THEME TOGGLE - تبديل الوضع الداكن
   ============================================ */
function initThemeToggle() {
    const body = document.body;

    // التحقق من التفضيل المحفوظ
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    // تحديث الشعار فوراً
    updateLogoTheme();

    // زر تبديل الوضع في قائمة الهامبرغر
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateLogoTheme();
            updateMobileThemeText();
            showNotification(isDark ? 'تم تفعيل الوضع الداكن' : 'تم تفعيل الوضع الفاتح', 'success');
        });
    }

    // الاستماع لتغير تفضيلات النظام
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                body.classList.toggle('dark-mode', e.matches);
                updateLogoTheme();
            }
        });
    }
}

/* تحديث نص زر الوضع في الموبايل */
function updateMobileThemeText() {
    const mobileThemeText = document.querySelector('.mobile-theme-text');
    if (mobileThemeText) {
        const isDark = document.body.classList.contains('dark-mode');
        mobileThemeText.textContent = isDark ? 'فاتح' : 'داكن';
    }
}

/* تحديث ألوان الشعار SVG */
function updateLogoTheme() {
    const isDark = document.body.classList.contains('dark-mode');

    // تحديث الشعار الرئيسي
    const logoSvg = document.querySelector('.logo-svg');
    if (logoSvg) {
        const circle = logoSvg.querySelector('.logo-circle');
        const triangle = logoSvg.querySelector('.logo-triangle');
        const dot = logoSvg.querySelector('.logo-dot');

        if (circle) circle.setAttribute('stroke', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
        if (triangle) triangle.setAttribute('stroke', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
        if (dot) dot.setAttribute('fill', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
    }

    // تحديث شعار الهامبرغر
    const mobileLogoSvg = document.querySelector('.mobile-logo-svg');
    if (mobileLogoSvg) {
        const circle = mobileLogoSvg.querySelector('.logo-circle');
        const triangle = mobileLogoSvg.querySelector('.logo-triangle');
        const dot = mobileLogoSvg.querySelector('.logo-dot');

        if (circle) circle.setAttribute('stroke', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
        if (triangle) triangle.setAttribute('stroke', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
        if (dot) dot.setAttribute('fill', isDark ? 'url(#logoGradDark)' : 'url(#logoGrad)');
    }
}

/* ============================================
   BACK TO TOP - زر العودة للأعلى
   ============================================ */
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');

    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ============================================
   NEWSLETTER FORM - نموذج النشرة البريدية
   ============================================ */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');

        if (emailInput && emailInput.value) {
            // محاكاة إرسال البريد
            const btn = this.querySelector('.subscribe-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            btn.disabled = true;

            setTimeout(() => {
                showNotification('شكراً للاشتراك في نشرتنا البريدية!', 'success');
                emailInput.value = '';
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        }
    });
}

/* ============================================
   AOS INITIALIZATION - تهيئة AOS
   ============================================ */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
            disable: function() {
                return window.innerWidth < 768; // تعطيل على الموبايل للأداء
            }
        });
    }
}

/* ============================================
   NOTIFICATION SYSTEM - نظام الإشعارات
   ============================================ */
function showNotification(message, type = 'info') {
    // إزالة الإشعارات السابقة
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };

    const colors = {
        success: '#4ECDC4',
        error: '#FF6B6B',
        info: '#2A2D7C',
        warning: '#f39c12'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: 'Tajawal', sans-serif;
        min-width: 280px;
        justify-content: space-between;
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        padding: 0.2rem;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;

    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    });

    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 4000);
}

/* ============================================
   LAZY LOADING - التحميل الكسول للصور
   ============================================ */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (lazyImages.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ============================================
   UPDATE COPYRIGHT YEAR - تحديث سنة حقوق النشر
   ============================================ */
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS - التمرير السلس
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.smart-header')?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   LANGUAGE SWITCHER - مبدل اللغة
   ============================================ */
function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn, .mobile-lang-btn');

    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');

            // إزالة النشاط من جميع الأزرار
            document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(b => {
                b.classList.remove('active');
            });

            // إضافة النشاط للزر المحدد
            document.querySelectorAll(`[data-lang="${lang}"]`).forEach(b => {
                b.classList.add('active');
            });

            // حفظ التفضيل
            localStorage.setItem('language', lang);

            // إشعار
            showNotification(`تم تغيير اللغة إلى ${lang === 'ar' ? 'العربية' : 'English'}`, 'success');
        });
    });

    // استعادة اللغة المحفوظة
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        document.querySelectorAll(`[data-lang="${savedLang}"]`).forEach(b => {
            b.classList.add('active');
        });
    }
}

/* ============================================
   LOGO THEME SYNC - مزامنة شعار الوضع
   ============================================ */
function initLogoThemeSync() {
    // مراقبة تغييرات class على body
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                updateLogoTheme();
            }
        });
    });

    observer.observe(document.body, { attributes: true });
}

/* ============================================
   PERFORMANCE OPTIMIZATION - تحسينات الأداء
   ============================================ */
// إلغاء الرسوم المتحركة للمستخدمين الذين يفضلون الحركة المخفضة
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', 'none');

    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => {
        el.removeAttribute('data-aos');
    });
}

// تحسين الأداء على الأجهزة البطيئة
if ('connection' in navigator && navigator.connection.saveData) {
    document.querySelectorAll('.shape').forEach(shape => {
        shape.style.display = 'none';
    });

    if (typeof particlesJS !== 'undefined') {
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'none';
        }
    }
}
