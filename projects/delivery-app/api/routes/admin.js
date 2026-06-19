// ============================================
// TechNomads Delivery System - Admin Routes
// ============================================

const express = require('express');
const router = express.Router();

const { auth, validation, errorHandler } = require('../middleware');
const endpoints = require('../endpoints');

// ============================================
// AUTH ROUTES
// ============================================
router.post('/auth/login', validation.validate('login'), (req, res) => {
    const { email, password } = req.body;
    const user = endpoints.auth.findUserByEmail(email);

    if (!user || !user.active) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    const token = endpoints.auth.generateToken(user);

    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }
    });
});

router.post('/auth/logout', auth.authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

router.get('/auth/verify', auth.authenticate, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ============================================
// ORDERS ROUTES
// ============================================
router.get('/orders', auth.authenticate, (req, res) => {
    const orders = endpoints.orders.getOrders(req.query);
    res.json({ success: true, data: orders, count: orders.length });
});

router.get('/orders/stats', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const stats = endpoints.orders.getOrderStats();
    res.json({ success: true, data: stats });
});

router.get('/orders/:id', auth.authenticate, (req, res) => {
    const order = endpoints.orders.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

router.post('/orders', auth.authenticate, auth.requirePermission('create_order'), validation.validate('order'), (req, res) => {
    const order = endpoints.orders.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
});

router.put('/orders/:id', auth.authenticate, auth.requirePermission('edit_order'), validation.validate('order'), (req, res) => {
    const order = endpoints.orders.updateOrder(req.params.id, req.body);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

router.patch('/orders/:id/status', auth.authenticate, auth.requirePermission('update_order_status'), validation.validate('statusUpdate'), (req, res) => {
    const order = endpoints.orders.updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

router.post('/orders/:id/assign', auth.authenticate, auth.requirePermission('assign_driver'), validation.validate('assignDriver'), (req, res) => {
    const order = endpoints.orders.assignDriver(req.params.id, req.body.driverId, req.body.driverName);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

router.delete('/orders/:id', auth.authenticate, auth.requirePermission('delete_order'), (req, res) => {
    const result = endpoints.orders.deleteOrder(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
});

// ============================================
// DRIVERS ROUTES
// ============================================
router.get('/drivers', auth.authenticate, (req, res) => {
    const drivers = endpoints.drivers.getDrivers(req.query);
    res.json({ success: true, data: drivers, count: drivers.length });
});

router.get('/drivers/stats', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const stats = endpoints.drivers.getDriverStats();
    res.json({ success: true, data: stats });
});

router.get('/drivers/:id', auth.authenticate, (req, res) => {
    const driver = endpoints.drivers.getDriverById(req.params.id);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

router.post('/drivers', auth.authenticate, auth.requirePermission('manage_drivers'), validation.validate('driver'), (req, res) => {
    const driver = endpoints.drivers.createDriver(req.body);
    res.status(201).json({ success: true, data: driver });
});

router.put('/drivers/:id', auth.authenticate, auth.requirePermission('manage_drivers'), validation.validate('driver'), (req, res) => {
    const driver = endpoints.drivers.updateDriver(req.params.id, req.body);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

router.patch('/drivers/:id/status', auth.authenticate, auth.requirePermission('manage_drivers'), (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const driver = endpoints.drivers.updateDriverStatus(req.params.id, status);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

router.delete('/drivers/:id', auth.authenticate, auth.requirePermission('manage_drivers'), (req, res) => {
    const result = endpoints.drivers.deleteDriver(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
});

// ============================================
// CUSTOMERS ROUTES
// ============================================
router.get('/customers', auth.authenticate, (req, res) => {
    const customers = endpoints.customers.getCustomers(req.query);
    res.json({ success: true, data: customers, count: customers.length });
});

router.get('/customers/stats', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const stats = endpoints.customers.getCustomerStats();
    res.json({ success: true, data: stats });
});

router.get('/customers/:id', auth.authenticate, (req, res) => {
    const customer = endpoints.customers.getCustomerById(req.params.id);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
});

router.post('/customers', auth.authenticate, auth.requirePermission('manage_customers'), validation.validate('customer'), (req, res) => {
    const customer = endpoints.customers.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
});

router.put('/customers/:id', auth.authenticate, auth.requirePermission('manage_customers'), validation.validate('customer'), (req, res) => {
    const customer = endpoints.customers.updateCustomer(req.params.id, req.body);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
});

router.delete('/customers/:id', auth.authenticate, auth.requirePermission('manage_customers'), (req, res) => {
    const result = endpoints.customers.deleteCustomer(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
});

// ============================================
// ZONES ROUTES
// ============================================
router.get('/zones', auth.authenticate, (req, res) => {
    const zones = endpoints.zones.getZones(req.query);
    res.json({ success: true, data: zones, count: zones.length });
});

router.get('/zones/stats', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const stats = endpoints.zones.getZoneStats();
    res.json({ success: true, data: stats });
});

router.get('/zones/pricing', auth.authenticate, (req, res) => {
    const rules = endpoints.zones.getPricingRules();
    res.json({ success: true, data: rules });
});

router.put('/zones/pricing', auth.authenticate, auth.requirePermission('manage_settings'), (req, res) => {
    const rules = endpoints.zones.updatePricingRules(req.body);
    res.json({ success: true, data: rules });
});

router.get('/zones/:id', auth.authenticate, (req, res) => {
    const zone = endpoints.zones.getZoneById(req.params.id);
    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, data: zone });
});

router.post('/zones', auth.authenticate, auth.requirePermission('manage_zones'), validation.validate('zone'), (req, res) => {
    const zone = endpoints.zones.createZone(req.body);
    res.status(201).json({ success: true, data: zone });
});

router.put('/zones/:id', auth.authenticate, auth.requirePermission('manage_zones'), validation.validate('zone'), (req, res) => {
    const zone = endpoints.zones.updateZone(req.params.id, req.body);
    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, data: zone });
});

router.delete('/zones/:id', auth.authenticate, auth.requirePermission('manage_zones'), (req, res) => {
    const result = endpoints.zones.deleteZone(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, message: 'Zone deleted successfully' });
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================
router.get('/notifications', auth.authenticate, (req, res) => {
    const notifications = endpoints.notifications.getNotifications(req.user.id, req.query);
    const unreadCount = endpoints.notifications.getUnreadCount(req.user.id);
    res.json({
        success: true,
        data: notifications,
        count: notifications.length,
        unreadCount
    });
});

router.patch('/notifications/:id/read', auth.authenticate, (req, res) => {
    const notification = endpoints.notifications.markAsRead(req.params.id);
    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
});

router.post('/notifications/read-all', auth.authenticate, (req, res) => {
    endpoints.notifications.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
});

router.delete('/notifications/:id', auth.authenticate, (req, res) => {
    const result = endpoints.notifications.deleteNotification(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted successfully' });
});

// ============================================
// SETTINGS ROUTES
// ============================================
router.get('/settings', auth.authenticate, auth.requirePermission('view_settings'), (req, res) => {
    const settings = endpoints.settings.getSettings();
    res.json({ success: true, data: settings });
});

router.put('/settings', auth.authenticate, auth.requirePermission('manage_settings'), validation.validate('settings'), (req, res) => {
    const settings = endpoints.settings.updateSettings(req.body);
    res.json({ success: true, data: settings });
});

router.get('/settings/public', (req, res) => {
    const settings = endpoints.settings.getPublicSettings();
    res.json({ success: true, data: settings });
});

// ============================================
// REPORTS ROUTES
// ============================================
router.get('/reports/orders', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const report = endpoints.reports.getOrdersReport(req.query);
    res.json({ success: true, data: report });
});

router.get('/reports/drivers', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const report = endpoints.reports.getDriversReport(req.query);
    res.json({ success: true, data: report });
});

router.get('/reports/revenue', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const report = endpoints.reports.getRevenueReport(req.query);
    res.json({ success: true, data: report });
});

router.get('/reports/zones', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const report = endpoints.reports.getZonesReport(req.query);
    res.json({ success: true, data: report });
});

router.get('/reports/export/:type', auth.authenticate, auth.requirePermission('view_reports'), (req, res) => {
    const result = endpoints.reports.exportReport(req.params.type, req.query.format || 'pdf', req.query);
    if (!result) {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }
    res.json({ success: true, data: result });
});

// ============================================
// ERROR HANDLER
// ============================================
router.use(errorHandler.errorHandler);

module.exports = router;