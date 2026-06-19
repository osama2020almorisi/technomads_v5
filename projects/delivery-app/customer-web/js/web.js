/**
 * ============================================
 * WEB.JS - TechNomads
 * Website specific JavaScript
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ---------- Hero Stats Animation ----------
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.number');
                numbers.forEach(el => {
                    const target = parseInt(el.textContent.replace(/[^0-9]/g, ''));
                    if (target) {
                        animateNumber(el, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const statsSection = document.querySelector('.stats-section .stats-grid');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    function animateNumber(el, target) {
        const duration = 1500;
        const startTime = performance.now();
        const suffix = el.textContent.replace(/[0-9]/g, '');
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            el.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString() + suffix;
            }
        }
        requestAnimationFrame(update);
    }
    
    // ---------- Track Order (from track.html) ----------
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('trackingInput');
            const orderId = input.value.trim();
            
            if (!orderId) {
                showToast('يرجى إدخال رقم الطلب', 'error');
                return;
            }
            
            // Simulate tracking
            const resultDiv = document.getElementById('trackResult');
            if (resultDiv) {
                resultDiv.classList.add('active');
                resultDiv.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <div class="loading-spinner" style="margin:0 auto 12px;"></div>
                        <p style="color:var(--gray);">جاري البحث عن الطلب #${orderId}...</p>
                    </div>
                `;
                
                setTimeout(() => {
                    // Mock result
                    const statuses = ['pending', 'accepted', 'pickup', 'delivering', 'delivered'];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    const progress = {
                        pending: 20,
                        accepted: 35,
                        pickup: 50,
                        delivering: 75,
                        delivered: 100
                    };
                    
                    resultDiv.innerHTML = renderTrackResult({
                        id: `#${orderId}`,
                        status: randomStatus,
                        pickup: 'شارع تعز، جوار البنك المركزي',
                        dropoff: 'حي الصافية، خلف جامع النور',
                        amount: 15000,
                        driver: 'أحمد علي',
                        driverRating: 4.9,
                        time: 'منذ 5 دقائق',
                        progress: progress[randomStatus]
                    });
                }, 1500);
            }
        });
    }
    
    function renderTrackResult(order) {
        const statusMap = {
            'pending': 'قيد الانتظار',
            'accepted': 'تم القبول',
            'pickup': 'في الاستلام',
            'delivering': 'في الطريق',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        
        const steps = ['pending', 'accepted', 'pickup', 'delivering', 'delivered'];
        const currentIndex = steps.indexOf(order.status);
        const progress = order.progress || ((currentIndex / (steps.length - 1)) * 100);
        
        const stepsHtml = steps.map((step, index) => {
            let cls = '';
            if (index < currentIndex) cls = 'completed';
            else if (index === currentIndex) cls = 'active';
            
            const icons = {
                'pending': 'fa-clock',
                'accepted': 'fa-check',
                'pickup': 'fa-box',
                'delivering': 'fa-truck',
                'delivered': 'fa-flag-checkered'
            };
            const labels = {
                'pending': 'قيد الانتظار',
                'accepted': 'تم القبول',
                'pickup': 'في الاستلام',
                'delivering': 'في الطريق',
                'delivered': 'تم التوصيل'
            };
            return `
                <div class="step ${cls}">
                    <div class="dot"><i class="fas ${icons[step]}"></i></div>
                    <span class="label">${labels[step]}</span>
                </div>
            `;
        }).join('');
        
        return `
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="status-badge ${order.status}">${statusMap[order.status] || order.status}</span>
            </div>
            <div class="order-details">
                <div class="detail">
                    <div class="label">نقطة الاستلام</div>
                    <div class="value">${order.pickup}</div>
                </div>
                <div class="detail">
                    <div class="label">نقطة التوصيل</div>
                    <div class="value">${order.dropoff}</div>
                </div>
                <div class="detail">
                    <div class="label">المبلغ</div>
                    <div class="value">${order.amount.toLocaleString()} ر.ي</div>
                </div>
                <div class="detail">
                    <div class="label">الوقت</div>
                    <div class="value">${order.time}</div>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="fill" style="width:${Math.min(progress, 100)}%;"></div>
                </div>
                <div class="steps">${stepsHtml}</div>
            </div>
            <div style="text-align:center;margin-top:12px;color:var(--gray);font-size:13px;">
                آخر تحديث: ${new Date().toLocaleTimeString('ar-EG')}
            </div>
        `;
    }
    
    // ---------- Contact Form ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('contactSubmitBtn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                
                setTimeout(() => {
                    showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
                    contactForm.reset();
                }, 1500);
            }
        });
    }
    
    // ---------- Service Cards CTA ----------
    document.querySelectorAll('.btn-service').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const serviceName = this.closest('.service-card')?.querySelector('h3')?.textContent || 'الخدمة';
            showToast(`جاري التوجيه لطلب ${serviceName}...`, 'info');
        });
    });
    
    // ---------- CTA Section Button ----------
    const ctaBtn = document.querySelector('.cta-section .btn-white');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('جاري توجيهك لصفحة التسجيل...', 'info');
            setTimeout(() => {
                window.location.href = this.getAttribute('href') || '../customer-app/pages/register.html';
            }, 800);
        });
    }
    
    // ---------- Mobile Menu Toggle (Global) ----------
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('active');
            const btn = document.querySelector('.mobile-menu-btn i');
            if (btn) {
                btn.classList.toggle('fa-bars');
                btn.classList.toggle('fa-times');
            }
        }
    };
});