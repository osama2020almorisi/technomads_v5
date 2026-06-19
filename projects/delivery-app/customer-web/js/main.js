/**
 * ============================================
 * MAIN.JS - TechNomads
 * Core JavaScript functionality
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ---------- Initialize ----------
    initMobileMenu();
    initSmoothScroll();
    initFaqToggles();
    initFormValidation();
    initToastCleanup();
    
    // ---------- Mobile Menu ----------
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!menuBtn || !mobileMenu) return;
        
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }
    
    // ---------- Smooth Scroll ----------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ---------- FAQ Toggles ----------
    function initFaqToggles() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', function() {
                // Close other items (optional)
                // this.parentElement.querySelectorAll('.faq-item').forEach(other => {
                //     if (other !== this) other.classList.remove('active');
                // });
                this.classList.toggle('active');
            });
        });
    }
    
    // ---------- Form Validation ----------
    function initFormValidation() {
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.addEventListener('submit', function(e) {
                const inputs = this.querySelectorAll('[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
                    } else {
                        input.classList.remove('error');
                    }
                    
                    // Email validation
                    if (input.type === 'email' && input.value.trim()) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value.trim())) {
                            isValid = false;
                            input.classList.add('error');
                            showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
                        }
                    }
                    
                    // Phone validation
                    if (input.type === 'tel' && input.value.trim()) {
                        const phoneRegex = /^[\+\d\s\-\(\)]{7,15}$/;
                        if (!phoneRegex.test(input.value.trim())) {
                            isValid = false;
                            input.classList.add('error');
                            showToast('يرجى إدخال رقم هاتف صحيح', 'error');
                        }
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // ---------- Toast System ----------
    function initToastCleanup() {
        // Clean up any stray toasts
        document.addEventListener('click', function() {
            document.querySelectorAll('.toast').forEach(toast => {
                if (toast.getAttribute('data-auto-remove') === 'true') {
                    toast.remove();
                }
            });
        });
    }
    
    // ---------- Global Toast ----------
    window.showToast = function(message, type = 'info') {
        const container = document.querySelector('.toast-container') || createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('data-auto-remove', 'true');
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, 3500);
        
        // Remove on click
        toast.addEventListener('click', function() {
            this.classList.add('toast-exit');
            setTimeout(() => {
                if (this.parentNode) this.remove();
            }, 300);
        });
        
        return toast;
    };
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    // ---------- Loading Overlay ----------
    window.showLoading = function(message = 'جاري التحميل...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="spinner-box">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    };
    
    window.hideLoading = function() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    };
    
    // ---------- Number Animation ----------
    window.animateNumbers = function(selector, duration = 1000) {
        document.querySelectorAll(selector).forEach(el => {
            const target = parseInt(el.getAttribute('data-target') || el.textContent.replace(/[^0-9]/g, ''));
            if (!target) return;
            
            const suffix = el.textContent.replace(/[0-9]/g, '');
            const start = 0;
            const startTime = performance.now();
            
            function updateNumber(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(progress * target);
                el.textContent = current.toLocaleString() + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    el.textContent = target.toLocaleString() + suffix;
                }
            }
            
            requestAnimationFrame(updateNumber);
        });
    };
    
    // ---------- Utility: Debounce ----------
    window.debounce = function(func, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    // ---------- Utility: Throttle ----------
    window.throttle = function(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    // ---------- Intersection Observer for animations ----------
    window.observeElements = function(selector, className = 'animate-fade-in') {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(className);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    };
    
    // Auto observe on page load
    setTimeout(() => {
        observeElements('.feature-card, .service-card, .mission-card, .team-card, .step-card');
    }, 100);
});