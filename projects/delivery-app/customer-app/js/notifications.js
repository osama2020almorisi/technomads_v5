// ============================================
// TechNomads - Driver App Notifications
// ============================================

const Notifications = {
    permission: 'default',
    notifications: [],
    unreadCount: 0,

    // ============================================
    // INIT
    // ============================================
    init() {
        // Request notification permission
        if ('Notification' in window) {
            this.permission = Notification.permission;

            if (this.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    this.permission = permission;
                });
            }
        }

        // Load notifications
        this.loadNotifications();

        // Check for new notifications every 30 seconds
        setInterval(() => {
            this.checkNew();
        }, 30000);
    },

    // ============================================
    // LOAD NOTIFICATIONS
    // ============================================
    async loadNotifications() {
        try {
            const response = await API.notifications.getAll();
            if (response.data) {
                this.notifications = response.data;
                this.unreadCount = response.unreadCount || 0;
                this.updateBadge();
                this.render();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    },

    // ============================================
    // CHECK NEW
    // ============================================
    async checkNew() {
        try {
            const response = await API.notifications.getAll();
            if (response.data) {
                const oldCount = this.notifications.length;
                this.notifications = response.data;
                this.unreadCount = response.unreadCount || 0;

                if (this.notifications.length > oldCount) {
                    // New notifications
                    const newNotifs = this.notifications.slice(0, this.notifications.length - oldCount);
                    newNotifs.forEach(notif => {
                        this.showNotification(notif);
                    });
                }

                this.updateBadge();
                this.render();
            }
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    },

    // ============================================
    // SHOW NOTIFICATION
    // ============================================
    showNotification(notification) {
        // Browser notification
        if (this.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: notification.icon || '/images/logo.png',
                tag: notification.id,
                data: notification
            };

            const notif = new Notification(notification.title || 'TechNomads', options);

            notif.onclick = () => {
                window.focus();
                this.handleClick(notification);
            };
        }

        // In-app toast
        this.showToast(notification);
    },

    // ============================================
    // MARK AS READ
    // ============================================
    async markAsRead(id) {
        try {
            await API.notifications.markRead(id);
            const notif = this.notifications.find(n => n.id === id);
            if (notif) {
                notif.read = true;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateBadge();
                this.render();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    // ============================================
    // MARK ALL AS READ
    // ============================================
    async markAllAsRead() {
        try {
            await API.notifications.markAllRead();
            this.notifications.forEach(n => n.read = true);
            this.unreadCount = 0;
            this.updateBadge();
            this.render();
            showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    // ============================================
    // UPDATE BADGE
    // ============================================
    updateBadge() {
        const badges = document.querySelectorAll('.nav-badge, .notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    },

    // ============================================
    // RENDER
    // ============================================
    render() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="Notifications.markAsRead('${n.id}')">
                <div class="notification-icon" style="background: rgba(99,102,241,0.1); color: var(--${n.color || 'primary'});">
                    <i class="fas ${n.icon || 'fa-bell'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title || 'إشعار'}</div>
                    <div class="notification-text">${n.message}</div>
                    <div class="notification-time">${this.formatTime(n.createdAt)}</div>
                </div>
                ${!n.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');
    },

    // ============================================
    // FORMAT TIME
    // ============================================
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
    // HANDLE CLICK
    // ============================================
    handleClick(notification) {
        // Navigate based on notification type
        if (notification.type === 'order') {
            window.location.href = `orders.html?id=${notification.data?.orderId}`;
        } else if (notification.type === 'driver') {
            window.location.href = 'profile.html';
        } else {
            // Default action
            this.markAsRead(notification.id);
        }
    },

    // ============================================
    // TOAST
    // ============================================
    showToast(notification) {
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.style.cssText = `
            position: fixed;
            top: 70px;
            right: 16px;
            left: 16px;
            max-width: 400px;
            margin: 0 auto;
            background: var(--white);
            border-radius: 12px;
            padding: 14px 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 9999;
            border-right: 4px solid var(--primary);
            animation: slideDown 0.3s ease;
            cursor: pointer;
            font-family: 'Tajawal', sans-serif;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        `;

        toast.innerHTML = `
            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(99,102,241,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas ${notification.icon || 'fa-bell'}"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 700; font-size: 14px;">${notification.title || 'إشعار'}</div>
                <div style="font-size: 13px; color: var(--gray);">${notification.message}</div>
            </div>
            <button style="background: none; border: none; color: var(--gray); cursor: pointer; font-size: 16px; padding: 4px;" onclick="this.closest('.notification-toast').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toast.addEventListener('click', () => {
            this.handleClick(notification);
            toast.remove();
        });

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
};

// Export
window.Notifications = Notifications;