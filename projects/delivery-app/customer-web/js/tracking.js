/**
 * ============================================
 * TRACKING.JS - TechNomads
 * Order tracking functionality
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const trackingInput = document.getElementById('trackingInput');
    const trackBtn = document.querySelector('.btn-track');
    const resultDiv = document.getElementById('trackResult');
    
    if (!trackingInput || !trackBtn || !resultDiv) return;
    
    // ---------- Mock Database ----------
    const mockOrders = {
        '1234': {
            id: '#1234',
            status: 'delivering',
            pickup: 'شارع تعز، جوار البنك المركزي',
            dropoff: 'حي الصافية، خلف جامع النور',
            amount: 15000,
            driver: 'أحمد علي',
            driverRating: 4.9,
            driverPhone: '+967771234567',
            time: 'منذ 5 دقائق',
            progress: 60,
            createdAt: '2024-01-15T14:30:00',
            estimatedDelivery: '2024-01-15T15:00:00'
        },
        '1235': {
            id: '#1235',
            status: 'delivered',
            pickup: 'شارع الستين',
            dropoff: 'حي الحصبة',
            amount: 12000,
            driver: 'سامي حسن',
            driverRating: 4.8,
            driverPhone: '+967771234568',
            time: 'منذ ساعة',
            progress: 100,
            createdAt: '2024-01-15T13:00:00',
            estimatedDelivery: '2024-01-15T14:00:00'
        },
        '1229': {
            id: '#1229',
            status: 'pending',
            pickup: 'جولة المصباحي',
            dropoff: 'حي الحصبة',
            amount: 9500,
            driver: null,
            driverRating: null,
            driverPhone: null,
            time: 'منذ 10 دقائق',
            progress: 20,
            createdAt: '2024-01-15T14:50:00',
            estimatedDelivery: '2024-01-15T15:30:00'
        },
        '1236': {
            id: '#1236',
            status: 'cancelled',
            pickup: 'شارع حدة',
            dropoff: 'حي الروضة',
            amount: 8000,
            driver: null,
            driverRating: null,
            driverPhone: null,
            time: 'منذ 30 دقيقة',
            progress: 0,
            createdAt: '2024-01-15T13:30:00',
            estimatedDelivery: null
        },
        '1237': {
            id: '#1237',
            status: 'pickup',
            pickup: 'سوق البطحاء',
            dropoff: 'حي الجراف',
            amount: 11000,
            driver: 'ناصر علي',
            driverRating: 4.7,
            driverPhone: '+967771234569',
            time: 'منذ 8 دقائق',
            progress: 45,
            createdAt: '2024-01-15T14:45:00',
            estimatedDelivery: '2024-01-15T15:15:00'
        }
    };
    
    // ---------- Tracking Function ----------
    window.trackOrder = function() {
        const orderId = trackingInput.value.trim();
        
        if (!orderId) {
            showToast('يرجى إدخال رقم الطلب', 'error');
            trackingInput.focus();
            return;
        }
        
        // Clean input
        let cleanId = orderId.replace(/^#/, '');
        if (!cleanId.match(/^\d{4,5}$/)) {
            showToast('يرجى إدخال رقم طلب صحيح (مثال: 1234)', 'error');
            trackingInput.focus();
            return;
        }
        
        // Show loading
        resultDiv.classList.add('active');
        resultDiv.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div class="loading-spinner" style="margin:0 auto 12px;width:32px;height:32px;"></div>
                <p style="color:var(--gray);">جاري البحث عن الطلب #${cleanId}...</p>
            </div>
        `;
        
        // Simulate API call
        const searchTimeout = setTimeout(() => {
            const order = mockOrders[cleanId] || mockOrders[cleanId.substring(0, 4)];
            
            if (!order) {
                resultDiv.innerHTML = `
                    <div class="not-found">
                        <i class="fas fa-box-open"></i>
                        <h4>الطلب غير موجود</h4>
                        <p>تأكد من رقم الطلب وحاول مرة أخرى</p>
                        <button class="btn btn-outline" onclick="document.getElementById('trackingInput').focus();" style="margin-top:12px;">
                            <i class="fas fa-redo"></i> حاول مرة أخرى
                        </button>
                    </div>
                `;
                showToast('الطلب غير موجود، يرجى التحقق من الرقم', 'error');
                return;
            }
            
            resultDiv.innerHTML = renderOrderResult(order);
            
            // Update URL with order ID (optional)
            if (history.pushState) {
                const url = new URL(window.location);
                url.searchParams.set('id', cleanId);
                history.pushState({ orderId: cleanId }, '', url);
            }
            
            showToast(`تم العثور على الطلب ${order.id}`, 'success');
        }, 800);
        
        // Store timeout for cleanup
        trackBtn._timeout = searchTimeout;
    };
    
    // ---------- Render Order Result ----------
    function renderOrderResult(order) {
        const statusMap = {
            'pending': { label: 'قيد الانتظار', class: 'pending' },
            'accepted': { label: 'تم القبول', class: 'accepted' },
            'pickup': { label: 'في الاستلام', class: 'pickup' },
            'delivering': { label: 'في الطريق', class: 'delivering' },
            'delivered': { label: 'تم التوصيل', class: 'delivered' },
            'cancelled': { label: 'ملغي', class: 'cancelled' }
        };
        
        const steps = ['pending', 'accepted', 'pickup', 'delivering', 'delivered'];
        let currentIndex = steps.indexOf(order.status);
        if (currentIndex === -1) currentIndex = 0;
        const progress = order.progress || ((currentIndex / (steps.length - 1)) * 100);
        
        // Step icons and labels
        const stepConfig = {
            'pending': { icon: 'fa-clock', label: 'قيد الانتظار' },
            'accepted': { icon: 'fa-check', label: 'تم القبول' },
            'pickup': { icon: 'fa-box', label: 'في الاستلام' },
            'delivering': { icon: 'fa-truck', label: 'في الطريق' },
            'delivered': { icon: 'fa-flag-checkered', label: 'تم التوصيل' }
        };
        
        const stepsHtml = steps.map((step, index) => {
            let cls = '';
            if (index < currentIndex) cls = 'completed';
            else if (index === currentIndex) cls = 'active';
            
            return `
                <div class="step ${cls}">
                    <div class="dot"><i class="fas ${stepConfig[step].icon}"></i></div>
                    <span class="label">${stepConfig[step].label}</span>
                </div>
            `;
        }).join('');
        
        // Driver info
        const driverHtml = order.driver && order.status !== 'cancelled' ? `
            <div class="driver-info">
                <div class="avatar">${order.driver.charAt(0)}</div>
                <div class="info">
                    <div class="name">${order.driver}</div>
                    ${order.driverRating ? `<div class="rating"><i class="fas fa-star"></i> ${order.driverRating}</div>` : ''}
                </div>
                <div class="actions">
                    ${order.driverPhone ? `
                        <button class="call-btn" onclick="window.location.href='tel:${order.driverPhone}'" title="اتصال">
                            <i class="fas fa-phone"></i>
                        </button>
                    ` : ''}
                    <button class="msg-btn" onclick="showToast('جاري فتح المحادثة مع السائق...', 'info')" title="رسالة">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
        ` : '';
        
        // Estimated delivery
        const estDelivery = order.estimatedDelivery ? `
            <div style="text-align:center;margin-top:8px;font-size:13px;color:var(--gray);">
                <i class="fas fa-clock" style="color:var(--primary);"></i>
                الوقت المتوقع للتوصيل: ${formatTime(order.estimatedDelivery)}
            </div>
        ` : '';
        
        // Status badge class
        const statusClass = statusMap[order.status]?.class || 'pending';
        const statusLabel = statusMap[order.status]?.label || order.status;
        
        // Is delivered?
        const isDelivered = order.status === 'delivered';
        const isCancelled = order.status === 'cancelled';
        
        return `
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            
            <div class="order-details">
                <div class="detail">
                    <div class="label"><i class="fas fa-map-pin" style="color:var(--primary);"></i> نقطة الاستلام</div>
                    <div class="value">${order.pickup}</div>
                </div>
                <div class="detail">
                    <div class="label"><i class="fas fa-flag-checkered" style="color:var(--secondary);"></i> نقطة التوصيل</div>
                    <div class="value">${order.dropoff}</div>
                </div>
                <div class="detail">
                    <div class="label"><i class="fas fa-money-bill-wave" style="color:var(--warning);"></i> المبلغ</div>
                    <div class="value">${order.amount.toLocaleString()} ر.ي</div>
                </div>
                <div class="detail">
                    <div class="label"><i class="fas fa-calendar-alt" style="color:var(--info);"></i> وقت الطلب</div>
                    <div class="value">${order.time}</div>
                </div>
            </div>
            
            ${!isCancelled ? `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="fill" style="width:${Math.min(progress, 100)}%;"></div>
                    </div>
                    <div class="steps">${stepsHtml}</div>
                </div>
                ${estDelivery}
            ` : `
                <div style="text-align:center;padding:12px;background:rgba(239,68,68,0.08);border-radius:10px;color:var(--danger);font-weight:700;">
                    <i class="fas fa-times-circle"></i> تم إلغاء هذا الطلب
                </div>
            `}
            
            ${driverHtml}
            
            <div class="actions-row">
                ${!isDelivered && !isCancelled ? `
                    <button class="btn btn-primary" onclick="showToast('جاري فتح التتبع المباشر...', 'info')">
                        <i class="fas fa-map-marked-alt"></i> تتبع مباشر
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="window.location.href='../customer-app/pages/new-order.html'">
                        <i class="fas fa-plus"></i> طلب جديد
                    </button>
                `}
                <button class="btn btn-outline" onclick="window.location.href='../customer-app/pages/orders.html'">
                    <i class="fas fa-list"></i> كل الطلبات
                </button>
            </div>
            
            <div style="text-align:center;margin-top:12px;color:var(--gray-light);font-size:12px;">
                آخر تحديث: ${new Date().toLocaleTimeString('ar-EG')}
            </div>
        `;
    }
    
    // ---------- Helper: Format Time ----------
    function formatTime(timeString) {
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeString;
        }
    }
    
    // ---------- Enter Key ----------
    trackingInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            trackOrder();
        }
    });
    
    // ---------- Clear on focus ----------
    trackingInput.addEventListener('focus', function() {
        if (this.value && !this.dataset.cleared) {
            // Don't clear if coming from URL param
        }
    });
    
    // ---------- Check URL Params ----------
    function checkUrlForOrder() {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('id');
        if (orderId) {
            trackingInput.value = orderId;
            trackOrder();
        }
    }
    
    // Check on load
    checkUrlForOrder();
    
    // Listen for history changes
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.orderId) {
            trackingInput.value = e.state.orderId;
            trackOrder();
        }
    });
});