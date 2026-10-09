const { query, withTransaction } = require('../config/database');
const env = require('../config/env');
const logger = require('../utils/logger');

// GET /api/customer/payments
async function getCustomerPayments(req, res) {
  try {
    const userId = req.user.id;
    const customerId = req.user.customerId;

    const result = await query(
      `SELECT p.*, o.order_number, o.garment_type, o.total_amount, o.advance_required
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE p.customer_id = ? OR p.user_id = ?
       ORDER BY p.id DESC`,
      [customerId || -1, userId]
    );

    return res.json({
      success: true,
      payments: result.rows || [],
      upiConfig: {
        upiId: env.upiId,
        payeeName: env.upiPayeeName
      }
    });
  } catch (err) {
    logger.error('Error fetching customer payments:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
}

// POST /api/customer/orders/:id/payments or /api/payments/:id (Submit UPI Payment Reference)
async function submitPayment(req, res) {
  try {
    const orderId = Number(req.params.id || req.params.orderId);
    const userId = req.user.id;
    const customerId = req.user.customerId || 1;
    const { amount, transaction_reference, payment_method, payment_proof } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payment amount is required.' });
    }

    if (!transaction_reference || String(transaction_reference).trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Valid UPI Transaction Reference / UTR Number is required.' });
    }

    // Verify order exists and belongs to user
    const oRes = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!oRes.rows || oRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = oRes.rows[0];
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (order.user_id !== userId && order.customer_id !== customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized order payment.' });
      }
    }

    // Check duplicate reference
    const dupRes = await query(
      'SELECT id FROM payments WHERE transaction_reference = ? AND status != "REJECTED"',
      [String(transaction_reference).trim()]
    );
    if (dupRes.rows && dupRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This transaction reference has already been submitted. Please check your payment history or contact support.'
      });
    }

    const payRes = await query(
      `INSERT INTO payments (
        order_id, customer_id, user_id, amount, payment_method,
        transaction_reference, payment_proof, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        order.customer_id,
        userId,
        Number(amount),
        payment_method || 'UPI',
        String(transaction_reference).trim(),
        payment_proof || '',
        'SUBMITTED'
      ]
    );

    // Update order payment_status to SUBMITTED
    await query('UPDATE orders SET payment_status = ? WHERE id = ?', ['SUBMITTED', orderId]);

    // Create notification for customer
    await query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        'Payment Reference Submitted',
        `Payment of ₹${amount} with Ref #${String(transaction_reference).trim()} for Order #${order.order_number} is pending studio verification.`,
        'PAYMENT',
        `/customer/payments`
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'UPI payment reference submitted successfully! Our studio admin will verify it shortly.',
      paymentId: payRes.insertId
    });
  } catch (err) {
    logger.error('Error submitting payment:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit payment reference.' });
  }
}

// GET /api/admin/payments (Admin list all)
async function getAdminPayments(req, res) {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT p.*, o.order_number, o.garment_type, o.total_amount, o.advance_required, o.advance_paid, o.remaining_balance,
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (LOWER(p.transaction_reference) LIKE ? OR LOWER(o.order_number) LIKE ? OR LOWER(c.name) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY p.id DESC';

    const result = await query(sql, params);
    return res.json({ success: true, payments: result.rows || [] });
  } catch (err) {
    logger.error('Admin payments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment records.' });
  }
}

// POST /api/admin/payments/:id/verify
async function verifyPayment(req, res) {
  try {
    const paymentId = Number(req.params.id);
    const { review_notes } = req.body;

    const pRes = await query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!pRes.rows || pRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = pRes.rows[0];
    if (payment.status === 'VERIFIED') {
      return res.status(400).json({ success: false, message: 'This payment has already been verified.' });
    }

    // Load order
    const oRes = await query('SELECT * FROM orders WHERE id = ?', [payment.order_id]);
    if (!oRes.rows || oRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Associated order not found.' });
    }

    const order = oRes.rows[0];
    const newAdvancePaid = (Number(order.advance_paid) || 0) + Number(payment.amount);
    const newRemaining = Math.max(0, (Number(order.total_amount) || 0) - newAdvancePaid);
    const newPaymentStatus = newRemaining === 0 ? 'VERIFIED' : (newAdvancePaid >= Number(order.advance_required) ? 'VERIFIED' : 'SUBMITTED');
    const newOrderStatus = order.status === 'ORDER_PLACED' ? 'CONFIRMED' : order.status;

    // Update payment
    await query(
      `UPDATE payments SET
        status = ?,
        reviewed_by = ?,
        reviewer_name = ?,
        review_notes = ?
       WHERE id = ?`,
      ['VERIFIED', req.user.id, req.user.name, review_notes || 'Verified by Admin', paymentId]
    );

    // Update order
    await query(
      `UPDATE orders SET
        advance_paid = ?,
        remaining_balance = ?,
        payment_status = ?,
        status = ?
       WHERE id = ?`,
      [newAdvancePaid, newRemaining, newPaymentStatus, newOrderStatus, order.id]
    );

    // Record order status history if confirmed
    if (order.status === 'ORDER_PLACED') {
      await query(
        'INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
        [order.id, 'CONFIRMED', `Advance payment of ₹${payment.amount} verified (Ref: ${payment.transaction_reference}). Order confirmed for stitching.`, req.user.name]
      );
    }

    // Customer notification
    if (payment.user_id) {
      await query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          payment.user_id,
          'Payment Verified!',
          `Your advance payment of ₹${payment.amount} (Ref: ${payment.transaction_reference}) for Order #${order.order_number} has been verified!`,
          'PAYMENT',
          `/customer/orders/${order.id}`
        ]
      );
    }

    return res.json({
      success: true,
      message: `Payment of ₹${payment.amount} verified successfully. Order balance updated.`
    });
  } catch (err) {
    logger.error('Error verifying payment:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
}

// POST /api/admin/payments/:id/reject
async function rejectPayment(req, res) {
  try {
    const paymentId = Number(req.params.id);
    const { review_notes } = req.body;

    const pRes = await query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!pRes.rows || pRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = pRes.rows[0];
    if (payment.status === 'VERIFIED') {
      return res.status(400).json({ success: false, message: 'Cannot reject an already verified payment.' });
    }

    await query(
      `UPDATE payments SET
        status = ?,
        reviewed_by = ?,
        reviewer_name = ?,
        review_notes = ?
       WHERE id = ?`,
      ['REJECTED', req.user.id, req.user.name, review_notes || 'Rejected by Admin', paymentId]
    );

    // Notify customer
    if (payment.user_id) {
      await query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          payment.user_id,
          'Payment Reference Rejected',
          `Payment reference ${payment.transaction_reference} could not be verified. Note: ${review_notes || 'Please resubmit with valid transaction details.'}`,
          'PAYMENT',
          `/customer/payments`
        ]
      );
    }

    return res.json({ success: true, message: 'Payment reference marked as rejected.' });
  } catch (err) {
    logger.error('Error rejecting payment:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject payment.' });
  }
}

module.exports = {
  getCustomerPayments,
  submitPayment,
  getAdminPayments,
  verifyPayment,
  rejectPayment
};
