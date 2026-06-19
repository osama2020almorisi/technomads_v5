// ============================================
// TechNomads Delivery System - API Entry Point
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import config
const { DB_CONFIG, getConfig, db } = require('./config/database');

// Import middleware
const {
    authenticate,
    authorize,
    requirePermission,
    rateLimiter,
    logger
} = require('./middleware/auth');

// Import endpoints
const ordersAPI = require('./endpoints/orders');
const driversAPI = require('./endpoints/drivers');
const customersAPI = require('./endpoints/customers');
const zonesAPI = require('./endpoints/zones');

// ============================================
// APP INITIALIZATION
// ============================================
const app = express();
const config = getConfig();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(compression());
app.use(cors(DB_CONFIG.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(rateLimiter(100, 15 * 60 * 1000));

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        environment: config.env,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    // In production, verify password with bcrypt
    const user = require('./middleware/auth').findUserByEmail(email);

    if (!user || !user.active) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // In production, compare hashed password
    // For demo, accept any password
    const token = require('./middleware/auth').generateToken(user);

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

app.post('/api/auth/logout', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

app.get('/api/auth/verify', authenticate, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            permissions: req.user.permissions
        }
    });
});

// ============================================
// ORDERS ROUTES
// ============================================
app.get('/api/orders', authenticate, (req, res) => {
    const filters = req.query;
    const orders = ordersAPI.getOrders(filters);
    res.json({ success: true, data: orders, count: orders.length });
});

app.get('/api/orders/stats', authenticate, requirePermission('view_reports'), (req, res) => {
    const stats = ordersAPI.getOrderStats();
    res.json({ success: true, data: stats });
});

app.get('/api/orders/:id', authenticate, (req, res) => {
    const order = ordersAPI.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

app.post('/api/orders', authenticate, requirePermission('create_order'), (req, res) => {
    const order = ordersAPI.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
});

app.put('/api/orders/:id', authenticate, requirePermission('edit_order'), (req, res) => {
    const order = ordersAPI.updateOrder(req.params.id, req.body);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

app.patch('/api/orders/:id/status', authenticate, requirePermission('update_order_status'), (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = ordersAPI.updateOrderStatus(req.params.id, status);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

app.post('/api/orders/:id/assign', authenticate, requirePermission('assign_driver'), (req, res) => {
    const { driverId, driverName } = req.body;
    if (!driverId) {
        return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    const order = ordersAPI.assignDriver(req.params.id, driverId, driverName);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
});

app.delete('/api/orders/:id', authenticate, requirePermission('delete_order'), (req, res) => {
    const result = ordersAPI.deleteOrder(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
});

// ============================================
// DRIVERS ROUTES
// ============================================
app.get('/api/drivers', authenticate, (req, res) => {
    const filters = req.query;
    const drivers = driversAPI.getDrivers(filters);
    res.json({ success: true, data: drivers, count: drivers.length });
});

app.get('/api/drivers/stats', authenticate, requirePermission('view_reports'), (req, res) => {
    const stats = driversAPI.getDriverStats();
    res.json({ success: true, data: stats });
});

app.get('/api/drivers/:id', authenticate, (req, res) => {
    const driver = driversAPI.getDriverById(req.params.id);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

app.post('/api/drivers', authenticate, requirePermission('manage_drivers'), (req, res) => {
    const driver = driversAPI.createDriver(req.body);
    res.status(201).json({ success: true, data: driver });
});

app.put('/api/drivers/:id', authenticate, requirePermission('manage_drivers'), (req, res) => {
    const driver = driversAPI.updateDriver(req.params.id, req.body);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

app.patch('/api/drivers/:id/status', authenticate, requirePermission('manage_drivers'), (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const driver = driversAPI.updateDriverStatus(req.params.id, status);
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
});

app.delete('/api/drivers/:id', authenticate, requirePermission('manage_drivers'), (req, res) => {
    const result = driversAPI.deleteDriver(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
});

// ============================================
// CUSTOMERS ROUTES
// ============================================
app.get('/api/customers', authenticate, (req, res) => {
    const filters = req.query;
    const customers = customersAPI.getCustomers(filters);
    res.json({ success: true, data: customers, count: customers.length });
});

app.get('/api/customers/stats', authenticate, requirePermission('view_reports'), (req, res) => {
    const stats = customersAPI.getCustomerStats();
    res.json({ success: true, data: stats });
});

app.get('/api/customers/:id', authenticate, (req, res) => {
    const customer = customersAPI.getCustomerById(req.params.id);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
});

app.post('/api/customers', authenticate, requirePermission('manage_customers'), (req, res) => {
    const customer = customersAPI.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
});

app.put('/api/customers/:id', authenticate, requirePermission('manage_customers'), (req, res) => {
    const customer = customersAPI.updateCustomer(req.params.id, req.body);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
});

app.delete('/api/customers/:id', authenticate, requirePermission('manage_customers'), (req, res) => {
    const result = customersAPI.deleteCustomer(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
});

// ============================================
// ZONES ROUTES
// ============================================
app.get('/api/zones', authenticate, (req, res) => {
    const filters = req.query;
    const zones = zonesAPI.getZones(filters);
    res.json({ success: true, data: zones, count: zones.length });
});

app.get('/api/zones/stats', authenticate, requirePermission('view_reports'), (req, res) => {
    const stats = zonesAPI.getZoneStats();
    res.json({ success: true, data: stats });
});

app.get('/api/zones/pricing', authenticate, (req, res) => {
    const rules = zonesAPI.getPricingRules();
    res.json({ success: true, data: rules });
});

app.put('/api/zones/pricing', authenticate, requirePermission('manage_settings'), (req, res) => {
    const rules = zonesAPI.updatePricingRules(req.body);
    res.json({ success: true, data: rules });
});

app.get('/api/zones/:id', authenticate, (req, res) => {
    const zone = zonesAPI.getZoneById(req.params.id);
    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, data: zone });
});

app.post('/api/zones', authenticate, requirePermission('manage_zones'), (req, res) => {
    const zone = zonesAPI.createZone(req.body);
    res.status(201).json({ success: true, data: zone });
});

app.put('/api/zones/:id', authenticate, requirePermission('manage_zones'), (req, res) => {
    const zone = zonesAPI.updateZone(req.params.id, req.body);
    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, data: zone });
});

app.delete('/api/zones/:id', authenticate, requirePermission('manage_zones'), (req, res) => {
    const result = zonesAPI.deleteZone(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.json({ success: true, message: 'Zone deleted successfully' });
});

// ============================================
// NOTIFICATIONS ROUTES (Mock)
// ============================================
app.get('/api/notifications', authenticate, (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'N001', type: 'order', message: 'طلب جديد #1234', read: false, createdAt: new Date().toISOString() },
            { id: 'N002', type: 'driver', message: 'السائق أحمد غادر للتوصيل', read: false, createdAt: new Date().toISOString() }
        ],
        count: 2
    });
});

app.patch('/api/notifications/:id/read', authenticate, (req, res) => {
    res.json({ success: true, message: 'Notification marked as read' });
});

app.post('/api/notifications/read-all', authenticate, (req, res) => {
    res.json({ success: true, message: 'All notifications marked as read' });
});

// ============================================
// SETTINGS ROUTES (Mock)
// ============================================
app.get('/api/settings', authenticate, requirePermission('view_settings'), (req, res) => {
    res.json({
        success: true,
        data: {
            appName: 'TechNomads',
            defaultLanguage: 'ar',
            defaultCurrency: 'YER',
            timezone: 'Asia/Aden',
            taxRate: 5,
            serviceFee: 10,
            themeMode: 'light',
            primaryColor: '#6366f1'
        }
    });
});

app.put('/api/settings', authenticate, requirePermission('manage_settings'), (req, res) => {
    res.json({
        success: true,
        message: 'Settings updated successfully',
        data: req.body
    });
});

// ============================================
// REPORTS ROUTES (Mock)
// ============================================
app.get('/api/reports/orders', authenticate, requirePermission('view_reports'), (req, res) => {
    res.json({
        success: true,
        data: {
            type: 'orders',
            period: req.query.period || 'month',
            total: 156,
            completed: 142,
            pending: 8,
            revenue: 385000,
            chart: {
                labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                values: [45, 62, 38, 75, 55, 89, 42]
            }
        }
    });
});

app.get('/api/reports/export/:type', authenticate, requirePermission('view_reports'), (req, res) => {
    const format = req.query.format || 'pdf';
    res.json({
        success: true,
        message: `Report exported as ${format}`,
        downloadUrl: `/reports/export-${Date.now()}.${format}`
    });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: config.isDevelopment ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to database (mock)
        await db.connect();

        app.listen(PORT, () => {
            console.log(`🚀 TechNomads API Server running on port ${PORT}`);
            console.log(`📝 Environment: ${config.env}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await db.disconnect();
    process.exit(0);
});

// Start server if running directly
if (require.main === module) {
    startServer();
}

// ============================================
// EXPORTS
// ============================================
module.exports = { app, startServer };