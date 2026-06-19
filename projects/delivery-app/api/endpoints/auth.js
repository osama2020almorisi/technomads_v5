// ============================================
// TechNomads Delivery System - Auth API
// ============================================

const jwt = require('jsonwebtoken');
const { DB_CONFIG } = require('../config/database');

// Mock user database
const users = [
    {
        id: 'U001',
        name: 'مدير النظام',
        email: 'admin@technomads.ye',
        password: '$2a$10$hashed_password', // In production: bcrypt
        role: 'super_admin',
        permissions: ['*'],
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'U002',
        name: 'أحمد علي',
        email: 'ahmed@technomads.ye',
        password: '$2a$10$hashed_password',
        role: 'driver',
        permissions: ['view_orders', 'update_order_status'],
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'U003',
        name: 'محمد عبدالله',
        email: 'mohammed@technomads.ye',
        password: '$2a$10$hashed_password',
        role: 'customer',
        permissions: ['view_orders', 'create_order'],
        active: true,
        createdAt: new Date().toISOString()
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

function findUserByRole(role) {
    return users.filter(u => u.role === role);
}

// ============================================
// AUTH MIDDLEWARE
// ============================================

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

// ============================================
// EXPORTS
// ============================================
module.exports = {
    users,
    generateToken,
    verifyToken,
    findUserByEmail,
    findUserById,
    findUserByRole,
    authenticate,
    authorize,
    requirePermission
};