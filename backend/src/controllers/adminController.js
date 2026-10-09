const { query } = require('../config/database');
const env = require('../config/env');
const logger = require('../utils/logger');

// GET /api/admin/dashboard
async function getAdminDashboard(req, res) {
  try {
    // 1. Total Customers
    const custRes = await query('SELECT COUNT(*) as count FROM customers WHERE deleted_at IS NULL');
    const totalCustomers = (custRes.rows && custRes.rows[0] ? custRes.rows[0].count : 0) || 0;

    // 2. Orders Stats
    const ordersRes = await query('SELECT * FROM orders ORDER BY id DESC');
    const allOrders = ordersRes.rows || [];
    const totalOrders = allOrders.length;
    const newOrders = allOrders.filter(o => o.status === 'ORDER_PLACED').length;
    const confirmedOrders = allOrders.filter(o => o.status === 'CONFIRMED').length;
    const inProgressOrders = allOrders.filter(o => ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
    const shippedOrders = allOrders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED').length;

    // 3. Payment Stats
    const paymentsRes = await query('SELECT * FROM payments ORDER BY id DESC');
    const allPayments = paymentsRes.rows || [];
    const pendingPayments = allPayments.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING');
    const verifiedPayments = allPayments.filter(p => p.status === 'VERIFIED');
    const verifiedRevenue = verifiedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 4. Recent Data
    const recentOrders = allOrders.slice(0, 6);
    const recentPayments = allPayments.slice(0, 6);

    const recentCustRes = await query('SELECT * FROM customers ORDER BY id DESC LIMIT 5');
    const recentCustomers = recentCustRes.rows || [];

    return res.json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        newOrders,
        confirmedOrders,
        inProgressOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        pendingPaymentCount: pendingPayments.length,
        verifiedRevenue
      },
      recentOrders,
      recentPayments,
      recentCustomers
    });
  } catch (err) {
    logger.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin statistics.' });
  }
}

// GET /api/admin/settings
async function getSettings(req, res) {
  try {
    const result = await query('SELECT * FROM settings');
    const settingsMap = {};
    (result.rows || []).forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    // Provide env fallbacks
    const responseSettings = {
      shop_name: settingsMap.shop_name || env.shopName,
      upi_id: settingsMap.upi_id || env.upiId,
      upi_payee_name: settingsMap.upi_payee_name || env.upiPayeeName,
      advance_percentage: settingsMap.advance_percentage || String(env.advancePercentage),
      default_delivery_fee: settingsMap.default_delivery_fee || String(env.defaultDeliveryFee),
      contact_phone: settingsMap.contact_phone || '+91 98765 43210',
      contact_email: settingsMap.contact_email || 'support@tailornotebook.com',
      studio_address: settingsMap.studio_address || 'Shop 12, Blossom Lane, Fashion District, Bengaluru 560001'
    };

    return res.json({ success: true, settings: responseSettings });
  } catch (err) {
    logger.error('Error fetching settings:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch studio settings.' });
  }
}

// PUT /api/admin/settings
async function updateSettings(req, res) {
  try {
    const settingsObj = req.body;

    for (const [key, value] of Object.entries(settingsObj)) {
      const existing = await query('SELECT id FROM settings WHERE setting_key = ?', [key]);
      if (existing.rows && existing.rows.length > 0) {
        await query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [String(value), key]);
      } else {
        await query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, String(value)]);
      }
    }

    return res.json({ success: true, message: 'Studio settings updated successfully.' });
  } catch (err) {
    logger.error('Error updating settings:', err);
    return res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
}

module.exports = {
  getAdminDashboard,
  getSettings,
  updateSettings
};
