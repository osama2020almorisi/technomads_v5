// ============================================
// TechNomads Delivery System - Driver Routes
// ============================================

const express = require('express');
const router = express.Router();

const { auth, validation, errorHandler } = require('../middleware');
const endpoints = require('../endpoints');

// ============================================
// DRIVER AUTH
// ============================================
router.post('/auth/login', validation.validate('login'), (req, res) => {
    const { email, password } = req.body;
    const user = endpoints.auth.findUserByEmail(email);

    if (!user || !user.active || user.role !== 'driver') {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials or not a driver'
        });
    }

    const token = endpoints.auth.generateToken(user);

    // Get driver details
    const driver = endpoints.drivers.getDriverById(user.id.replace('U', 'D'));

    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        driver
    });
});

// ============================================
// DRIVER ORDERS
// ============================================
router.get('/orders', auth.authenticate, (req, res) => {
    const driverId = req.user.id.replace('U', 'D');
    const orders = endpoints.orders.getOrders({ driverId });
    res.json({ success: true, data: orders, count: orders.length });
});

router.get('/orders/available', auth.authenticate, (req, res) => {
    const orders = endpoints.orders.getOrders({ status: 'pending' });
    res.json({ success: true, data: orders, count: orders.length });
});

router.patch('/orders/:id/accept', auth.authenticate, (req, res) => {
    const driverId = req.user.id.replace('U', 'D');
    const driver = endpoints.drivers.getDriverById(driverId);

    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const order = endpoints.orders.assignDriver(req.params.id, driverId, driver.name);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update driver status
    endpoints.drivers.updateDriverStatus(driverId, 'busy');

    res.json({ success: true, data: order });
});

router.patch('/orders/:id/status', auth.authenticate, validation.validate('statusUpdate'), (req, res) => {
    const order = endpoints.orders.updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is delivered or cancelled, update driver status
    if (req.body.status === 'delivered' || req.body.status === 'cancelled') {
        const driverId = req.user.id.replace('U', 'D');
        endpoints.drivers.updateDriverStatus(driverId, 'available');
    }

    res.json({ success: true, data: order });
});

// ============================================
// DRIVER PROFILE
// ============================================
router.get('/profile', auth.authenticate, (req, res) => {
    const driverId = req.user.id.replace('U', 'D');
    const driver = endpoints.drivers.getDriverById(driverId);

    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
});

router.patch('/profile', auth.authenticate, (req, res) => {
    const driverId = req.user.id.replace('U', 'D');
    const driver = endpoints.drivers.updateDriver(driverId, req.body);

    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
});

router.patch('/profile/status', auth.authenticate, (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const driverId = req.user.id.replace('U', 'D');
    const driver = endpoints.drivers.updateDriverStatus(driverId, status);

    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
});

// ============================================
// DRIVER STATS
// ============================================
router.get('/stats', auth.authenticate, (req, res) => {
    const driverId = req.user.id.replace('U', 'D');
    const driver = endpoints.drivers.getDriverById(driverId);

    if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const stats = {
        orders: driver.orders,
        earnings: driver.earnings,
        rating: driver.rating,
        status: driver.status
    };

    res.json({ success: true, data: stats });
});

// ============================================
// ERROR HANDLER
// ============================================
router.use(errorHandler.errorHandler);

module.exports = router;