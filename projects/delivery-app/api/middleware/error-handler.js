// ============================================
// TechNomads Delivery System - Error Handler
// ============================================

const { getConfig } = require('../config/database');

class AppError extends Error {
    constructor(message, statusCode = 500, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error types
const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE: 'DUPLICATE',
    RATE_LIMIT: 'RATE_LIMIT',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR'
};

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

function errorHandler(err, req, res, next) {
    const config = getConfig();
    const isDevelopment = config.isDevelopment;

    // Log error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'INTERNAL_ERROR';
    let errors = null;

    // Handle Joi validation errors
    if (err.isJoi) {
        statusCode = 400;
        code = ErrorCodes.VALIDATION_ERROR;
        message = 'Validation failed';
        errors = err.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = ErrorCodes.AUTH_ERROR;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = ErrorCodes.AUTH_ERROR;
        message = 'Token expired';
    }

    // Handle database errors
    if (err.code === '23505') {
        statusCode = 409;
        code = ErrorCodes.DUPLICATE;
        message = 'Duplicate entry';
    }

    // Handle not found
    if (err.name === 'NotFoundError') {
        statusCode = 404;
        code = ErrorCodes.NOT_FOUND;
        message = err.message || 'Resource not found';
    }

    const response = {
        success: false,
        message,
        code
    };

    if (errors) {
        response.errors = errors;
    }

    if (isDevelopment) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

// ============================================
// NOT FOUND HANDLER
// ============================================

function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route '${req.method} ${req.path}' not found`,
        code: ErrorCodes.NOT_FOUND
    });
}

// ============================================
// ASYNC WRAPPER
// ============================================

function catchAsync(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    AppError,
    ErrorCodes,
    errorHandler,
    notFoundHandler,
    catchAsync
};