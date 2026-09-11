/* ============================================================
   Ranj Paint - Premium Painting & Decoration Services
   JavaScript Core File
   Author: Osama Mansour Al-Muraysi
   Version: 1.0.0
   Date: 2026-08-31
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

    // ==================== HEADER SCROLL EFFECT ====================
    const header = document.querySelector('.header');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // ==================== MOBILE NAVIGATION ====================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ==================== SCROLL ANIMATIONS ====================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // ==================== STATS COUNTER ANIMATION ====================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        const statsSection = document.querySelector('.stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && !statsAnimated) {
            statsAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const suffix = stat.getAttribute('data-suffix') || '';
                const duration = 2000; // 2 seconds
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out quart
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(easeProgress * target);

                    stat.textContent = current + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target + suffix;
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats(); // Initial check

    // ==================== GALLERY FILTER ====================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active from all
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';

                        setTimeout(() => {
                            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 400);
                    }
                });
            });
        });
    }

    // ==================== LIGHTBOX ====================
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxCaption = document.querySelector('.lightbox-caption');

    let currentImageIndex = 0;
    let visibleGalleryItems = [];

    function updateVisibleItems() {
        visibleGalleryItems = Array.from(galleryItems).filter(
            item => item.style.display !== 'none'
        );
    }

    if (lightbox) {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                updateVisibleItems();
                currentImageIndex = visibleGalleryItems.indexOf(this);
                openLightbox(this);
            });
        });

        function openLightbox(item) {
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-item-overlay')?.textContent || '';

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showPrevImage() {
            updateVisibleItems();
            currentImageIndex = (currentImageIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
            const item = visibleGalleryItems[currentImageIndex];
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-item-overlay')?.textContent || '';

            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxCaption.textContent = caption;
                lightboxImg.style.opacity = '1';
            }, 200);
        }

        function showNextImage() {
            updateVisibleItems();
            currentImageIndex = (currentImageIndex + 1) % visibleGalleryItems.length;
            const item = visibleGalleryItems[currentImageIndex];
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-item-overlay')?.textContent || '';

            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxCaption.textContent = caption;
                lightboxImg.style.opacity = '1';
            }, 200);
        }

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);

        // Close on background click
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        });
    }

    // ==================== CONTACT FORM ====================
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        // File input display
        const fileInput = contactForm.querySelector('input[type="file"]');
        const fileWrapper = contactForm.querySelector('.file-input-wrapper');
        const fileText = fileWrapper?.querySelector('p');

        if (fileInput && fileWrapper) {
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    fileText.textContent = this.files[0].name;
                    fileWrapper.style.borderColor = 'var(--gold)';
                } else {
                    fileText.textContent = 'اسحب الملف هنا أو انقر للاختيار';
                    fileWrapper.style.borderColor = '';
                }
            });
        }

        // Form validation
        contactForm.addEventListener('submit', function(e) {
            const requiredFields = contactForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e74c3c';

                    // Shake animation
                    field.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        field.style.animation = '';
                    }, 500);
                } else {
                    field.style.borderColor = '';
                }
            });

            // Phone validation
            const phoneField = contactForm.querySelector('input[name="phone"]');
            if (phoneField && phoneField.value) {
                const phoneRegex = /^[0-9+\-\s]{7,20}$/;
                if (!phoneRegex.test(phoneField.value)) {
                    isValid = false;
                    phoneField.style.borderColor = '#e74c3c';
                    alert('يرجى إدخال رقم جوال صحيح');
                }
            }

            // Email validation
            const emailField = contactForm.querySelector('input[name="email"]');
            if (emailField && emailField.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    isValid = false;
                    emailField.style.borderColor = '#e74c3c';
                    alert('يرجى إدخال بريد إلكتروني صحيح');
                }
            }

            if (!isValid) {
                e.preventDefault();
            } else {
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                    submitBtn.disabled = true;
                }
            }
        });

        // Clear error on input
        contactForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        });
    }

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== HERO PARALLAX ====================
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }

    // ==================== PROJECT CARD HOVER EFFECT ====================
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', function() {
            setTimeout(() => {
                this.style.zIndex = '';
            }, 300);
        });
    });

    // ==================== PRELOADER ====================
    const preloader = document.querySelector('.preloader');

    if (preloader) {
        window.addEventListener('load', function() {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
    }

    // ==================== CURRENT YEAR IN FOOTER ====================
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    // ==================== ACTIVE NAV LINK ====================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinkItems.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ==================== LAZY LOADING IMAGES ====================
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // ==================== BACK TO TOP BUTTON ====================
    const backToTop = document.querySelector('.back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==================== SERVICE CARD ANIMATION ====================
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    console.log('🎨 Ranj Paint - Website loaded successfully!');
    console.log('👨‍💻 Developer: Osama Mansour Al-Muraysi');
    console.log('📧 Contact: 2025ooss@gmail.com');
});

// ==================== SHAKE ANIMATION KEYFRAMES (JS injection) ====================
const shakeKeyframes = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);
