const { query, withTransaction } = require('../config/database');
const env = require('../config/env');
const logger = require('../utils/logger');

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `TN-${timestamp}-${random}`;
}

// GET /api/customer/orders or /api/orders
async function getCustomerOrders(req, res) {
  try {
    const userId = req.user.id;
    const customerId = req.user.customerId;
    const { status, search } = req.query;

    let sql = 'SELECT * FROM orders WHERE (customer_id = ? OR user_id = ?)';
    const params = [customerId || -1, userId];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (LOWER(order_number) LIKE ? OR LOWER(garment_type) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY id DESC';

    const result = await query(sql, params);
    return res.json({ success: true, orders: result.rows || [] });
  } catch (err) {
    logger.error('Error fetching customer orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
  }
}

// GET /api/orders/:id
async function getOrderById(req, res) {
  try {
    const id = req.params.id;
    let sql = 'SELECT * FROM orders WHERE id = ? OR order_number = ?';
    const params = [!isNaN(Number(id)) ? Number(id) : -1, String(id)];

    const result = await query(sql, params);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = result.rows[0];

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (order.user_id !== req.user.id && order.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Access denied to this order.' });
      }
    }

    // Get order history
    const historyRes = await query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC, id ASC', [order.id]);
    
    // Get tracking updates
    const trackingRes = await query('SELECT * FROM tracking_updates WHERE order_id = ? ORDER BY event_time ASC, id ASC', [order.id]);

    // Get payment records
    const paymentRes = await query('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC', [order.id]);

    return res.json({
      success: true,
      order: {
        ...order,
        history: historyRes.rows || [],
        trackingUpdates: trackingRes.rows || [],
        payments: paymentRes.rows || []
      }
    });
  } catch (err) {
    logger.error('Error fetching order details:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
}

// POST /api/customer/orders (Create New Order)
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    let customerId = req.user.customerId;

    // Ensure customer record
    if (!customerId) {
      const cRes = await query('SELECT id FROM customers WHERE user_id = ? OR email = ?', [userId, req.user.email]);
      if (cRes.rows && cRes.rows.length > 0) {
        customerId = cRes.rows[0].id;
      } else {
        const ins = await query(
          'INSERT INTO customers (user_id, name, phone, email) VALUES (?, ?, ?, ?)',
          [userId, req.user.name, req.user.phone || '', req.user.email]
        );
        customerId = ins.insertId || 1;
      }
    }

    const {
      service_id,
      garment_type,
      quantity,
      fabric_source,
      fabric_type,
      color,
      sleeve_style,
      neck_design,
      length_spec,
      fit_preference,
      customization_notes,
      reference_image,
      measurement_id,
      custom_measurements,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_postal_code,
      preferred_delivery_date,
      delivery_notes
    } = req.body;

    if (!garment_type) {
      return res.status(400).json({ success: false, message: 'Garment type is required.' });
    }

    // Determine service price
    let basePrice = 500.00;
    if (service_id) {
      const srvRes = await query('SELECT * FROM services WHERE id = ?', [Number(service_id)]);
      if (srvRes.rows && srvRes.rows.length > 0) {
        basePrice = Number(srvRes.rows[0].base_price) || 500.00;
      }
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const customizationFee = fabric_source === 'tailor_provided' ? 300.00 : 0.00;
    const deliveryFee = env.defaultDeliveryFee || 50.00;
    const totalAmount = (basePrice * qty) + customizationFee + deliveryFee;
    const advancePercentage = (env.advancePercentage || 30) / 100;
    const advanceRequired = Math.round(totalAmount * advancePercentage);
    const remainingBalance = totalAmount;

    // Snapshot measurements
    let measurementSnapshot = null;
    if (measurement_id) {
      const mRes = await query('SELECT * FROM measurements WHERE id = ?', [Number(measurement_id)]);
      if (mRes.rows && mRes.rows.length > 0) {
        measurementSnapshot = JSON.stringify(mRes.rows[0]);
      }
    } else if (custom_measurements) {
      measurementSnapshot = JSON.stringify(custom_measurements);
    }

    const orderNumber = generateOrderNumber();

    const result = await query(
      `INSERT INTO orders (
        order_number, customer_id, user_id, service_id, measurement_id, garment_type,
        fabric_source, fabric_type, color, sleeve_style, neck_design, length_spec, fit_preference,
        customization_notes, reference_image, measurement_snapshot, quantity,
        unit_price, customization_price, delivery_fee, discount, total_amount,
        advance_required, advance_paid, remaining_balance, payment_status, status,
        delivery_address, delivery_city, delivery_state, delivery_postal_code,
        preferred_delivery_date, delivery_notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )`,
      [
        orderNumber,
        customerId,
        userId,
        service_id ? Number(service_id) : null,
        measurement_id ? Number(measurement_id) : null,
        garment_type,
        fabric_source || 'customer_provided',
        fabric_type || '',
        color || '',
        sleeve_style || '',
        neck_design || '',
        length_spec || '',
        fit_preference || 'Custom Fit',
        customization_notes || '',
        reference_image || '',
        measurementSnapshot,
        qty,
        basePrice,
        customizationFee,
        deliveryFee,
        0.00,
        totalAmount,
        advanceRequired,
        0.00,
        remainingBalance,
        'PENDING',
        'ORDER_PLACED',
        delivery_address || '',
        delivery_city || '',
        delivery_state || '',
        delivery_postal_code || '',
        preferred_delivery_date || null,
        delivery_notes || ''
      ]
    );

    const orderId = result.insertId || (result.rows && result.rows[0] ? result.rows[0].id : null);

    // Add status history
    await query(
      'INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
      [orderId, 'ORDER_PLACED', 'Order submitted by customer. Awaiting studio review.', req.user.name]
    );

    // Create notification for customer
    await query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        'Order Placed Successfully!',
        `Your order #${orderNumber} for ${garment_type} has been received. Please pay the advance of ₹${advanceRequired} to initiate stitching.`,
        'ORDER',
        `/customer/orders/${orderId}`
      ]
    );

    const created = await query('SELECT * FROM orders WHERE id = ?', [orderId]);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully! Please complete the advance payment.',
      order: created.rows[0]
    });
  } catch (err) {
    logger.error('Error creating order:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
}

// POST /api/customer/orders/:id/cancel
async function cancelOrder(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await query('SELECT * FROM orders WHERE id = ?', [id]);

    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = existing.rows[0];

    // Ownership check
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (order.user_id !== req.user.id && order.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
      }
    }

    // Validation: Only cancel if in initial stages
    if (!['ORDER_PLACED', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in status '${order.status}'. Garment stitching is already in progress.`
      });
    }

    await query('UPDATE orders SET status = ? WHERE id = ?', ['CANCELLED', id]);

    await query(
      'INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
      [id, 'CANCELLED', req.body.reason || 'Order cancelled by customer', req.user.name]
    );

    return res.json({ success: true, message: 'Order has been cancelled.' });
  } catch (err) {
    logger.error('Error cancelling order:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
}

// GET /api/admin/orders (Admin list all)
async function getAdminOrders(req, res) {
  try {
    const { status, search, payment_status } = req.query;
    let sql = `
      SELECT o.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (payment_status && payment_status !== 'ALL') {
      sql += ' AND o.payment_status = ?';
      params.push(payment_status);
    }

    if (search) {
      sql += ' AND (LOWER(o.order_number) LIKE ? OR LOWER(o.garment_type) LIKE ? OR LOWER(c.name) LIKE ? OR c.phone LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search}%`);
    }

    sql += ' ORDER BY o.id DESC';

    const result = await query(sql, params);
    return res.json({ success: true, orders: result.rows || [] });
  } catch (err) {
    logger.error('Admin orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin orders.' });
  }
}

// PATCH /api/admin/orders/:id/status (Admin update status)
async function updateOrderStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status, notes, tracking_number, carrier, expected_delivery_date } = req.body;

    const validStatuses = [
      'ORDER_PLACED',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CORRECTION_REQUIRED',
      'CANCELLED',
      'REJECTED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const oRes = await query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!oRes.rows || oRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = oRes.rows[0];

    // Update order
    let updateSql = 'UPDATE orders SET status = ?';
    const params = [status];

    if (tracking_number !== undefined) {
      updateSql += ', tracking_number = ?';
      params.push(tracking_number);
    }
    if (carrier !== undefined) {
      updateSql += ', carrier = ?';
      params.push(carrier);
    }
    if (expected_delivery_date !== undefined) {
      updateSql += ', expected_delivery_date = ?';
      params.push(expected_delivery_date || null);
    }
    if (notes !== undefined) {
      updateSql += ', admin_notes = ?';
      params.push(notes);
    }

    updateSql += ' WHERE id = ?';
    params.push(id);

    await query(updateSql, params);

    // Record history
    await query(
      'INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
      [id, status, notes || `Status updated to ${status.replace(/_/g, ' ')}`, req.user.name || 'Admin']
    );

    // Add tracking event if shipped/out for delivery/delivered
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      await query(
        'INSERT INTO tracking_updates (order_id, status, location, description, carrier) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          status,
          'Studio Central Dispatch',
          notes || `Order status updated to ${status.replace(/_/g, ' ')}`,
          carrier || order.carrier || 'Express Delivery'
        ]
      );
    }

    // Send customer notification
    if (order.user_id) {
      const statusLabels = {
        CONFIRMED: 'Order Confirmed! Our master tailor is prepping your materials.',
        PROCESSING: 'Cutting & Stitching in Progress! Your garment is on the work table.',
        SHIPPED: `Your order has been shipped via ${carrier || 'Express Courier'} (Tracking: ${tracking_number || 'TN-TRACK'}).`,
        OUT_FOR_DELIVERY: 'Out for Delivery! Your tailored garment will arrive today.',
        DELIVERED: 'Delivered! We hope you love the fit. Thank you for choosing Tailor Notebook!',
        CANCELLED: 'Your order was cancelled.',
        CORRECTION_REQUIRED: 'Action needed on your order measurements or customization details.'
      };

      await query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          order.user_id,
          `Order #${order.order_number} Update: ${status.replace(/_/g, ' ')}`,
          statusLabels[status] || `Your order status has changed to ${status.replace(/_/g, ' ')}.`,
          'ORDER',
          `/customer/orders/${id}`
        ]
      );
    }

    const updated = await query('SELECT * FROM orders WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: `Order status updated to ${status.replace(/_/g, ' ')}.`,
      order: updated.rows[0]
    });
  } catch (err) {
    logger.error('Error updating order status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

module.exports = {
  getCustomerOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAdminOrders,
  updateOrderStatus
};
