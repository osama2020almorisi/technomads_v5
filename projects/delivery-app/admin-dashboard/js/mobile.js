// ============================================
// TechNomads Delivery System - Mobile Enhancements
// Complete Mobile Experience
// ============================================

(function() {
    'use strict';

    // ============================================
    // DETECT
    // ============================================
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // ============================================
    // MOBILE SIDEBAR
    // ============================================
    function initMobileSidebar() {
        if (!isMobile) return;

        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Create overlay
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.id = 'sidebarOverlay';
            overlay.addEventListener('click', closeMobileSidebar);
            document.body.prepend(overlay);
        }

        // Add menu button to header
        const header = document.querySelector('.header');
        if (header) {
            let menuBtn = header.querySelector('.mobile-menu-btn');
            if (!menuBtn) {
                menuBtn = document.createElement('button');
                menuBtn.className = 'header-btn mobile-menu-btn';
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                menuBtn.setAttribute('aria-label', 'القائمة');
                menuBtn.addEventListener('click', toggleMobileSidebar);
                header.prepend(menuBtn);
            }
        }

        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileSidebar();
            }
        });

        // Close on swipe right
        let startX = 0;
        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });

        document.addEventListener('touchmove', function(e) {
            if (startX < 50) {
                const diff = e.touches[0].clientX - startX;
                if (diff > 80) {
                    closeMobileSidebar();
                }
            }
        }, { passive: true });
    }

    function toggleMobileSidebar(e) {
        if (e) e.stopPropagation();
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!sidebar) return;

        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }

    function closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!sidebar) return;

        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Expose for inline onclick
    window.toggleMobileSidebar = toggleMobileSidebar;
    window.closeMobileSidebar = closeMobileSidebar;

    // ============================================
    // MOBILE SEARCH
    // ============================================
    function initMobileSearch() {
        if (!isMobile) return;

        const header = document.querySelector('.header');
        if (!header) return;

        // Check if search already exists
        if (document.querySelector('.mobile-search')) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'mobile-search';
        searchContainer.style.display = 'none';

        searchContainer.innerHTML = `
            <input type="text" placeholder="بحث عن طلب، سائق، عميل..." id="mobileSearchInput">
            <button onclick="performMobileSearch()" style="background: none; border: none; padding: 0 12px; color: var(--primary); font-size: 18px;">
                <i class="fas fa-search"></i>
            </button>
        `;

        header.insertAdjacentElement('afterend', searchContainer);

        // Toggle search on search icon click in header
        const searchBtn = document.querySelector('.header-btn .fa-search');
        if (searchBtn) {
            const btn = searchBtn.closest('.header-btn');
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const search = document.querySelector('.mobile-search');
                    if (search) {
                        const isVisible = search.style.display !== 'none';
                        search.style.display = isVisible ? 'none' : 'flex';
                        if (!isVisible) {
                            setTimeout(() => {
                                document.getElementById('mobileSearchInput')?.focus();
                            }, 100);
                        }
                    }
                });
            }
        }

        // Enter key support
        document.getElementById('mobileSearchInput')?.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performMobileSearch();
            }
        });
    }

    function performMobileSearch() {
        const input = document.getElementById('mobileSearchInput');
        if (!input) return;

        const query = input.value.trim();
        if (query) {
            showToast(`جاري البحث عن: ${query}`, 'info');
            // In production: redirect to search results
        }
    }

    window.performMobileSearch = performMobileSearch;

    // ============================================
    // PULL TO REFRESH
    // ============================================
    function initPullToRefresh() {
        if (!isMobile) return;

        let startY = 0;
        let isPulling = false;
        let pulled = false;

        const pullEl = document.createElement('div');
        pullEl.className = 'pull-to-refresh';
        pullEl.style.cssText = `
            position: fixed;
            top: -60px;
            left: 0;
            right: 0;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: white;
            font-size: 14px;
            font-weight: 700;
            transition: top 0.3s ease;
            z-index: 50;
            gap: 8px;
            font-family: 'Tajawal', sans-serif;
        `;
        pullEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> تحديث...';
        document.body.prepend(pullEl);

        document.addEventListener('touchstart', function(e) {
            if (window.scrollY <= 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
                pulled = false;
            }
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            if (isPulling && window.scrollY <= 0) {
                const diff = e.touches[0].clientY - startY;
                if (diff > 60) {
                    pullEl.style.top = '0';
                    pulled = true;
                } else if (diff > 20) {
                    pullEl.style.top = `${-(60 - diff)}px`;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            if (pulled) {
                pullEl.style.top = '-60px';
                window.location.reload();
            } else {
                pullEl.style.top = '-60px';
            }
            isPulling = false;
            pulled = false;
        }, { passive: true });
    }

    // ============================================
    // SWIPE TO GO BACK
    // ============================================
    function initSwipeBack() {
        if (!isMobile) return;

        let touchStartX = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (diff > 80 && touchStartX < 80 && window.history.length > 1) {
                window.history.back();
            }
        }, { passive: true });
    }

    // ============================================
    // BOTTOM NAVIGATION
    // ============================================
    function initBottomNav() {
        if (!isMobile) return;

        // Check if already exists
        if (document.querySelector('.bottom-nav-mobile')) return;

        const nav = document.createElement('nav');
        nav.className = 'bottom-nav-mobile';

        // Determine current page
        const currentPage = window.location.pathname.split('/').pop().split('?')[0] || 'dashboard.html';

        const pages = [
            { icon: 'fa-chart-pie', label: 'الرئيسية', href: 'dashboard.html', id: 'dashboard.html' },
            { icon: 'fa-box', label: 'الطلبات', href: 'orders.html', id: 'orders.html' },
            { icon: 'fa-plus', label: '', href: '#', id: 'new', center: true },
            { icon: 'fa-motorcycle', label: 'السائقين', href: 'drivers.html', id: 'drivers.html' },
            { icon: 'fa-user', label: 'حسابي', href: '#', id: 'profile' }
        ];

        nav.innerHTML = pages.map(page => {
            const isActive = page.id === currentPage || (page.id === 'dashboard.html' && currentPage === '');
            return `
                <a href="${page.href}" 
                   class="nav-item ${isActive ? 'active' : ''} ${page.center ? 'nav-item-center' : ''}"
                   ${page.center ? 'onclick="openNewOrderModal(); return false;"' : ''}
                   data-page="${page.id}">
                    ${page.center ? `
                        <div class="nav-center-btn">
                            <i class="fas ${page.icon}"></i>
                        </div>
                    ` : `
                        <i class="fas ${page.icon}"></i>
                        <span>${page.label}</span>
                    `}
                </a>
            `;
        }).join('');

        document.body.appendChild(nav);

        // Add padding to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.paddingBottom = '80px';
        }
    }

    // ============================================
    // TOUCH FEEDBACK
    // ============================================
    function initTouchFeedback() {
        if (!isTouchDevice) return;

        document.querySelectorAll('.btn, .stat-card, .quick-stat-card, .nav-item, .card, .order-item, .driver-card').forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
                this.style.transform = 'scale(0.97)';
                this.style.opacity = '0.8';
            }, { passive: true });

            el.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
                this.style.opacity = '1';
            }, { passive: true });

            el.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
                this.style.opacity = '1';
            }, { passive: true });
        });
    }

    // ============================================
    // RESPONSIVE TABLES
    // ============================================
    function initResponsiveTables() {
        if (!isMobile) return;

        document.querySelectorAll('.table-container').forEach(container => {
            const table = container.querySelector('table');
            if (!table) return;

            // Check if table overflows
            const hasScroll = table.scrollWidth > container.clientWidth;
            if (hasScroll) {
                // Add scroll indicator
                let indicator = container.querySelector('.table-scroll-indicator');
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = 'table-scroll-indicator';
                    indicator.innerHTML = `
                        <i class="fas fa-chevron-left"></i>
                        <span>اسحب للتمرير</span>
                        <i class="fas fa-chevron-left"></i>
                    `;
                    container.appendChild(indicator);

                    // Hide indicator after scroll
                    container.addEventListener('scroll', function() {
                        if (indicator) {
                            indicator.style.opacity = '0';
                            setTimeout(() => {
                                if (indicator) indicator.style.display = 'none';
                            }, 300);
                        }
                    }, { passive: true });
                }
            }
        });
    }

    // ============================================
    // MODAL IMPROVEMENTS
    // ============================================
    function initModalImprovements() {
        if (!isMobile) return;

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            // Close on overlay click
            overlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });

            // Close on swipe down
            let startY = 0;
            overlay.addEventListener('touchstart', function(e) {
                const modal = this.querySelector('.modal');
                if (modal && e.target.closest('.modal')) {
                    startY = e.touches[0].clientY;
                }
            }, { passive: true });

            overlay.addEventListener('touchmove', function(e) {
                const modal = this.querySelector('.modal');
                if (modal && e.target.closest('.modal')) {
                    const diff = e.touches[0].clientY - startY;
                    if (diff > 80 && modal.scrollTop === 0) {
                        this.classList.remove('active');
                    }
                }
            }, { passive: true });
        });
    }

    // ============================================
    // TOAST SYSTEM
    // ============================================
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.querySelector('.custom-toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            top: ${isMobile ? '70px' : '20px'};
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
            color: white;
            padding: ${isMobile ? '12px 20px' : '15px 30px'};
            border-radius: 12px;
            font-weight: 700;
            font-size: ${isMobile ? '13px' : '14px'};
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: ${isMobile ? '92%' : '90%'};
            font-family: 'Tajawal', sans-serif;
            text-align: right;
        `;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="font-size: ${isMobile ? '16px' : '18px'}; flex-shrink: 0;"></i> ${message}`;
        document.body.appendChild(toast);

        // Show
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    window.showToast = showToast;

    // ============================================
    // SCROLL TO TOP FAB
    // ============================================
    function initScrollToTop() {
        if (!isMobile) return;

        const fab = document.createElement('button');
        fab.className = 'scroll-top-fab';
        fab.innerHTML = '<i class="fas fa-chevron-up"></i>';
        fab.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 16px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            border: none;
            box-shadow: 0 4px 16px rgba(99,102,241,0.35);
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Tajawal', sans-serif;
        `;
        document.body.appendChild(fab);

        fab.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide on scroll
        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY || window.pageYOffset;
            if (scrollY > 300) {
                fab.style.opacity = '1';
                fab.style.visibility = 'visible';
                fab.style.transform = 'scale(1)';
            } else {
                fab.style.opacity = '0';
                fab.style.visibility = 'hidden';
                fab.style.transform = 'scale(0.8)';
            }
        }, { passive: true });
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        if (isMobile) {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    initMobileSidebar();
                    initMobileSearch();
                    initPullToRefresh();
                    initSwipeBack();
                    initBottomNav();
                    initTouchFeedback();
                    initResponsiveTables();
                    initModalImprovements();
                    initScrollToTop();
                });
            } else {
                initMobileSidebar();
                initMobileSearch();
                initPullToRefresh();
                initSwipeBack();
                initBottomNav();
                initTouchFeedback();
                initResponsiveTables();
                initModalImprovements();
                initScrollToTop();
            }
        }
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== isMobile) {
                window.location.reload();
            }
        }, 500);
    }, { passive: true });

    // Initialize
    init();

    // ============================================
    // EXPOSE GLOBALS
    // ============================================
    window.isMobile = isMobile;
    window.isTouchDevice = isTouchDevice;

})();