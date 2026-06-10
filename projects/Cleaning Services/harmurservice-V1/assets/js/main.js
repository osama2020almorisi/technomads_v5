/**
 * HarMur Service - Main Application Script
 * Core initialization, state management, and component integration
 */

// ============================================
// APPLICATION CONFIGURATION
// ============================================

const HarMurApp = {
    
    // Application version
    version: '1.0.0',
    
    // Configuration
    config: {
        debug: false,
        environment: 'production',
        apiBaseUrl: 'https://api.harmur-service.com',
        analytics: {
            enabled: true,
            googleAnalyticsId: 'G-XXXXXXXXXX',
            facebookPixelId: 'XXXXXXXXXXXXXXX'
        },
        performance: {
            lazyLoadImages: true,
            prefetchLinks: true,
            cacheEnabled: true,
            timeout: 10000
        },
        features: {
            animations: true,
            formValidation: true,
            navigation: true,
            contactForm: true,
            serviceWorker: false
        }
    },
    
    // Application state
    state: {
        isInitialized: false,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isOnline: true,
        scrollPosition: 0,
        currentPage: '',
        userPreferences: {},
        formSubmissions: []
    },
    
    // DOM elements cache
    elements: {},
    
    // Event listeners registry
    listeners: {},
    
    // Performance metrics
    metrics: {
        loadTime: 0,
        domReadyTime: 0,
        pageLoadTime: 0,
        memoryUsage: 0
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init: function() {
        console.log(`%cHarMur Service v${this.version}`, 'color: #0066b3; font-size: 16px; font-weight: bold;');
        console.log('Initializing application...');
        
        // Start performance tracking
        this.startPerformanceTracking();
        
        // Detect environment
        this.detectEnvironment();
        
        // Initialize core modules
        this.initCore();
        
        // Initialize features based on configuration
        this.initFeatures();
        
        // Initialize analytics
        this.initAnalytics();
        
        // Set up global event listeners
        this.setupGlobalListeners();
        
        // Initialize service worker if enabled
        if (this.config.features.serviceWorker) {
            this.initServiceWorker();
        }
        
        // Initialize theme switcher
        this.initThemeSwitcher();
        
        // Mark as initialized
        this.state.isInitialized = true;
        this.state.currentPage = this.getCurrentPage();
        
        // Dispatch initialized event
        this.dispatchEvent('app:initialized', this.state);
        
        // Log initialization complete
        this.log('Application initialized successfully');
        
        // Measure and log load time
        this.measureLoadTime();
    },
    
    // ============================================
    // CORE MODULES INITIALIZATION
    // ============================================
    
    initCore: function() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize device detection
        this.initDeviceDetection();
        
        // Initialize performance optimizations
        this.initPerformance();
        
        // Initialize error handling
        this.initErrorHandling();
        
        // Initialize accessibility features
        this.initAccessibility();
        
        // Initialize session management
        this.initSession();
    },
    
    initFeatures: function() {
        // Initialize navigation if enabled
        if (this.config.features.navigation && typeof window.HarMurNavigation !== 'undefined') {
            this.log('Initializing navigation...');
            // Navigation is auto-initialized from its own script
        }
        
        // Initialize animations if enabled
        if (this.config.features.animations && typeof window.HarMurAnimations !== 'undefined') {
            this.log('Initializing animations...');
            // Animations are auto-initialized
        }
        
        // Initialize contact form if enabled
        if (this.config.features.contactForm && typeof window.HarMurContactForm !== 'undefined') {
            this.log('Initializing contact form...');
            // Contact form is auto-initialized
        }
        
        // Initialize lazy loading for images
        if (this.config.performance.lazyLoadImages) {
            this.initLazyLoading();
        }
        
        // Initialize intersection observer for elements
        this.initIntersectionObserver();
    },
    
    // ============================================
    // THEME SWITCHER
    // ============================================
    
    initThemeSwitcher: function() {
        const themeToggle = document.getElementById('theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('harmur_theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-mode');
        }
        
        // Toggle theme on button click
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDarkMode = document.body.classList.toggle('dark-mode');
                
                // Update icon and save preference
                this.saveThemePreference(isDarkMode ? 'dark' : 'light');
                
                // Dispatch event for other components
                this.dispatchEvent('theme:changed', { mode: isDarkMode ? 'dark' : 'light' });
                
                // Track theme change
                this.trackEvent('theme_toggle', { mode: isDarkMode ? 'dark' : 'light' });
            });
        }
        
        // Listen for system theme changes
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('harmur_theme')) {
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    },
    
    saveThemePreference: function(theme) {
        localStorage.setItem('harmur_theme', theme);
    },
    
    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    
    initPerformance: function() {
        // Set up performance monitoring
        if ('performance' in window) {
            this.monitorPerformance();
        }
        
        // Optimize animations for performance
        this.optimizeAnimations();
        
        // Defer non-critical CSS
        this.loadCriticalCSS();
        
        // Preload important resources
        this.preloadResources();
        
        // Set up caching strategy
        if (this.config.performance.cacheEnabled) {
            this.setupCaching();
        }
    },
    
    initLazyLoading: function() {
        // Lazy load images
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            delete img.dataset.src;
                        }
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            delete img.dataset.srcset;
                        }
                        
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                if (img.dataset.src) img.src = img.dataset.src;
                if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            });
        }
    },
    
    initIntersectionObserver: function() {
        // Initialize intersection observer for various elements
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                            this.dispatchEvent('element:inview', entry.target);
                        }
                    });
                },
                {
                    rootMargin: '0px 0px 100px 0px',
                    threshold: 0.1
                }
            );
            
            // Observe elements with data-observe attribute
            document.querySelectorAll('[data-observe]').forEach(el => {
                this.intersectionObserver.observe(el);
            });
        }
    },
    
    // ============================================
    // ANALYTICS & TRACKING
    // ============================================
    
    initAnalytics: function() {
        if (!this.config.analytics.enabled) return;
        
        // Initialize Google Analytics
        if (this.config.analytics.googleAnalyticsId && typeof gtag !== 'undefined') {
            gtag('config', this.config.analytics.googleAnalyticsId, {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
            
            this.trackEvent('page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
        
        // Initialize Facebook Pixel
        if (this.config.analytics.facebookPixelId && typeof fbq !== 'undefined') {
            fbq('track', 'PageView');
        }
        
        // Track custom events
        this.setupAnalyticsEvents();
    },
    
    setupAnalyticsEvents: function() {
        // Track form submissions
        document.addEventListener('form:submitted', (e) => {
            this.trackEvent('form_submission', e.detail);
        });
        
        // Track service selections
        document.addEventListener('service:selected', (e) => {
            this.trackEvent('service_selection', e.detail);
        });
        
        // Track contact method clicks
        document.addEventListener('contact:clicked', (e) => {
            this.trackEvent('contact_click', e.detail);
        });
        
        // Track page scroll depth
        this.trackScrollDepth();
    },
    
    trackEvent: function(eventName, eventData = {}) {
        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Send to Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, eventData);
        }
        
        // Log event in debug mode
        if (this.config.debug) {
            console.log(`Event tracked: ${eventName}`, eventData);
        }
        
        // Dispatch custom event
        this.dispatchEvent(`analytics:${eventName}`, eventData);
    },
    
    trackScrollDepth: function() {
        let scrollDepthTracked = [25, 50, 75, 100];
        let scrollDepthSent = [];
        
        window.addEventListener('scroll', () => {
            const scrollPercent = this.getScrollPercentage();
            
            scrollDepthTracked.forEach(threshold => {
                if (scrollPercent >= threshold && !scrollDepthSent.includes(threshold)) {
                    this.trackEvent('scroll_depth', {
                        depth: `${threshold}%`,
                        page: this.state.currentPage
                    });
                    scrollDepthSent.push(threshold);
                }
            });
        }, { passive: true });
    },
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    initErrorHandling: function() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
        
        // AJAX error handling
        this.setupAjaxErrorHandling();
    },
    
    handleError: function(error) {
        // Log error
        console.error('Application Error:', error);
        
        // Send to error tracking service (e.g., Sentry)
        if (typeof Sentry !== 'undefined') {
            Sentry.captureException(error);
        }
        
        // Dispatch error event
        this.dispatchEvent('app:error', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
        
        // Show user-friendly error message in development
        if (this.config.debug) {
            this.showErrorMessage(error);
        }
    },
    
    showErrorMessage: function(error) {
        // Create error overlay for development
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 8px;
            max-width: 400px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: monospace;
            font-size: 12px;
        `;
        
        errorOverlay.innerHTML = `
            <strong>Error:</strong> ${error.message}<br>
            <small>${error.stack ? error.stack.split('\n')[1] : ''}</small>
            <button style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
            " onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(errorOverlay);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorOverlay.parentNode) {
                errorOverlay.remove();
            }
        }, 10000);
    },
    
    // ============================================
    // ACCESSIBILITY
    // ============================================
    
    initAccessibility: function() {
        // Add skip to content link
        this.addSkipToContentLink();
        
        // Manage focus for modal dialogs
        this.setupFocusManagement();
        
        // Add ARIA attributes dynamically
        this.enhanceAriaAttributes();
        
        // Keyboard navigation enhancements
        this.setupKeyboardNavigation();
        
        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
    },
    
    addSkipToContentLink: function() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Zum Hauptinhalt springen';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #0066b3;
            color: white;
            padding: 8px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('click', (e) => {
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.setAttribute('tabindex', '-1');
                target.focus();
                setTimeout(() => target.removeAttribute('tabindex'), 1000);
            }
        });
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    },
    
    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    
    initSession: function() {
        // Initialize session
        this.state.sessionId = this.generateSessionId();
        this.state.sessionStart = new Date().toISOString();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Track session duration
        this.trackSessionDuration();
        
        // Handle page visibility
        this.handlePageVisibility();
    },
    
    generateSessionId: function() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    loadUserPreferences: function() {
        try {
            const prefs = localStorage.getItem('harmur_preferences');
            if (prefs) {
                this.state.userPreferences = JSON.parse(prefs);
            }
        } catch (e) {
            console.warn('Could not load user preferences:', e);
        }
    },
    
    saveUserPreferences: function() {
        try {
            localStorage.setItem('harmur_preferences', JSON.stringify(this.state.userPreferences));
        } catch (e) {
            console.warn('Could not save user preferences:', e);
        }
    },
    
    trackSessionDuration: function() {
        setInterval(() => {
            const duration = Date.now() - new Date(this.state.sessionStart).getTime();
            this.dispatchEvent('session:update', { duration });
        }, 60000); // Update every minute
    },
    
    // ============================================
    // EVENT SYSTEM
    // ============================================
    
    on: function(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    },
    
    off: function(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
        }
    },
    
    dispatchEvent: function(eventName, data = {}) {
        // Call registered callbacks
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
        
        // Dispatch DOM event
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
        
        // Log in debug mode
        if (this.config.debug) {
            console.log(`Event dispatched: ${eventName}`, data);
        }
    },
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    detectEnvironment: function() {
        // Detect if we're in development
        this.config.environment = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' ? 'development' : 'production';
        
        // Enable debug mode in development
        if (this.config.environment === 'development') {
            this.config.debug = true;
            console.log('Development mode enabled');
        }
    },
    
    initDeviceDetection: function() {
        const width = window.innerWidth;
        
        this.state.isMobile = width < 768;
        this.state.isTablet = width >= 768 && width < 992;
        this.state.isDesktop = width >= 992;
        
        // Add device class to body
        document.body.classList.add(
            this.state.isMobile ? 'device-mobile' :
            this.state.isTablet ? 'device-tablet' : 'device-desktop'
        );
        
        // Dispatch device change event
        this.dispatchEvent('device:detected', {
            isMobile: this.state.isMobile,
            isTablet: this.state.isTablet,
            isDesktop: this.state.isDesktop,
            width: width
        });
    },
    
    cacheElements: function() {
        // Cache frequently accessed elements
        this.elements = {
            body: document.body,
            html: document.documentElement,
            header: document.querySelector('header'),
            main: document.querySelector('main'),
            footer: document.querySelector('footer'),
            navigation: document.querySelector('nav'),
            contactForm: document.querySelector('#contact-form, .contact-form'),
            heroSection: document.querySelector('.hero'),
            servicesSection: document.querySelector('.services-preview'),
            themeToggle: document.getElementById('theme-toggle')
        };
    },
    
    getCurrentPage: function() {
        const path = window.location.pathname;
        return path.split('/').pop().replace('.html', '') || 'home';
    },
    
    getScrollPercentage: function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        return Math.round(scrollPercent);
    },
    
    // ============================================
    // NETWORK & CONNECTIVITY
    // ============================================
    
    setupGlobalListeners: function() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.dispatchEvent('network:online');
            this.showNotification('Sie sind wieder online', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.dispatchEvent('network:offline');
            this.showNotification('Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.', 'warning');
        });
        
        // Scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            this.state.scrollPosition = window.pageYOffset;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.dispatchEvent('scroll:end', { position: this.state.scrollPosition });
            }, 100);
        }, { passive: true });
        
        // Resize tracking with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.initDeviceDetection();
                this.dispatchEvent('resize:end', {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 250);
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.dispatchEvent('app:beforeunload', this.state);
            this.saveUserPreferences();
        });
    },
    
    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================
    
    showNotification: function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `app-notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#0066b3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
            margin-left: 15px;
            padding: 0;
        `;
        closeBtn.addEventListener('click', () => notification.remove());
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    },
    
    // ============================================
    // PERFORMANCE MONITORING
    // ============================================
    
    startPerformanceTracking: function() {
        this.metrics.loadStart = performance.now();
        
        // Track DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domReadyTime = performance.now() - this.metrics.loadStart;
            this.log(`DOM ready in ${this.metrics.domReadyTime.toFixed(2)}ms`);
        });
        
        // Track window load
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now() - this.metrics.loadStart;
            this.log(`Page loaded in ${this.metrics.pageLoadTime.toFixed(2)}ms`);
        });
    },
    
    measureLoadTime: function() {
        if ('performance' in window) {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                this.metrics = {
                    ...this.metrics,
                    dnsLookup: navTiming.domainLookupEnd - navTiming.domainLookupStart,
                    tcpConnection: navTiming.connectEnd - navTiming.connectStart,
                    serverResponse: navTiming.responseStart - navTiming.requestStart,
                    pageDownload: navTiming.responseEnd - navTiming.responseStart,
                    domInteractive: navTiming.domInteractive,
                    domComplete: navTiming.domComplete,
                    loadEvent: navTiming.loadEventEnd - navTiming.loadEventStart
                };
                
                if (this.config.debug) {
                    console.table(this.metrics);
                }
            }
        }
    },
    
    monitorPerformance: function() {
        // Monitor memory usage (if supported)
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // Convert to MB
                
                if (this.metrics.memoryUsage > 100) { // 100MB threshold
                    console.warn(`High memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB`);
                }
            }, 30000);
        }
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // 50ms threshold
                        console.warn('Long task detected:', entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    },
    
    // ============================================
    // SERVICE WORKER
    // ============================================
    
    initServiceWorker: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                    this.dispatchEvent('serviceworker:registered', registration);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                    this.dispatchEvent('serviceworker:error', error);
                });
        }
    },
    
    // ============================================
    // LOGGING
    // ============================================
    
    log: function(message, data = null) {
        if (this.config.debug) {
            if (data) {
                console.log(`[HarMur] ${message}`, data);
            } else {
                console.log(`[HarMur] ${message}`);
            }
        }
    },
    
    warn: function(message, data = null) {
        if (data) {
            console.warn(`[HarMur] ${message}`, data);
        } else {
            console.warn(`[HarMur] ${message}`);
        }
    },
    
    error: function(message, error = null) {
        if (error) {
            console.error(`[HarMur] ${message}`, error);
        } else {
            console.error(`[HarMur] ${message}`);
        }
    },
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    // Get application state
    getState: function() {
        return { ...this.state };
    },
    
    // Update configuration
    updateConfig: function(newConfig) {
        Object.assign(this.config, newConfig);
        this.dispatchEvent('config:updated', this.config);
    },
    
    // Track custom event
    track: function(eventName, data = {}) {
        this.trackEvent(eventName, data);
    },
    
    // Show notification
    notify: function(message, type = 'info', duration = 5000) {
        this.showNotification(message, type, duration);
    },
    
    // Check if feature is enabled
    isFeatureEnabled: function(featureName) {
        return this.config.features[featureName] === true;
    },
    
    // Get element from cache
    getElement: function(elementName) {
        return this.elements[elementName];
    },
    
    // Set user preference
    setPreference: function(key, value) {
        this.state.userPreferences[key] = value;
        this.saveUserPreferences();
        this.dispatchEvent('preference:changed', { key, value });
    },
    
    // Get user preference
    getPreference: function(key, defaultValue = null) {
        return this.state.userPreferences[key] || defaultValue;
    },
    
    // Reset application
    reset: function() {
        localStorage.removeItem('harmur_preferences');
        localStorage.removeItem('harmur_theme');
        sessionStorage.clear();
        this.state.userPreferences = {};
        this.dispatchEvent('app:reset');
        this.log('Application reset');
    }
};

// ============================================
// GLOBAL INITIALIZATION
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        HarMurApp.init();
    });
} else {
    // DOM already loaded
    HarMurApp.init();
}

// Make app globally available
window.HarMurApp = HarMurApp;

// ============================================
// GLOBAL HELPER FUNCTIONS
// ============================================

// Debounce function
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

// Throttle function
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

// Format bytes to readable size
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function smoothScrollTo(element, duration = 500) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;
    
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// ============================================
// GLOBAL EVENT LISTENERS
// ============================================

// Handle external link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hostname !== window.location.hostname) {
        HarMurApp.trackEvent('external_link_click', {
            url: link.href,
            text: link.textContent
        });
    }
});

// Handle phone link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) {
        HarMurApp.trackEvent('phone_call', {
            number: link.href.replace('tel:', '')
        });
    }
});

// Handle email link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="mailto:"]');
    if (link) {
        HarMurApp.trackEvent('email_click', {
            email: link.href.replace('mailto:', '')
        });
    }
});

// Handle WhatsApp link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="whatsapp.com"], a[href^="whatsapp://"]');
    if (link) {
        HarMurApp.trackEvent('whatsapp_click', {
            url: link.href
        });
    }
});

// ============================================
// PERFORMANCE OBSERVER FOR RESOURCES
// ============================================

// Monitor resource loading performance
if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (entry.duration > 1000) { // Resources taking more than 1 second
                HarMurApp.warn(`Slow resource load: ${entry.name}`, {
                    duration: entry.duration,
                    type: entry.initiatorType
                });
            }
        });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
}

// ============================================
// PAGE VISIBILITY HANDLING
// ============================================

function handlePageVisibility() {
    let hidden, visibilityChange;
    
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    
    if (typeof document.addEventListener !== "undefined" && hidden) {
        document.addEventListener(visibilityChange, () => {
            if (document[hidden]) {
                HarMurApp.dispatchEvent('page:hidden');
            } else {
                HarMurApp.dispatchEvent('page:visible');
            }
        }, false);
    }
}

// Initialize page visibility handling
handlePageVisibility();

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
%cHarMur Service 🧽
%cProfessionelle Gebäudereinigung München
%c
Website erfolgreich geladen!
Bei Fragen oder Problemen kontaktieren Sie uns unter:
📞 0155 6651 9979
📧 harmurservices@gmail.com
`,
'color: #0066b3; font-size: 24px; font-weight: bold;',
'color: #00a86b; font-size: 16px;',
'color: #666; font-size: 14px;'
);