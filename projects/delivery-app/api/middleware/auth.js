// ============================================
// TechNomads Delivery System - Auth Middleware
// ============================================

const jwt = require('jsonwebtoken');
const { DB_CONFIG } = require('../config/database');

// Mock user database
const users = [
    {
        id: 'U001',
        name: 'مدير النظام',
        email: 'admin@technomads.ye',
        password: '$2a$10$hashed_password', // In production, use bcrypt
        role: 'super_admin',
        permissions: ['*'],
        active: true
    },
    {
        id: 'U002',
        name: 'أحمد علي',
        email: 'ahmed@technomads.ye',
        password: '$2a$10$hashed_password',
        role: 'driver',
        permissions: ['view_orders', 'update_order_status'],
        active: true
    },
    {
        id: 'U003',
        name: 'محمد عبدالله',
        email: 'mohammed@technomads.ye',
        password: '$2a$10$hashed_password',
        role: 'customer',
        permissions: ['view_orders', 'create_order'],
        active: true
    }
];

// ============================================
// AUTH FUNCTIONS
// ============================================

function generateToken(user, expiresIn = '7d') {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
    };

    return jwt.sign(payload, DB_CONFIG.jwt.secret, { expiresIn });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, DB_CONFIG.jwt.secret);
    } catch (error) {
        return null;
    }
}

function findUserByEmail(email) {
    return users.find(u => u.email === email) || null;
}

function findUserById(id) {
    return users.find(u => u.id === id) || null;
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided'
        });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or expired token'
        });
    }

    const user = findUserById(decoded.id);
    if (!user || !user.active) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not found or inactive'
        });
    }

    req.user = user;
    req.token = token;
    next();
}

/**
 * Role-based authorization middleware
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Please authenticate first'
            });
        }

        if (roles.includes(req.user.role) || req.user.permissions.includes('*')) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Forbidden: Insufficient permissions'
        });
    };
}

/**
 * Permission-based authorization middleware
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Please authenticate first'
            });
        }

        if (req.user.permissions.includes('*') || req.user.permissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Forbidden: Missing required permission '${permission}'`
        });
    };
}

/**
 * Rate limiting middleware (mock)
 */
function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requests.has(ip)) {
            requests.set(ip, { count: 0, reset: now + windowMs });
        }

        const record = requests.get(ip);

        if (now > record.reset) {
            record.count = 0;
            record.reset = now + windowMs;
        }

        record.count++;

        if (record.count > limit) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }

        next();
    };
}

/**
 * Logging middleware
 */
function logger(req, res, next) {
    const start = Date.now();

    // Log after response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'unknown'
        };

        if (req.user) {
            log.userId = req.user.id;
            log.userRole = req.user.role;
        }

        console.log('[LOG]', JSON.stringify(log));
    });

    next();
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    authenticate,
    authorize,
    requirePermission,
    rateLimiter,
    logger,
    generateToken,
    verifyToken,
    findUserByEmail,
    findUserById,
    users
};