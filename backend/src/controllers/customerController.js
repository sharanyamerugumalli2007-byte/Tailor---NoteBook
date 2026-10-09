const { query } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/customer/dashboard
async function getCustomerDashboard(req, res) {
  try {
    const userId = req.user.id;
    const customerId = req.user.customerId;

    // Fetch customer profile
    let customerProfile = req.user.customerProfile;
    if (!customerProfile && customerId) {
      const cRes = await query('SELECT * FROM customers WHERE id = ?', [customerId]);
      customerProfile = cRes.rows ? cRes.rows[0] : null;
    }

    // Fetch customer orders
    let orders = [];
    if (customerId) {
      const oRes = await query(
        'SELECT * FROM orders WHERE customer_id = ? OR user_id = ? ORDER BY id DESC',
        [customerId, userId]
      );
      orders = oRes.rows || [];
    } else {
      const oRes = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
      orders = oRes.rows || [];
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'ORDER_PLACED' || o.status === 'CONFIRMED').length;
    const inProgressOrders = orders.filter(o => ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

    // Pending advance payments (orders where advance_paid < advance_required and payment_status != 'VERIFIED')
    const pendingAdvanceOrders = orders.filter(o => {
      const advReq = Number(o.advance_required) || 0;
      const advPaid = Number(o.advance_paid) || 0;
      return advReq > advPaid && o.payment_status !== 'VERIFIED';
    });

    // Recent notifications
    const nRes = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 5',
      [userId]
    );
    const recentNotifications = nRes.rows || [];

    return res.json({
      success: true,
      profile: customerProfile || { name: req.user.name, email: req.user.email, phone: req.user.phone },
      metrics: {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        pendingAdvanceCount: pendingAdvanceOrders.length,
        totalSpent: orders.reduce((sum, o) => sum + (Number(o.advance_paid) || 0), 0)
      },
      recentOrders: orders.slice(0, 5),
      recentNotifications
    });
  } catch (err) {
    logger.error('Customer dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer dashboard data.' });
  }
}

// GET /api/customer/profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const uRes = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);
    const cRes = await query('SELECT * FROM customers WHERE user_id = ? OR email = ?', [userId, req.user.email]);

    return res.json({
      success: true,
      user: uRes.rows[0] || req.user,
      customer: cRes.rows[0] || null
    });
  } catch (err) {
    logger.error('Error fetching customer profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
}

// PUT /api/customer/profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, state, postal_code, gender, notes } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

    await query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || '', userId]);

    const existing = await query('SELECT * FROM customers WHERE user_id = ? OR email = ?', [userId, req.user.email]);
    if (existing.rows && existing.rows.length > 0) {
      await query(
        'UPDATE customers SET name = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, gender = ?, notes = ? WHERE id = ?',
        [name, phone || '', address || '', city || '', state || '', postal_code || '', gender || 'female', notes || '', existing.rows[0].id]
      );
    } else {
      await query(
        'INSERT INTO customers (user_id, name, phone, email, address, city, state, postal_code, gender, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, phone || '', req.user.email, address || '', city || '', state || '', postal_code || '', gender || 'female', notes || '']
      );
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    logger.error('Error updating customer profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

// GET /api/admin/customers (Admin only)
async function getAdminCustomers(req, res) {
  try {
    const { search } = req.query;
    let sql = 'SELECT c.*, u.role, u.created_at as user_created_at FROM customers c LEFT JOIN users u ON c.user_id = u.id WHERE c.deleted_at IS NULL';
    const params = [];

    if (search) {
      sql += ' AND (LOWER(c.name) LIKE ? OR c.phone LIKE ? OR LOWER(c.email) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY c.id DESC';

    const result = await query(sql, params);
    const customers = result.rows || [];

    // Attach order counts
    for (const cust of customers) {
      const oCount = await query('SELECT COUNT(*) as count FROM orders WHERE customer_id = ?', [cust.id]);
      cust.orderCount = (oCount.rows && oCount.rows[0] ? oCount.rows[0].count : 0) || 0;
    }

    return res.json({ success: true, customers });
  } catch (err) {
    logger.error('Admin customers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer list.' });
  }
}

// GET /api/admin/customers/:id (Admin only)
async function getAdminCustomerById(req, res) {
  try {
    const id = Number(req.params.id);
    const cRes = await query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!cRes.rows || cRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = cRes.rows[0];
    const ordersRes = await query('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC', [id]);
    const measurementsRes = await query('SELECT * FROM measurements WHERE customer_id = ? ORDER BY id DESC', [id]);

    return res.json({
      success: true,
      customer,
      orders: ordersRes.rows || [],
      measurements: measurementsRes.rows || []
    });
  } catch (err) {
    logger.error('Admin customer details error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer details.' });
  }
}

module.exports = {
  getCustomerDashboard,
  getProfile,
  updateProfile,
  getAdminCustomers,
  getAdminCustomerById
};
