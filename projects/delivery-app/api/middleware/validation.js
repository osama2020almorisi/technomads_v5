// ============================================
// TechNomads Delivery System - Validation Middleware
// ============================================

const Joi = require('joi');

// ============================================
// VALIDATION SCHEMAS
// ============================================

const schemas = {
    // Order validation
    order: Joi.object({
        customerName: Joi.string().min(3).max(100).required(),
        customerPhone: Joi.string().min(9).max(15).required(),
        pickupAddress: Joi.string().min(5).max(200).required(),
        dropoffAddress: Joi.string().min(5).max(200).required(),
        zone: Joi.string().required(),
        type: Joi.string().valid('fast', 'normal', 'frozen', 'food').default('normal'),
        amount: Joi.number().positive().default(0),
        notes: Joi.string().max(500).allow('')
    }),

    // Driver validation
    driver: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        phone: Joi.string().min(9).max(15).required(),
        email: Joi.string().email().allow(''),
        zone: Joi.string().required(),
        status: Joi.string().valid('available', 'busy', 'offline', 'on_break').default('available'),
        vehicle: Joi.string().max(100).allow(''),
        plate: Joi.string().max(20).allow(''),
        password: Joi.string().min(6).required()
    }),

    // Customer validation
    customer: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        phone: Joi.string().min(9).max(15).required(),
        email: Joi.string().email().allow(''),
        zone: Joi.string().required(),
        address: Joi.string().max(200).allow('')
    }),

    // Zone validation
    zone: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        description: Joi.string().max(200).allow(''),
        price: Joi.number().positive().default(2500),
        time: Joi.string().default('30-45 دقيقة'),
        active: Joi.boolean().default(true)
    }),

    // Login validation
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    // Register validation
    register: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().min(9).max(15).required(),
        role: Joi.string().valid('driver', 'customer').default('customer')
    }),

    // Update status validation
    statusUpdate: Joi.object({
        status: Joi.string().valid(
            'pending', 'accepted', 'pickup', 'delivering', 'delivered', 'cancelled'
        ).required()
    }),

    // Assign driver validation
    assignDriver: Joi.object({
        driverId: Joi.string().required(),
        driverName: Joi.string().required()
    }),

    // Settings validation
    settings: Joi.object({
        appName: Joi.string().max(50).allow(''),
        defaultLanguage: Joi.string().valid('ar', 'en').default('ar'),
        defaultCurrency: Joi.string().valid('YER', 'SAR', 'USD').default('YER'),
        timezone: Joi.string().default('Asia/Aden'),
        minOrderAmount: Joi.number().positive().default(500),
        maxDistance: Joi.number().positive().default(20),
        driverWaitTime: Joi.number().positive().default(10),
        taxRate: Joi.number().min(0).max(100).default(5),
        serviceFee: Joi.number().min(0).max(100).default(10),
        defaultPaymentMethod: Joi.string().valid('cash', 'card', 'wallet').default('cash'),
        walletLimit: Joi.number().positive().default(10000),
        sessionTimeout: Joi.number().positive().default(24),
        loginAttempts: Joi.number().positive().default(5),
        twoFactorAuth: Joi.boolean().default(true),
        themeMode: Joi.string().valid('light', 'dark', 'system').default('light'),
        primaryColor: Joi.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1')
    }),

    // Notification validation
    notification: Joi.object({
        userId: Joi.string().required(),
        type: Joi.string().valid('order', 'driver', 'payment', 'system', 'promotion').required(),
        title: Joi.string().max(100).required(),
        message: Joi.string().max(500).required(),
        icon: Joi.string().default('fa-bell'),
        color: Joi.string().default('primary'),
        data: Joi.object().default({})
    })
};

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

function validate(schemaName) {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                success: false,
                message: `Validation schema '${schemaName}' not found`
            });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        req.body = value;
        next();
    };
}

// ============================================
// SANITIZATION HELPERS
// ============================================

function sanitizeString(str) {
    if (!str) return '';
    return str
        .trim()
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ');
}

function sanitizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
}

function sanitizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    schemas,
    validate,
    sanitizeString,
    sanitizePhone,
    sanitizeEmail
};