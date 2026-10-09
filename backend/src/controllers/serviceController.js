const { query } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/services
async function getAllServices(req, res) {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM services WHERE is_active = 1';
    const params = [];

    // Allow admin to see all
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff') && req.query.includeInactive === 'true') {
      sql = 'SELECT * FROM services WHERE 1=1';
    }

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(short_description) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);
    return res.json({ success: true, services: result.rows || [] });
  } catch (err) {
    logger.error('Error fetching services:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
}

// GET /api/services/:id
async function getServiceById(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await query('SELECT * FROM services WHERE id = ?', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.json({ success: true, service: result.rows[0] });
  } catch (err) {
    logger.error('Error fetching service:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch service details.' });
  }
}

// POST /api/services (Admin)
async function createService(req, res) {
  try {
    const { name, category, short_description, description, base_price, estimated_days, image_url } = req.body;

    if (!name || base_price === undefined) {
      return res.status(400).json({ success: false, message: 'Service name and base price are required.' });
    }

    const priceNum = Number(base_price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive base price is required.' });
    }

    const result = await query(
      'INSERT INTO services (name, category, short_description, description, base_price, estimated_days, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [name, category || 'stitching', short_description || '', description || '', priceNum, Number(estimated_days) || 5, image_url || '']
    );

    const newId = result.insertId || (result.rows && result.rows[0] ? result.rows[0].id : null);
    const created = await query('SELECT * FROM services WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      service: created.rows[0]
    });
  } catch (err) {
    logger.error('Error creating service:', err);
    return res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
}

// PUT /api/services/:id (Admin)
async function updateService(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, category, short_description, description, base_price, estimated_days, image_url, is_active } = req.body;

    const existing = await query('SELECT * FROM services WHERE id = ?', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    await query(
      'UPDATE services SET name = ?, category = ?, short_description = ?, description = ?, base_price = ?, estimated_days = ?, image_url = ?, is_active = ? WHERE id = ?',
      [
        name || existing.rows[0].name,
        category || existing.rows[0].category,
        short_description !== undefined ? short_description : existing.rows[0].short_description,
        description !== undefined ? description : existing.rows[0].description,
        base_price !== undefined ? Number(base_price) : existing.rows[0].base_price,
        estimated_days !== undefined ? Number(estimated_days) : existing.rows[0].estimated_days,
        image_url !== undefined ? image_url : existing.rows[0].image_url,
        is_active !== undefined ? Number(is_active) : existing.rows[0].is_active,
        id
      ]
    );

    const updated = await query('SELECT * FROM services WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Service updated successfully.',
      service: updated.rows[0]
    });
  } catch (err) {
    logger.error('Error updating service:', err);
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
}

// DELETE /api/services/:id (Admin)
async function deleteService(req, res) {
  try {
    const id = Number(req.params.id);
    await query('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Service deactivated successfully.' });
  } catch (err) {
    logger.error('Error deleting service:', err);
    return res.status(500).json({ success: false, message: 'Failed to deactivate service.' });
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
