/**
 * HarMur Service - Animations Script
 * Scroll animations, entrance effects, and interactive animations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const config = {
        // Animation settings
        scrollOffset: 100,
        animationDelay: 50,
        staggerDelay: 100,
        duration: 800,
        
        // Performance settings
        throttleDelay: 100,
        useIntersectionObserver: true,
        
        // Enable/disable specific animations
        enableScrollAnimations: true,
        enableHoverEffects: true,
        enableParallax: true,
        enableCounterAnimations: true,
        
        // Easing functions
        easing: {
            easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
            easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    };
    
    // ============================================
    // GLOBAL VARIABLES
    // ============================================
    
    let animationElements = [];
    let parallaxElements = [];
    let lastScrollY = window.scrollY;
    let ticking = false;
    let observer;
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        console.log('HarMur Service Animations - Initializing...');
        
        // Initialize based on configuration
        if (config.enableScrollAnimations) {
            initScrollAnimations();
        }
        
        if (config.enableHoverEffects) {
            initHoverEffects();
        }
        
        if (config.enableParallax) {
            initParallax();
        }
        
        if (config.enableCounterAnimations) {
            initCounters();
        }
        
        // Initialize entrance animations
        initEntranceAnimations();
        
        // Initialize interactive elements
        initInteractiveElements();
        
        // Add performance optimizations
        initPerformance();
        
        console.log('HarMur Service Animations - Ready!');
    }
    
    // ============================================
    // SCROLL ANIMATIONS WITH INTERSECTION OBSERVER
    // ============================================
    
    function initScrollAnimations() {
        // Select all elements that should animate on scroll
        animationElements = document.querySelectorAll(
            '.feature-card, .service-card, .card, ' +
            '.section-header, .hero-content, ' +
            '.contact-method, .testimonial, ' +
            '.pricing-card, .accordion-item'
        );
        
        if (!animationElements.length) return;
        
        // Add initial hidden state
        animationElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity ${config.duration}ms ${config.easing.easeOutQuart}, 
                                 transform ${config.duration}ms ${config.easing.easeOutQuart}`;
        });
        
        if (config.useIntersectionObserver && 'IntersectionObserver' in window) {
            // Use Intersection Observer for modern browsers
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateElement(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: `0px 0px -${config.scrollOffset}px 0px`,
                    threshold: 0.1
                }
            );
            
            animationElements.forEach(el => observer.observe(el));
        } else {
            // Fallback for older browsers
            window.addEventListener('scroll', throttle(checkScrollPosition, config.throttleDelay));
            checkScrollPosition(); // Check initial position
        }
    }
    
    function animateElement(element) {
        // Calculate delay based on element position
        const rect = element.getBoundingClientRect();
        const delay = Math.min(rect.top * 0.5, 600);
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            // Add subtle scale effect for some elements
            if (element.classList.contains('feature-card') || 
                element.classList.contains('service-card')) {
                element.style.transition += `, scale ${config.duration}ms ${config.easing.easeOutBack}`;
                element.style.scale = '1';
            }
            
            // Add class for CSS animations
            element.classList.add('animate-in');
            
            // Trigger custom event
            element.dispatchEvent(new CustomEvent('animation:in', {
                bubbles: true,
                detail: { element }
            }));
            
        }, delay);
    }
    
    // ============================================
    // ENTRANCE ANIMATIONS (Page Load)
    // ============================================
    
    function initEntranceAnimations() {
        // Hero section entrance
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('animate-entrance');
                
                // Animate hero text elements
                const heroTitle = heroContent.querySelector('.hero-title');
                const heroSubtitle = heroContent.querySelector('.hero-subtitle');
                const heroDescription = heroContent.querySelector('.hero-description');
                const heroButtons = heroContent.querySelector('.hero-buttons');
                
                if (heroTitle) animateSequence(heroTitle, 0);
                if (heroSubtitle) animateSequence(heroSubtitle, 200);
                if (heroDescription) animateSequence(heroDescription, 400);
                if (heroButtons) animateSequence(heroButtons, 600);
            }, 300);
        }
        
        // Logo entrance
        const logo = document.querySelector('.logo');
        if (logo) {
            setTimeout(() => {
                logo.classList.add('animate-logo');
            }, 100);
        }
        
        // Navigation entrance
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            setTimeout(() => {
                navLinks.classList.add('animate-nav');
            }, 500);
        }
    }
    
    function animateSequence(element, delay) {
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity ${config.duration}ms ${config.easing.easeOutQuart}, 
                                      transform ${config.duration}ms ${config.easing.easeOutQuart}`;
            
            // Force reflow
            void element.offsetWidth;
            
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }
    
    // ============================================
    // PARALLAX EFFECTS
    // ============================================
    
    function initParallax() {
        if (!config.enableParallax) return;
        
        parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;
        
        // Add parallax effect on scroll
        window.addEventListener('scroll', throttle(updateParallax, 16));
        updateParallax();
    }
    
    function updateParallax() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed') || 0.5);
            const direction = el.getAttribute('data-parallax-direction') || 'vertical';
            const rect = el.getBoundingClientRect();
            
            // Calculate parallax value
            const elementCenter = rect.top + rect.height / 2;
            const distanceFromCenter = (elementCenter - windowHeight / 2) / windowHeight;
            
            if (direction === 'vertical') {
                const translateY = distanceFromCenter * 100 * speed;
                el.style.transform = `translateY(${translateY}px)`;
            } else if (direction === 'horizontal') {
                const translateX = distanceFromCenter * 100 * speed;
                el.style.transform = `translateX(${translateX}px)`;
            }
        });
    }
    
    // ============================================
    // HOVER EFFECTS
    // ============================================
    
    function initHoverEffects() {
        if (!config.enableHoverEffects) return;
        
        // Card hover effects
        const hoverCards = document.querySelectorAll('.feature-card, .service-card, .card');
        
        hoverCards.forEach(card => {
            // Mouse enter effect
            card.addEventListener('mouseenter', function(e) {
                if (window.innerWidth > 768) { // Only on desktop
                    this.style.transform = 'translateY(-10px) scale(1.02)';
                    this.style.boxShadow = 'var(--shadow-xl)';
                    
                    // Add glow effect
                    this.style.setProperty('--card-glow', 'rgba(0, 102, 179, 0.1)');
                }
            });
            
            // Mouse leave effect
            card.addEventListener('mouseleave', function(e) {
                if (window.innerWidth > 768) {
                    this.style.transform = 'translateY(0) scale(1)';
                    this.style.boxShadow = 'var(--shadow-md)';
                    this.style.setProperty('--card-glow', 'transparent');
                }
            });
            
            // Touch device adaptation
            card.addEventListener('touchstart', function(e) {
                if (window.innerWidth <= 768) {
                    this.classList.add('touch-active');
                }
            });
            
            card.addEventListener('touchend', function(e) {
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        this.classList.remove('touch-active');
                    }, 300);
                }
            });
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = 'var(--shadow-lg)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
        
        // Link hover effects
        const links = document.querySelectorAll('a:not(.btn):not(.nav-phone)');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
    }
    
    // ============================================
    // COUNTER ANIMATIONS
    // ============================================
    
    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        if (!counters.length) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-counter')) || 0;
        const suffix = element.getAttribute('data-counter-suffix') || '';
        const prefix = element.getAttribute('data-counter-prefix') || '';
        const duration = parseInt(element.getAttribute('data-counter-duration')) || 2000;
        const startValue = 0;
        
        let startTime = null;
        
        const updateCounter = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
            const currentValue = Math.floor(easeOutQuart * target);
            
            element.textContent = prefix + currentValue + suffix;
            
            if (percentage < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = prefix + target + suffix;
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    // ============================================
    // INTERACTIVE ELEMENTS
    // ============================================
    
    function initInteractiveElements() {
        // Form input animations
        const formInputs = document.querySelectorAll('.form-control, input, textarea, select');
        
        formInputs.forEach(input => {
            // Focus effect
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            // Blur effect
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
            
            // Input validation animation
            input.addEventListener('input', function() {
                if (this.value) {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });
        });
        
        // Accordion animations
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isActive = this.classList.contains('active');
                
                // Close all accordions
                document.querySelectorAll('.accordion-header').forEach(h => {
                    if (h !== this) {
                        h.classList.remove('active');
                        h.nextElementSibling.classList.remove('active');
                    }
                });
                
                // Toggle current accordion
                this.classList.toggle('active', !isActive);
                content.classList.toggle('active', !isActive);
                
                // Animate content height
                if (!isActive) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0';
                }
            });
        });
        
        // Modal animations
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('modal-close')) {
                    closeModal(this);
                }
            });
        });
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        modal.parentElement.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================
    
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            z-index: 1001;
            transition: width 0.1s;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', throttle(() => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }, 16));
    }
    
    // ============================================
    // PAGE TRANSITION ANIMATIONS
    // ============================================
    
    function initPageTransitions() {
        // Add fade-in effect to body
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
        
        // Handle link clicks for smooth transitions
        const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="."], a[href^="#"]:not([href="#"])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Only for internal non-anchor links
                if (this.getAttribute('href').startsWith('#') || 
                    this.target === '_blank') return;
                
                e.preventDefault();
                const href = this.getAttribute('href');
                
                // Add fade-out effect
                document.body.style.opacity = '0';
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });
    }
    
    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    
    function initPerformance() {
        // Throttle scroll events
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    lastScrollY = window.scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Use passive event listeners for better performance
        const events = ['scroll', 'touchmove', 'wheel'];
        events.forEach(event => {
            window.addEventListener(event, () => {}, { passive: true });
        });
        
        // Lazy load background images
        const bgImages = document.querySelectorAll('[data-bg-image]');
        bgImages.forEach(img => {
            const src = img.getAttribute('data-bg-image');
            if (src) {
                const image = new Image();
                image.src = src;
                image.onload = () => {
                    img.style.backgroundImage = `url(${src})`;
                    img.classList.add('bg-loaded');
                };
            }
        });
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    function checkScrollPosition() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        animationElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            
            if (scrollY + windowHeight - config.scrollOffset > elementTop) {
                animateElement(el);
            }
        });
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ============================================
    // ANIMATION CONTROL FUNCTIONS
    // ============================================
    
    // Public API for controlling animations
    window.HarMurAnimations = {
        // Start all animations
        start: function() {
            animationElements.forEach(el => {
                if (el.style.opacity === '0') {
                    animateElement(el);
                }
            });
        },
        
        // Stop all animations
        stop: function() {
            animationElements.forEach(el => {
                el.style.transition = 'none';
            });
        },
        
        // Reset all animations
        reset: function() {
            animationElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity ${config.duration}ms ${config.easing.easeOutQuart}, 
                                     transform ${config.duration}ms ${config.easing.easeOutQuart}`;
            });
        },
        
        // Animate specific element
        animate: function(selector) {
            const element = document.querySelector(selector);
            if (element) {
                animateElement(element);
            }
        },
        
        // Get animation status
        status: function() {
            return {
                totalElements: animationElements.length,
                animatedElements: Array.from(animationElements).filter(el => 
                    el.style.opacity === '1'
                ).length,
                config: config
            };
        }
    };
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    function handleErrors(error) {
        console.error('Animation Error:', error);
        
        // Fallback: Show all elements without animations
        animationElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
    }
    
    // ============================================
    // BROWSER COMPATIBILITY CHECKS
    // ============================================
    
    function checkCompatibility() {
        // Check for required features
        const features = {
            requestAnimationFrame: 'requestAnimationFrame' in window,
            cssTransforms: 'transform' in document.documentElement.style,
            cssTransitions: 'transition' in document.documentElement.style,
            intersectionObserver: 'IntersectionObserver' in window
        };
        
        // Disable animations if basic features are missing
        if (!features.cssTransforms || !features.cssTransitions) {
            config.enableScrollAnimations = false;
            config.enableHoverEffects = false;
            config.enableParallax = false;
            
            // Add no-animations class
            document.body.classList.add('no-animations');
        }
        
        return features;
    }
    
    // ============================================
    // INITIALIZE ON LOAD
    // ============================================
    
    // Check browser compatibility
    const compatibility = checkCompatibility();
    console.log('Browser Compatibility:', compatibility);
    
    // Initialize animations
    try {
        init();
        
        // Initialize scroll progress if enabled
        if (config.enableScrollAnimations) {
            initScrollProgress();
        }
        
        // Initialize page transitions
        initPageTransitions();
        
    } catch (error) {
        handleErrors(error);
    }
    
    // ============================================
    // WINDOW LOAD EVENT
    // ============================================
    
    window.addEventListener('load', function() {
        // Add loaded class for CSS transitions
        document.body.classList.add('page-loaded');
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('animations:ready'));
        
        console.log('Page fully loaded - Animations active');
    });
    
});

// ============================================
// ANIMATION POLYFILLS
// ============================================

// requestAnimationFrame polyfill
(function() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// ============================================
// CSS ANIMATION HELPERS
// ============================================

// Add CSS for animations
const animationStyles = `
    /* Entrance animations */
    .animate-entrance {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .animate-logo {
        animation: fadeInDown 0.6s ease-out forwards;
    }
    
    .animate-nav {
        animation: fadeIn 0.8s ease-out 0.3s forwards;
        opacity: 0;
    }
    
    /* Scroll animations */
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    /* Keyframes */
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    /* Hover animations */
    .feature-card:hover,
    .service-card:hover {
        transition: all 0.3s var(--ease-out-back) !important;
    }
    
    /* Reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .animate-in,
        .animate-entrance,
        .animate-logo,
        .animate-nav {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
        }
    }
    
    /* Touch device optimizations */
    .touch-active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
    }
    
    /* Loading state */
    .page-loading .animate-in {
        opacity: 0;
        transform: translateY(30px);
    }
    
    .page-loaded .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// ============================================
// READY STATE HANDLER
// ============================================

// Handle various ready states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded - Animations initializing');
    });
}

window.addEventListener('load', function() {
    console.log('Window loaded - All animations ready');
    
    // Remove loading class
    document.body.classList.remove('page-loading');
    document.body.classList.add('page-loaded');
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible again
        document.body.classList.add('page-visible');
        
        // Restart animations if needed
        if (window.HarMurAnimations) {
            window.HarMurAnimations.start();
        }
    }
});