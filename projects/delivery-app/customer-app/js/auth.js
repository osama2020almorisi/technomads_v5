// ============================================
// TechNomads - Customer App
// Authentication Module
// ============================================

const Auth = {
    user: null,
    token: localStorage.getItem('customerToken') || null,
    redirectUrl: null,
    isInitialized: false,

    // ============================================
    // INIT
    // ============================================
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Get current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isAuthPage = ['login.html', 'register.html', 'index.html'].includes(currentPage);
        
        // Check if user is authenticated
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || !!this.token;

        console.log('🔐 Auth init - Page:', currentPage, 'IsAuthPage:', isAuthPage, 'IsLoggedIn:', isLoggedIn);

        if (isLoggedIn && isAuthPage) {
            // User is logged in but on auth page → redirect to dashboard
            console.log('➡️ Redirecting to dashboard (logged in on auth page)');
            window.location.href = 'dashboard.html';
            return;
        }

        if (!isLoggedIn && !isAuthPage) {
            // User is not logged in and not on auth page → redirect to login
            console.log('➡️ Redirecting to login (not logged in)');
            this.redirectUrl = currentPage;
            window.location.href = 'login.html';
            return;
        }

        // Load user data if logged in
        if (isLoggedIn) {
            this.loadUserData();
        }
    },

    // ============================================
    // LOAD USER DATA
    // ============================================
    loadUserData() {
        // Try to get from localStorage
        const stored = localStorage.getItem('customerUser');
        if (stored) {
            try {
                this.user = JSON.parse(stored);
            } catch (e) {
                this.user = null;
            }
        }

        // Also get token
        this.token = localStorage.getItem('customerToken');

        // If no user data but logged in, create default
        if (!this.user && localStorage.getItem('isLoggedIn') === 'true') {
            this.user = {
                name: localStorage.getItem('userName') || 'مستخدم',
                phone: '+967 770 200 970'
            };
            localStorage.setItem('customerUser', JSON.stringify(this.user));
        }
    },

    // ============================================
    // LOGIN
    // ============================================
    async login(phone, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In production, use real API:
            // const response = await API.auth.login(phone, password);
            // if (response.token) { ... }

            // Mock successful login
            const userData = {
                name: 'محمد عبدالله',
                phone: phone,
                email: 'mohamed@email.com',
                zone: 'صنعاء'
            };

            const token = 'mock_token_' + Date.now();

            // Save to localStorage
            this.token = token;
            this.user = userData;
            localStorage.setItem('customerToken', token);
            localStorage.setItem('customerUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', userData.name);

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // REGISTER
    // ============================================
    async register(data) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful registration
            const userData = {
                name: data.fullName || data.name,
                phone: data.phone,
                email: data.email || '',
                zone: data.zone || 'صنعاء'
            };

            const token = 'mock_token_' + Date.now();

            this.token = token;
            this.user = userData;
            localStorage.setItem('customerToken', token);
            localStorage.setItem('customerUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', userData.name);

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // VERIFY TOKEN
    // ============================================
    async verifyToken() {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if token exists
            if (!this.token) {
                this.logout();
                return false;
            }

            // In production: const response = await API.auth.verify();
            // if (response.user) { ... }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    },

    // ============================================
    // LOGOUT
    // ============================================
    logout() {
        console.log('🔓 Logging out...');
        this.token = null;
        this.user = null;
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('trackingOrder');
        
        // Redirect to login
        window.location.href = 'login.html';
    },

    // ============================================
    // HELPERS
    // ============================================
    isAuthenticated() {
        return localStorage.getItem('isLoggedIn') === 'true' || !!this.token;
    },

    getUser() {
        if (this.user) return this.user;
        
        const stored = localStorage.getItem('customerUser');
        if (stored) {
            try {
                this.user = JSON.parse(stored);
                return this.user;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    getToken() {
        return this.token || localStorage.getItem('customerToken');
    },

    getUserName() {
        const user = this.getUser();
        if (user) {
            return user.name || user.fullName || 'مستخدم';
        }
        return localStorage.getItem('userName') || 'مستخدم';
    }
};

// ============================================
// EXPORT
// ============================================
window.Auth = Auth;