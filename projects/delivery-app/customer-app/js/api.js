// ============================================
// TechNomads - Customer App
// API Service
// ============================================

const API = {
    baseURL: 'https://api.technomads.ye/v1',
    token: localStorage.getItem('customerToken') || null,

    // ============================================
    // HEADERS
    // ============================================
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    },

    // ============================================
    // REQUEST
    // ============================================
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ============================================
    // AUTH
    // ============================================
    auth: {
        login(email, password) {
            return API.request('/customer/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },

        logout() {
            return API.request('/customer/auth/logout', {
                method: 'POST'
            });
        },

        verify() {
            return API.request('/customer/auth/verify', {
                method: 'GET'
            });
        },

        register(data) {
            return API.request('/customer/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
    },

    // ============================================
    // ORDERS
    // ============================================
    orders: {
        create(data) {
            return API.request('/customer/orders', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        getList(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.request(`/customer/orders?${query}`, {
                method: 'GET'
            });
        },

        getDetails(orderId) {
            return API.request(`/customer/orders/${orderId}`, {
                method: 'GET'
            });
        },

        cancel(orderId) {
            return API.request(`/customer/orders/${orderId}/cancel`, {
                method: 'PATCH'
            });
        },

        getHistory(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.request(`/customer/orders/history?${query}`, {
                method: 'GET'
            });
        },

        track(orderId) {
            return API.request(`/customer/orders/${orderId}/track`, {
                method: 'GET'
            });
        }
    },

    // ============================================
    // CUSTOMER PROFILE
    // ============================================
    customer: {
        getProfile() {
            return API.request('/customer/profile', {
                method: 'GET'
            });
        },

        updateProfile(data) {
            return API.request('/customer/profile', {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        },

        getStats() {
            return API.request('/customer/stats', {
                method: 'GET'
            });
        },

        getEarnings(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.request(`/customer/earnings?${query}`, {
                method: 'GET'
            });
        },

        getAddresses() {
            return API.request('/customer/addresses', {
                method: 'GET'
            });
        },

        addAddress(data) {
            return API.request('/customer/addresses', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        deleteAddress(id) {
            return API.request(`/customer/addresses/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // ============================================
    // PAYMENTS
    // ============================================
    payments: {
        getMethods() {
            return API.request('/customer/payments/methods', {
                method: 'GET'
            });
        },

        addCard(data) {
            return API.request('/customer/payments/cards', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        deleteCard(id) {
            return API.request(`/customer/payments/cards/${id}`, {
                method: 'DELETE'
            });
        },

        processPayment(data) {
            return API.request('/customer/payments/process', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        getHistory(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.request(`/customer/payments/history?${query}`, {
                method: 'GET'
            });
        }
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================
    notifications: {
        getAll() {
            return API.request('/customer/notifications', {
                method: 'GET'
            });
        },

        markRead(id) {
            return API.request(`/customer/notifications/${id}/read`, {
                method: 'PATCH'
            });
        },

        markAllRead() {
            return API.request('/customer/notifications/read-all', {
                method: 'POST'
            });
        }
    },

    // ============================================
    // DRIVERS
    // ============================================
    drivers: {
        getInfo(driverId) {
            return API.request(`/customer/drivers/${driverId}`, {
                method: 'GET'
            });
        },

        rateDriver(driverId, rating, feedback) {
            return API.request(`/customer/drivers/${driverId}/rate`, {
                method: 'POST',
                body: JSON.stringify({ rating, feedback })
            });
        }
    },

    // ============================================
    // GPS / LOCATION
    // ============================================
    gps: {
        getNearbyDrivers(lat, lng, radius = 3) {
            return API.request(`/customer/gps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
                method: 'GET'
            });
        },

        estimatePrice(pickupLat, pickupLng, dropoffLat, dropoffLng) {
            return API.request('/customer/gps/estimate', {
                method: 'POST',
                body: JSON.stringify({
                    pickup: { lat: pickupLat, lng: pickupLng },
                    dropoff: { lat: dropoffLat, lng: dropoffLng }
                })
            });
        },

        getLocation(address) {
            return API.request(`/customer/gps/geocode?address=${encodeURIComponent(address)}`, {
                method: 'GET'
            });
        }
    },

    // ============================================
    // ZONES
    // ============================================
    zones: {
        getAll() {
            return API.request('/customer/zones', {
                method: 'GET'
            });
        },

        getZone(id) {
            return API.request(`/customer/zones/${id}`, {
                method: 'GET'
            });
        }
    }
};

// Export
window.API = API;