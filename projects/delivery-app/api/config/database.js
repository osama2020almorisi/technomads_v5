// ============================================
// TechNomads Delivery System - Database Config
// ============================================

// This is a mock database configuration for development
// In production, use PostgreSQL or MongoDB

const DB_CONFIG = {
    // PostgreSQL configuration
    postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'technomads',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        dialect: 'postgres',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },

    // MongoDB configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/technomads',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10
        }
    },

    // Redis configuration (for caching)
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || null,
        db: parseInt(process.env.REDIS_DB || '0')
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'technomads-super-secret-key-2024',
        expiresIn: process.env.JWT_EXPIRES || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '30d'
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },

    // Email Configuration
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        username: process.env.SMTP_USER || 'noreply@technomads.ye',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'TechNomads <noreply@technomads.ye>'
    },

    // SMS Configuration
    sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        from: process.env.SMS_FROM || '+967770200970'
    },

    // Payment Configuration
    payment: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY || '',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
        },
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || '',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
            mode: process.env.PAYPAL_MODE || 'sandbox'
        }
    },

    // File Upload Configuration
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        uploadDir: process.env.UPLOAD_DIR || './uploads'
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
    },

    // Cors Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
};

// ============================================
// ENVIRONMENT VARIABLES HELPER
// ============================================
function getConfig() {
    const env = process.env.NODE_ENV || 'development';

    return {
        env,
        isDevelopment: env === 'development',
        isProduction: env === 'production',
        isTest: env === 'test',
        ...DB_CONFIG
    };
}

// ============================================
// MOCK DATABASE CONNECTION
// ============================================
class MockDatabase {
    constructor() {
        this.connected = false;
        this.collections = {
            orders: [],
            drivers: [],
            customers: [],
            zones: [],
            users: [],
            notifications: [],
            settings: {}
        };
    }

    async connect() {
        console.log('[DB] Connecting to database...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = true;
                console.log('[DB] Connected successfully');
                resolve(true);
            }, 500);
        });
    }

    async disconnect() {
        this.connected = false;
        console.log('[DB] Disconnected');
        return true;
    }

    getCollection(name) {
        if (!this.collections[name]) {
            this.collections[name] = [];
        }
        return this.collections[name];
    }

    // Query helpers
    async find(collection, filter = {}) {
        const data = this.getCollection(collection);
        return data.filter(item => {
            for (const [key, value] of Object.entries(filter)) {
                if (item[key] !== value) return false;
            }
            return true;
        });
    }

    async findOne(collection, filter = {}) {
        const results = await this.find(collection, filter);
        return results[0] || null;
    }

    async findById(collection, id) {
        const data = this.getCollection(collection);
        return data.find(item => item.id === id) || null;
    }

    async insert(collection, document) {
        const data = this.getCollection(collection);
        const newDoc = {
            ...document,
            id: document.id || this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newDoc);
        return newDoc;
    }

    async update(collection, filter, update) {
        const data = this.getCollection(collection);
        const index = data.findIndex(item => {
            for (const [key, value] of Object.entries(filter)) {
                if (item[key] !== value) return false;
            }
            return true;
        });

        if (index === -1) return null;

        const updated = {
            ...data[index],
            ...update,
            updatedAt: new Date().toISOString()
        };
        data[index] = updated;
        return updated;
    }

    async updateById(collection, id, update) {
        return this.update(collection, { id }, update);
    }

    async delete(collection, filter) {
        const data = this.getCollection(collection);
        const filtered = data.filter(item => {
            for (const [key, value] of Object.entries(filter)) {
                if (item[key] === value) return false;
            }
            return true;
        });
        this.collections[collection] = filtered;
        return true;
    }

    async deleteById(collection, id) {
        const data = this.getCollection(collection);
        this.collections[collection] = data.filter(item => item.id !== id);
        return true;
    }

    generateId() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}

// Export
module.exports = {
    DB_CONFIG,
    getConfig,
    MockDatabase,
    db: new MockDatabase()
};