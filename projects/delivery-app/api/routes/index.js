// ============================================
// TechNomads Delivery System - Routes Index
// ============================================

const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const driverRoutes = require('./driver');
const customerRoutes = require('./customer');

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Mount routes
router.use('/admin', adminRoutes);
router.use('/driver', driverRoutes);
router.use('/customer', customerRoutes);

module.exports = router;