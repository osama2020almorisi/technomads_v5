/**
 * HarMur Service - Navigation Script
 * Responsive navigation and smooth scrolling functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // VARIABLES
    // ============================================
    
    const body = document.body;
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    
    function initMobileNavigation() {
        if (!navToggle || !navLinks) return;
        
        // Toggle mobile menu
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !nav.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu when clicking on a link
        navItems.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeMobileMenu();
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // ============================================
    // MOBILE MENU FUNCTIONS
    // ============================================
    
    function toggleMobileMenu() {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Update toggle button icon
        const icon = navToggle.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
                navToggle.setAttribute('aria-label', 'Menü schließen');
                body.style.overflow = 'hidden';
            } else {
                icon.className = 'fas fa-bars';
                navToggle.setAttribute('aria-label', 'Menü öffnen');
                body.style.overflow = '';
            }
        }
        
        // Update ARIA attributes
        const isExpanded = navLinks.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    }
    
    function closeMobileMenu() {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
        
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
        
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menü öffnen');
        body.style.overflow = '';
    }
    
    // ============================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================
    
    function setActiveNavLink() {
        navItems.forEach(link => {
            const linkPage = link.getAttribute('href');
            
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class to current page link
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
            
            // Handle anchor links within the same page
            if (linkPage.startsWith('#')) {
                link.addEventListener('click', handleAnchorLink);
            }
        });
    }
    
    // ============================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ============================================
    
    function initSmoothScrolling() {
        // Select all anchor links that point to an ID on the same page
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', handleAnchorLink);
        });
    }
    
    function handleAnchorLink(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (href === '#') return;
        
        // Check if the target exists on the page
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Calculate header height for offset
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight;
            
            // Smooth scroll to target
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, href);
            } else {
                window.location.hash = href;
            }
        }
    }
    
    // ============================================
    // STICKY HEADER ON SCROLL
    // ============================================
    
    function initStickyHeader() {
        let lastScrollTop = 0;
        const scrollThreshold = 100;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show/hide header based on scroll direction
            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop) {
                    // Scrolling down - hide header
                    header.classList.add('header-hidden');
                } else {
                    // Scrolling up - show header
                    header.classList.remove('header-hidden');
                    header.classList.add('header-visible');
                }
            } else {
                // At top of page
                header.classList.remove('header-hidden', 'header-visible');
            }
            
            // Add shadow when scrolled
            if (scrollTop > 10) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // ============================================
    // DROPDOWN MENU FUNCTIONALITY
    // ============================================
    
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!toggle || !menu) return;
            
            // Toggle dropdown on click
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                closeAllDropdownsExcept(menu);
                
                // Toggle current dropdown
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
            
            // Close dropdown on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    
    function closeAllDropdownsExcept(exceptMenu) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            if (menu !== exceptMenu) {
                menu.classList.remove('active');
                const toggle = menu.parentElement.querySelector('.dropdown-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
    
    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    
    function initKeyboardNavigation() {
        // Tab key navigation within menu
        nav.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                // Handle tab navigation within mobile menu
                if (navLinks.classList.contains('active')) {
                    const focusableElements = navLinks.querySelectorAll(
                        'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            }
        });
        
        // Arrow key navigation for dropdowns
        document.addEventListener('keydown', function(e) {
            const activeDropdown = document.querySelector('.dropdown-menu.active');
            
            if (activeDropdown) {
                const dropdownItems = activeDropdown.querySelectorAll('a');
                const currentIndex = Array.from(dropdownItems).findIndex(
                    item => item === document.activeElement
                );
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % dropdownItems.length;
                        dropdownItems[nextIndex].focus();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : dropdownItems.length - 1;
                        dropdownItems[prevIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        dropdownItems[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        dropdownItems[dropdownItems.length - 1].focus();
                        break;
                }
            }
        });
    }
    
    // ============================================
    // RESIZE HANDLER
    // ============================================
    
    function handleResize() {
        // Close mobile menu when resizing to desktop
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Update header class based on width
        if (window.innerWidth <= 768) {
            body.classList.add('mobile-view');
            body.classList.remove('desktop-view');
        } else {
            body.classList.add('desktop-view');
            body.classList.remove('mobile-view');
        }
    }
    
    // ============================================
    // TOUCH DEVICE DETECTION
    // ============================================
    
    function initTouchDetection() {
        // Check if device supports touch
        const isTouchDevice = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             navigator.msMaxTouchPoints > 0;
        
        if (isTouchDevice) {
            body.classList.add('touch-device');
            
            // Add touch-specific event listeners
            navItems.forEach(link => {
                link.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                });
                
                link.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                });
            });
        } else {
            body.classList.add('no-touch-device');
        }
    }
    
    // ============================================
    // ACCESSIBILITY FEATURES
    // ============================================
    
    function initAccessibility() {
        // Add ARIA labels to navigation
        if (navToggle && !navToggle.getAttribute('aria-label')) {
            navToggle.setAttribute('aria-label', 'Menü öffnen');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'navigation-menu');
        }
        
        if (navLinks && !navLinks.getAttribute('id')) {
            navLinks.setAttribute('id', 'navigation-menu');
        }
        
        // Add role to navigation
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
        
        // Focus trapping for screen readers
        navItems.forEach((link, index) => {
            if (!link.getAttribute('tabindex')) {
                link.setAttribute('tabindex', '0');
            }
            
            // Add accessible keyboard shortcuts (optional)
            if (index < 9) {
                link.setAttribute('accesskey', (index + 1).toString());
            }
        });
    }
    
    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    
    function initPerformance() {
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                // Update active section based on scroll position
                updateActiveSection();
            }, 100);
        });
        
        // Throttle resize events
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
    }
    
    // ============================================
    // ACTIVE SECTION TRACKING
    // ============================================
    
    function updateActiveSection() {
        if (window.innerWidth > 768) return; // Only for mobile
        
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && 
                scrollPosition < sectionTop + sectionHeight) {
                
                // Update active nav link
                navItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        console.log('HarMur Service Navigation - Initializing...');
        
        // Initialize all features
        initMobileNavigation();
        setActiveNavLink();
        initSmoothScrolling();
        initStickyHeader();
        initDropdowns();
        initKeyboardNavigation();
        initTouchDetection();
        initAccessibility();
        initPerformance();
        
        // Initial resize handling
        handleResize();
        
        // Add CSS classes for JavaScript detection
        body.classList.add('js-loaded');
        
        console.log('HarMur Service Navigation - Ready!');
    }
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    function handleErrors(error) {
        console.error('Navigation Error:', error);
        
        // Fallback: Ensure mobile menu is accessible
        if (navToggle && navLinks) {
            navToggle.style.display = 'block';
            navLinks.style.display = 'flex';
        }
    }
    
    // ============================================
    // PUBLIC API (optional)
    // ============================================
    
    // Expose public methods if needed
    window.HarMurNavigation = {
        openMenu: toggleMobileMenu,
        closeMenu: closeMobileMenu,
        refresh: setActiveNavLink
    };
    
    // ============================================
    // START INITIALIZATION
    // ============================================
    
    try {
        init();
    } catch (error) {
        handleErrors(error);
    }
    
});

// ============================================
// POLYFILLS FOR OLDER BROWSERS
// ============================================

// Smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = function() {
        const easeInOutQuad = function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        const smoothScroll = function(element, duration) {
            duration = duration || 500;
            const start = window.pageYOffset;
            const target = element.getBoundingClientRect().top + start;
            const distance = target - start;
            let startTime = null;

            const animation = function(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, start, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            requestAnimationFrame(animation);
        };

        // Override the native scrollTo if needed
        const originalScrollTo = window.scrollTo;
        window.scrollTo = function(options) {
            if (typeof options === 'object' && options.behavior === 'smooth') {
                smoothScroll({ getBoundingClientRect: () => ({ top: options.top }) }, 500);
            } else {
                originalScrollTo.apply(this, arguments);
            }
        };
    };

    // Load polyfill only if needed
    smoothScrollPolyfill();
}

// ============================================
// READY STATE HANDLER
// ============================================

// Handle page load states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded and parsed');
    });
} else {
    console.log('DOM already loaded');
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page is now hidden');
    } else {
        console.log('Page is now visible');
    }
});

// Handle page beforeunload
window.addEventListener('beforeunload', function() {
    // Cleanup if needed
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});