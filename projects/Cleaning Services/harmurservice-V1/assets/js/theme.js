/**
 * HarMur Service - Theme Switcher
 * Dark/Light mode functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // ELEMENTS
    // ============================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // ============================================
    // INITIALIZE THEME
    // ============================================
    function initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('harmur_theme');
        
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
        
        // Update button visual state
        updateToggleButton();
        
        console.log('Theme initialized:', body.classList.contains('dark-mode') ? 'Dark' : 'Light');
    }
    
    // ============================================
    // THEME FUNCTIONS
    // ============================================
    function enableDarkMode() {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        localStorage.setItem('harmur_theme', 'dark');
        
        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { mode: 'dark' }
        }));
    }
    
    function enableLightMode() {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('harmur_theme', 'light');
        
        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { mode: 'light' }
        }));
    }
    
    function toggleTheme() {
        if (body.classList.contains('dark-mode')) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
        
        updateToggleButton();
        
        // Add transition effect
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
        
        console.log('Theme toggled to:', body.classList.contains('dark-mode') ? 'Dark' : 'Light');
    }
    
    function updateToggleButton() {
        if (!themeToggle) return;
        
        const isDark = body.classList.contains('dark-mode');
        const moonIcon = themeToggle.querySelector('.fa-moon');
        const sunIcon = themeToggle.querySelector('.fa-sun');
        const slider = themeToggle.querySelector('.theme-switch-slider');
        
        if (moonIcon) moonIcon.style.opacity = isDark ? '0' : '1';
        if (sunIcon) sunIcon.style.opacity = isDark ? '1' : '0';
        if (slider) {
            slider.style.transform = isDark ? 'translateX(30px)' : 'translateX(0)';
        }
        
        // Update ARIA label
        themeToggle.setAttribute('aria-label', 
            isDark ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'
        );
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        // Add keyboard support
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only change if user hasn't set a preference
        if (!localStorage.getItem('harmur_theme')) {
            if (e.matches) {
                enableDarkMode();
            } else {
                enableLightMode();
            }
            updateToggleButton();
        }
    });
    
    // ============================================
    // PUBLIC API
    // ============================================
    window.HarMurTheme = {
        toggle: toggleTheme,
        setDark: enableDarkMode,
        setLight: enableLightMode,
        getCurrentTheme: function() {
            return body.classList.contains('dark-mode') ? 'dark' : 'light';
        }
    };
    
    // ============================================
    // INITIALIZE
    // ============================================
    initTheme();
    
    // Show welcome message on first visit
    if (!localStorage.getItem('harmur_theme_welcome')) {
        setTimeout(() => {
            const isDark = body.classList.contains('dark-mode');
            const notification = document.createElement('div');
            notification.className = 'theme-welcome';
            notification.innerHTML = `
                <p>🌙☀️ Theme aktiviert! Sie können jetzt zwischen Dark und Light Mode wechseln.</p>
                <button onclick="this.parentElement.remove()">OK</button>
            `;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: ${isDark ? '#2d2d2d' : '#ffffff'};
                color: ${isDark ? '#e0e0e0' : '#333333'};
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 300px;
                border-left: 4px solid #0066b3;
            `;
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
            
            localStorage.setItem('harmur_theme_welcome', 'true');
        }, 1000);
    }
});

// ============================================
// FALLBACK FOR OLDER BROWSERS
// ============================================

// Check if classList is supported
if (!('classList' in document.documentElement)) {
    Object.defineProperty(Element.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/g);
                    var index = classes.indexOf(value);
                    
                    fn(classes, index, value);
                    self.className = classes.join(' ');
                };
            }
            
            return {
                add: update(function(classes, index, value) {
                    if (!~index) classes.push(value);
                }),
                remove: update(function(classes, index) {
                    if (~index) classes.splice(index, 1);
                }),
                toggle: update(function(classes, index, value) {
                    if (~index) {
                        classes.splice(index, 1);
                    } else {
                        classes.push(value);
                    }
                }),
                contains: function(value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                }
            };
        }
    });
}