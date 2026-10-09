const { query } = require('../config/database');
const logger = require('../utils/logger');

// POST /api/contact
async function submitContactMessage(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    await query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, "NEW")',
      [name, email, phone || '', subject || 'General Inquiry', message]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our boutique team has received your message and will get back to you shortly.'
    });
  } catch (err) {
    logger.error('Error submitting contact message:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
}

// GET /api/admin/contact-messages (Admin only)
async function getContactMessages(req, res) {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY id DESC');
    return res.json({ success: true, messages: result.rows || [] });
  } catch (err) {
    logger.error('Error fetching contact messages:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
}

module.exports = {
  submitContactMessage,
  getContactMessages
};
