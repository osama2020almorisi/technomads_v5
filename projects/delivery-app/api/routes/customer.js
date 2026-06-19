// ============================================
// TechNomads Delivery System - Customer Routes
// ============================================

const express = require('express');
const router = express.Router();

const { auth, validation, errorHandler } = require('../middleware');
const endpoints = require('../endpoints');

// ============================================
// CUSTOMER AUTH
// ============================================
router.post('/auth/login', validation.validate('login'), (req, res) => {
    const { email, password } = req.body;
    const user = endpoints.auth.findUserByEmail(email);

    if (!user || !user.active || user.role !== 'customer') {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials or not a customer'
        });
    }

    const token = endpoints.auth.generateToken(user);

    // Get customer details
    const customer = endpoints.customers.getCustomerById(user.id.replace('U', 'C'));

    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        customer
    });
});

router.post('/auth/register', validation.validate('register'), (req, res) => {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = endpoints.auth.findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User already exists'
        });
    }

    // Create customer
    const customer = endpoints.customers.createCustomer({
        name,
        phone,
        email,
        zone: req.body.zone || 'صنعاء',
        address: req.body.address || ''
    });

    res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer
    });
});

// ============================================
// CUSTOMER ORDERS
// ============================================
router.get('/orders', auth.authenticate, (req, res) => {
    const customerId = req.user.id.replace('U', 'C');
    const orders = endpoints.orders.getOrders({ customerId });
    res.json({ success: true, data: orders, count: orders.length });
});

router.get('/orders/:id', auth.authenticate, (req, res) => {
    const order = endpoints.orders.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order belongs to customer
    const customerId = req.user.id.replace('U', 'C');
    if (order.customerId && order.customerId !== customerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: order });
});

router.post('/orders', auth.authenticate, validation.validate('order'), (req, res) => {
    const customerId = req.user.id.replace('U', 'C');
    const order = endpoints.orders.createOrder({
        ...req.body,
        customerId
    });

    // Update customer orders count
    const customer = endpoints.customers.getCustomerById(customerId);
    if (customer) {
        customer.orders = (customer.orders || 0) + 1;
    }

    res.status(201).json({ success: true, data: order });
});

router.patch('/orders/:id/cancel', auth.authenticate, (req, res) => {
    const order = endpoints.orders.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order belongs to customer
    const customerId = req.user.id.replace('U', 'C');
    if (order.customerId && order.customerId !== customerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending' && order.status !== 'accepted') {
        return res.status(400).json({
            success: false,
            message: 'Order cannot be cancelled at this stage'
        });
    }

    const updatedOrder = endpoints.orders.updateOrderStatus(req.params.id, 'cancelled');
    res.json({ success: true, data: updatedOrder });
});

// ============================================
// CUSTOMER PROFILE
// ============================================
router.get('/profile', auth.authenticate, (req, res) => {
    const customerId = req.user.id.replace('U', 'C');
    const customer = endpoints.customers.getCustomerById(customerId);

    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
});

router.patch('/profile', auth.authenticate, (req, res) => {
    const customerId = req.user.id.replace('U', 'C');
    const customer = endpoints.customers.updateCustomer(customerId, req.body);

    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
});

// ============================================
// CUSTOMER STATS
// ============================================
router.get('/stats', auth.authenticate, (req, res) => {
    const customerId = req.user.id.replace('U', 'C');
    const customer = endpoints.customers.getCustomerById(customerId);

    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const stats = {
        orders: customer.orders || 0,
        totalSpent: customer.totalSpent || 0,
        rating: customer.rating || 0,
        joinedAt: customer.joinedAt
    };

    res.json({ success: true, data: stats });
});

// ============================================
// TRACK ORDER
// ============================================
router.get('/track/:id', (req, res) => {
    const order = endpoints.orders.getOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get driver info if assigned
    let driver = null;
    if (order.driverId) {
        driver = endpoints.drivers.getDriverById(order.driverId);
    }

    res.json({
        success: true,
        data: {
            order,
            driver,
            status: order.status,
            estimatedTime: order.estimatedTime || '30-45 دقيقة'
        }
    });
});

// ============================================
// ERROR HANDLER
// ============================================
router.use(errorHandler.errorHandler);

module.exports = router;