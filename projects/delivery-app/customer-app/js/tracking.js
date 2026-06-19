// ============================================
// TechNomads - Customer App
// Order Tracking Module
// ============================================

const Tracking = {
    // State
    currentOrderId: null,
    orderData: null,
    driverLocation: null,
    isTracking: false,
    updateInterval: null,
    mapInstance: null,
    markerInstance: null,
    routePath: null,
    steps: ['pending', 'accepted', 'pickup', 'delivering', 'delivered'],

    // ============================================
    // INIT
    // ============================================
    init() {
        // Check if there's an active order to track
        const savedOrder = localStorage.getItem('trackingOrder');
        if (savedOrder) {
            try {
                this.orderData = JSON.parse(savedOrder);
                this.currentOrderId = this.orderData.id;
                this.startTracking();
            } catch (e) {
                console.error('Failed to parse tracking order:', e);
            }
        }

        // Setup event listeners
        this.setupEventListeners();
    },

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshTrackingBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshTracking();
            });
        }

        // Cancel tracking
        const cancelBtn = document.getElementById('cancelTrackingBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelTracking();
            });
        }

        // Call driver
        const callBtn = document.getElementById('callDriverBtn');
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                this.callDriver();
            });
        }

        // Message driver
        const msgBtn = document.getElementById('messageDriverBtn');
        if (msgBtn) {
            msgBtn.addEventListener('click', () => {
                this.messageDriver();
            });
        }
    },

    // ============================================
    // START TRACKING
    // ============================================
    startTracking(orderId = null) {
        if (orderId) {
            this.currentOrderId = orderId;
        }

        if (!this.currentOrderId) {
            console.warn('No order ID provided for tracking');
            return;
        }

        // Load order data
        this.loadOrderData();

        // Start location tracking
        this.startLocationTracking();

        // Start update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.refreshTracking();
        }, 10000); // Update every 10 seconds

        this.isTracking = true;
        this.updateUI();
    },

    // ============================================
    // STOP TRACKING
    // ============================================
    stopTracking() {
        this.isTracking = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.stopLocationTracking();
        localStorage.removeItem('trackingOrder');
        this.updateUI();
    },

    // ============================================
    // LOAD ORDER DATA
    // ============================================
    async loadOrderData() {
        try {
            // Try to get from API first
            const response = await API.orders.getDetails(this.currentOrderId);
            if (response.data) {
                this.orderData = response.data;
                localStorage.setItem('trackingOrder', JSON.stringify(this.orderData));
                this.renderOrderInfo();
                this.updateProgress();
                return;
            }
        } catch (error) {
            console.error('Failed to load order from API:', error);
        }

        // Fallback to mock data
        this.orderData = this.getMockOrderData();
        localStorage.setItem('trackingOrder', JSON.stringify(this.orderData));
        this.renderOrderInfo();
        this.updateProgress();
    },

    // ============================================
    // GET MOCK ORDER DATA
    // ============================================
    getMockOrderData() {
        return {
            id: this.currentOrderId || '#1234',
            status: 'delivering',
            pickupAddress: 'شارع تعز، جوار البنك المركزي',
            dropoffAddress: 'حي الصافية، خلف جامع النور',
            customerName: 'محمد عبدالله',
            driverName: 'أحمد علي',
            driverPhone: '+967 770 200 970',
            driverRating: 4.9,
            amount: 15000,
            createdAt: new Date().toISOString(),
            estimatedTime: 15,
            distance: 3.2,
            driverLocation: {
                lat: 15.3694,
                lng: 44.1910
            },
            progress: 60
        };
    },

    // ============================================
    // RENDER ORDER INFO
    // ============================================
    renderOrderInfo() {
        if (!this.orderData) return;

        // Order ID
        const idEl = document.getElementById('trackingOrderId');
        if (idEl) idEl.textContent = this.orderData.id;

        // Status
        const statusEl = document.getElementById('trackingStatus');
        if (statusEl) {
            statusEl.textContent = this.getStatusText(this.orderData.status);
            statusEl.className = `tracking-status ${this.orderData.status}`;
        }

        // Time
        const timeEl = document.getElementById('trackingTime');
        if (timeEl) {
            timeEl.textContent = `منذ ${this.formatTime(this.orderData.createdAt)}`;
        }

        // Estimated time
        const estEl = document.getElementById('estimatedTime');
        if (estEl) {
            estEl.textContent = this.orderData.estimatedTime || '15';
        }

        // Distance
        const distEl = document.getElementById('trackingDistance');
        if (distEl) {
            distEl.textContent = this.orderData.distance || '3.2';
        }

        // Pickup
        const pickupEl = document.getElementById('trackingPickup');
        if (pickupEl) pickupEl.textContent = this.orderData.pickupAddress;

        // Dropoff
        const dropoffEl = document.getElementById('trackingDropoff');
        if (dropoffEl) dropoffEl.textContent = this.orderData.dropoffAddress;

        // Driver info
        const driverNameEl = document.getElementById('trackingDriverName');
        if (driverNameEl) driverNameEl.textContent = this.orderData.driverName;

        const driverRatingEl = document.getElementById('trackingDriverRating');
        if (driverRatingEl) driverRatingEl.textContent = `⭐ ${this.orderData.driverRating}`;
    },

    // ============================================
    // UPDATE PROGRESS
    // ============================================
    updateProgress() {
        if (!this.orderData) return;

        const currentIndex = this.steps.indexOf(this.orderData.status);
        const progress = (currentIndex / (this.steps.length - 1)) * 100;

        // Progress bar
        const fill = document.getElementById('progressFill');
        if (fill) {
            fill.style.width = Math.min(progress, 100) + '%';
        }

        // Steps
        document.querySelectorAll('.tracking-step').forEach((step, index) => {
            step.classList.remove('completed', 'active');
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('active');
            }
        });
    },

    // ============================================
    // START LOCATION TRACKING
    // ============================================
    startLocationTracking() {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            return;
        }

        // Get initial location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.driverLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.updateMap();
            },
            (error) => {
                console.error('Failed to get location:', error);
                // Use mock location
                this.driverLocation = this.orderData?.driverLocation || {
                    lat: 15.3694,
                    lng: 44.1910
                };
                this.updateMap();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );

        // Watch position
        if (navigator.geolocation.watchPosition) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.driverLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateMap();
                },
                (error) => {
                    console.error('Location watch error:', error);
                },
                { enableHighAccuracy: true, distanceFilter: 10 }
            );
        }
    },

    // ============================================
    // STOP LOCATION TRACKING
    // ============================================
    stopLocationTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    // ============================================
    // UPDATE MAP
    // ============================================
    updateMap() {
        if (!this.driverLocation) return;

        // Simple map update (using a static map or CSS animation)
        // In production, you'd use a real map library like Leaflet or Google Maps

        const marker = document.getElementById('driverMarker');
        if (marker) {
            // Simulate movement with CSS transform
            const x = 40 + (this.driverLocation.lng % 0.01) * 2000;
            const y = 50 + (this.driverLocation.lat % 0.01) * 2000;
            marker.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
        }

        // Update driver location text
        const locEl = document.getElementById('driverLocationText');
        if (locEl) {
            locEl.textContent = `📍 ${this.driverLocation.lat.toFixed(4)}, ${this.driverLocation.lng.toFixed(4)}`;
        }
    },

    // ============================================
    // REFRESH TRACKING
    // ============================================
    async refreshTracking() {
        try {
            // Try to get updated order status
            const response = await API.orders.getDetails(this.currentOrderId);
            if (response.data) {
                this.orderData = response.data;
                localStorage.setItem('trackingOrder', JSON.stringify(this.orderData));
                this.renderOrderInfo();
                this.updateProgress();

                // Check if order is completed
                if (this.orderData.status === 'delivered' || this.orderData.status === 'cancelled') {
                    this.stopTracking();
                    showToast('تم إكمال الطلب!', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to refresh tracking:', error);
        }
    },

    // ============================================
    // CANCEL TRACKING
    // ============================================
    cancelTracking() {
        if (!confirm('هل أنت متأكد من إلغاء تتبع هذا الطلب؟')) return;

        this.stopTracking();
        showToast('تم إلغاء تتبع الطلب', 'info');
        window.location.href = 'orders.html';
    },

    // ============================================
    // CALL DRIVER
    // ============================================
    callDriver() {
        const phone = this.orderData?.driverPhone || '+967770200970';
        window.location.href = `tel:${phone}`;
    },

    // ============================================
    // MESSAGE DRIVER
    // ============================================
    messageDriver() {
        showToast('جاري فتح المحادثة مع السائق...', 'info');
        // In production, open chat modal or WhatsApp
    },

    // ============================================
    // UPDATE UI
    // ============================================
    updateUI() {
        const trackingContainer = document.getElementById('trackingContainer');
        const emptyContainer = document.getElementById('emptyTrackingContainer');

        if (trackingContainer && emptyContainer) {
            if (this.isTracking && this.orderData) {
                trackingContainer.style.display = 'block';
                emptyContainer.style.display = 'none';
            } else {
                trackingContainer.style.display = 'none';
                emptyContainer.style.display = 'block';
            }
        }
    },

    // ============================================
    // HELPERS
    // ============================================
    getStatusText(status) {
        const statuses = {
            'pending': 'قيد الانتظار',
            'accepted': 'تم القبول',
            'pickup': 'في الاستلام',
            'delivering': 'في الطريق',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        return statuses[status] || status;
    },

    formatTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);

        if (diff < 60) return 'الآن';
        if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
        return d.toLocaleDateString('ar-SA');
    },

    // ============================================
    // GET ORDER STATUS (Public)
    // ============================================
    getOrderStatus() {
        return this.orderData?.status || 'pending';
    },

    // ============================================
    // IS ACTIVE
    // ============================================
    isActive() {
        return this.isTracking && this.orderData &&
            this.orderData.status !== 'delivered' &&
            this.orderData.status !== 'cancelled';
    }
};

// ============================================
// EXPOSE TO GLOBAL
// ============================================
window.Tracking = Tracking;

// ============================================
// AUTO-INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    Tracking.init();
});