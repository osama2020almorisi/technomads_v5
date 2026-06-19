// ============================================
// TechNomads Delivery System - Admin Auth
// ============================================

const Auth = {
    user: null,
    token: localStorage.getItem('adminToken') || null,
    rememberMe: localStorage.getItem('rememberMe') === 'true',

    // ============================================
    // INIT
    // ============================================
    init() {
        if (this.token) {
            this.verifyToken();
        }

        // Check session on page load
        if (window.location.pathname.includes('dashboard.html') && !this.token) {
            this.redirectToLogin();
        }
    },

    // ============================================
    // LOGIN
    // ============================================
    async login(email, password, remember = false) {
        try {
            const response = await API.auth.login(email, password);

            if (response.token) {
                this.token = response.token;
                this.user = response.user;
                this.rememberMe = remember;

                localStorage.setItem('adminToken', response.token);
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('adminEmail', email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('adminEmail');
                }

                return { success: true, user: response.user };
            }

            return { success: false, error: response.message || 'فشل تسجيل الدخول' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // VERIFY TOKEN
    // ============================================
    async verifyToken() {
        try {
            const response = await API.auth.verifyToken();

            if (response.user) {
                this.user = response.user;
                return true;
            }

            this.logout();
            return false;
        } catch (error) {
            this.logout();
            return false;
        }
    },

    // ============================================
    // LOGOUT
    // ============================================
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberMe');
        this.redirectToLogin();
    },

    // ============================================
    // REDIRECTS
    // ============================================
    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    },

    redirectToDashboard() {
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
    },

    // ============================================
    // CHECK PERMISSIONS
    // ============================================
    hasPermission(permission) {
        if (!this.user || !this.user.permissions) return false;
        return this.user.permissions.includes(permission) || this.user.role === 'super_admin';
    },

    isSuperAdmin() {
        return this.user && this.user.role === 'super_admin';
    },

    isAdmin() {
        return this.user && (this.user.role === 'admin' || this.user.role === 'super_admin');
    },

    // ============================================
    // GET USER
    // ============================================
    getUser() {
        return this.user;
    },

    getToken() {
        return this.token;
    },

    isAuthenticated() {
        return !!this.token;
    }
};

// ============================================
// LOGIN PAGE HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            const remember = this.querySelector('#remember')?.checked || false;

            const btn = this.querySelector('.btn-login');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
            btn.disabled = true;

            const result = await Auth.login(email, password, remember);

            btn.innerHTML = originalText;
            btn.disabled = false;

            if (result.success) {
                showToast('مرحباً بك في لوحة التحكم', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showToast(result.error || 'بيانات الدخول غير صحيحة', 'error');
            }
        });
    }

    // Auto-fill saved email
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail && document.getElementById('email')) {
        document.getElementById('email').value = savedEmail;
        if (document.getElementById('remember')) {
            document.getElementById('remember').checked = true;
        }
    }
});

// ============================================
// TOAST HELPER
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 15px 30px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 90%;
    `;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export
window.Auth = Auth;
window.showToast = showToast;