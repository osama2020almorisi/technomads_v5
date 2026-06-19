// ============================================
// TechNomads Delivery System - Endpoints Index
// ============================================

const orders = require('./orders');
const drivers = require('./drivers');
const customers = require('./customers');
const zones = require('./zones');
const auth = require('./auth');
const notifications = require('./notifications');
const settings = require('./settings');
const reports = require('./reports');

module.exports = {
    orders,
    drivers,
    customers,
    zones,
    auth,
    notifications,
    settings,
    reports
};