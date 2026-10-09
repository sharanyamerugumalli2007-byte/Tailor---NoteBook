const { query } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/customer/orders/:id/tracking or /api/tracking/:orderNumber
async function getOrderTracking(req, res) {
  try {
    const rawParam = req.params.id || req.params.orderNumber || req.query.orderNumber;
    if (!rawParam) {
      return res.status(400).json({ success: false, message: 'Order number or ID is required for tracking.' });
    }

    const param = String(rawParam).trim();
    const isNumericId = !isNaN(Number(param)) && !param.includes('-') && !param.startsWith('TN');

    let sql = 'SELECT * FROM orders WHERE id = ? OR order_number = ?';
    const params = [isNumericId ? Number(param) : -1, param];

    const oRes = await query(sql, params);
    if (!oRes.rows || oRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `No order found with reference '${param}'.` });
    }

    const order = oRes.rows[0];

    // Ownership check ONLY if requesting by numeric internal ID
    if (isNumericId && req.user && req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (order.user_id && order.user_id !== req.user.id && order.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Access denied to this order tracking profile.' });
      }
    }

    const historyRes = await query(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC, id ASC',
      [order.id]
    );

    const trackingRes = await query(
      'SELECT * FROM tracking_updates WHERE order_id = ? ORDER BY event_time ASC, id ASC',
      [order.id]
    );

    return res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        garment_type: order.garment_type,
        status: order.status,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        expected_delivery_date: order.expected_delivery_date,
        delivery_address: order.delivery_address,
        delivery_city: order.delivery_city,
        delivery_state: order.delivery_state,
        delivery_postal_code: order.delivery_postal_code,
        created_at: order.created_at
      },
      statusHistory: historyRes.rows || [],
      trackingEvents: trackingRes.rows || []
    });
  } catch (err) {
    logger.error('Error fetching order tracking:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tracking data.' });
  }
}

// POST /api/admin/orders/:id/tracking (Admin Add Tracking Event)
async function addTrackingEvent(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status, location, description, carrier } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required for tracking event.' });
    }

    const oRes = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!oRes.rows || oRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = oRes.rows[0];

    const result = await query(
      'INSERT INTO tracking_updates (order_id, status, location, description, carrier) VALUES (?, ?, ?, ?, ?)',
      [orderId, status || order.status, location || 'Central Studio', description, carrier || order.carrier || 'Direct Courier']
    );

    // If customer user exists, notify
    if (order.user_id) {
      await query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          order.user_id,
          `Tracking Update: Order #${order.order_number}`,
          `${description} (${location || 'Studio'})`,
          'SHIPPING',
          `/customer/orders/${orderId}`
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Tracking event recorded successfully.',
      eventId: result.insertId
    });
  } catch (err) {
    logger.error('Error adding tracking event:', err);
    return res.status(500).json({ success: false, message: 'Failed to add tracking event.' });
  }
}

module.exports = {
  getOrderTracking,
  addTrackingEvent
};
