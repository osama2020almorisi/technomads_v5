// ============================================
// TechNomads Delivery System - Notifications API
// ============================================

// Mock notifications database
let notifications = [];
let notificationIdCounter = 1;

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

function getNotifications(userId, filters = {}) {
    let result = notifications.filter(n => n.userId === userId);

    if (filters.read !== undefined) {
        result = result.filter(n => n.read === (filters.read === 'true'));
    }

    if (filters.type) {
        result = result.filter(n => n.type === filters.type);
    }

    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
}

function getUnreadCount(userId) {
    return notifications.filter(n => n.userId === userId && !n.read).length;
}

function createNotification(data) {
    const notification = {
        id: `N${String(++notificationIdCounter).padStart(3, '0')}`,
        userId: data.userId,
        type: data.type || 'system',
        title: data.title,
        message: data.message,
        icon: data.icon || 'fa-bell',
        color: data.color || 'primary',
        read: false,
        data: data.data || {},
        createdAt: new Date().toISOString()
    };

    notifications.push(notification);
    return notification;
}

function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return null;

    notification.read = true;
    return notification;
}

function markAllAsRead(userId) {
    notifications
        .filter(n => n.userId === userId && !n.read)
        .forEach(n => n.read = true);

    return true;
}

function deleteNotification(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
}

function deleteAllNotifications(userId) {
    notifications = notifications.filter(n => n.userId !== userId);
    return true;
}

// ============================================
// SEED DATA
// ============================================
function seedNotifications() {
    const sampleNotifications = [
        {
            id: 'N001',
            userId: 'U001',
            type: 'order',
            title: 'طلب جديد',
            message: 'طلب جديد #1234 من محمد عبدالله',
            icon: 'fa-box',
            color: 'primary',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60000).toISOString()
        },
        {
            id: 'N002',
            userId: 'U001',
            type: 'driver',
            title: 'تحديث السائق',
            message: 'السائق أحمد علي بدأ التوصيل',
            icon: 'fa-motorcycle',
            color: 'success',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
            id: 'N003',
            userId: 'U001',
            type: 'payment',
            title: 'دفعة جديدة',
            message: 'دفعة جديدة بقيمة 15,000 ر.ي',
            icon: 'fa-money-bill-wave',
            color: 'warning',
            read: false,
            createdAt: new Date(Date.now() - 12 * 60000).toISOString()
        },
        {
            id: 'N004',
            userId: 'U002',
            type: 'order',
            title: 'طلب جديد متاح',
            message: 'طلب جديد #1235 متاح للاستلام',
            icon: 'fa-box',
            color: 'primary',
            read: true,
            createdAt: new Date(Date.now() - 30 * 60000).toISOString()
        }
    ];

    notifications = sampleNotifications;
    notificationIdCounter = 4;
}

// Seed on load
seedNotifications();

// ============================================
// EXPORTS
// ============================================
module.exports = {
    notifications,
    getNotifications,
    getUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    seedNotifications
};