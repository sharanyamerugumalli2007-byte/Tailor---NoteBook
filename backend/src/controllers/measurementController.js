const { query } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/measurements or /api/customer/measurements
async function getCustomerMeasurements(req, res) {
  try {
    const userId = req.user.id;
    const customerId = req.user.customerId;

    let sql = 'SELECT * FROM measurements WHERE customer_id = ? OR user_id = ? ORDER BY id DESC';
    const params = [customerId || -1, userId];

    // If admin is requesting for a specific customer
    if ((req.user.role === 'admin' || req.user.role === 'staff') && req.query.customerId) {
      sql = 'SELECT * FROM measurements WHERE customer_id = ? ORDER BY id DESC';
      params.splice(0, params.length, Number(req.query.customerId));
    }

    const result = await query(sql, params);
    return res.json({ success: true, measurements: result.rows || [] });
  } catch (err) {
    logger.error('Error fetching measurements:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch measurement profiles.' });
  }
}

// GET /api/measurements/:id
async function getMeasurementById(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await query('SELECT * FROM measurements WHERE id = ?', [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Measurement profile not found.' });
    }

    const item = result.rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (item.user_id !== req.user.id && item.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to measurement profile.' });
      }
    }

    return res.json({ success: true, measurement: item });
  } catch (err) {
    logger.error('Error fetching single measurement:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch measurement profile.' });
  }
}

// POST /api/measurements
async function createMeasurement(req, res) {
  try {
    const userId = req.user.id;
    let customerId = req.user.customerId;

    // Ensure customer record exists
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
      title,
      garment_type,
      unit,
      bust,
      waist,
      hip,
      shoulder,
      sleeve_length,
      armhole,
      shirt_length,
      pant_length,
      neck,
      inseam,
      outseam,
      thigh,
      knee,
      other_measurements,
      notes
    } = req.body;

    const num = (v) => (v !== undefined && v !== '' && !isNaN(Number(v)) ? Number(v) : null);

    const result = await query(
      `INSERT INTO measurements (
        customer_id, user_id, title, garment_type, unit,
        bust, waist, hip, shoulder, sleeve_length, armhole, shirt_length, pant_length,
        neck, inseam, outseam, thigh, knee, other_measurements, notes, is_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        customerId,
        userId,
        title || 'Custom Profile',
        garment_type || 'general',
        unit === 'cm' ? 'cm' : 'in',
        num(bust),
        num(waist),
        num(hip),
        num(shoulder),
        num(sleeve_length),
        num(armhole),
        num(shirt_length),
        num(pant_length),
        num(neck),
        num(inseam),
        num(outseam),
        num(thigh),
        num(knee),
        other_measurements || '',
        notes || ''
      ]
    );

    const newId = result.insertId || (result.rows && result.rows[0] ? result.rows[0].id : null);
    const created = await query('SELECT * FROM measurements WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Measurement profile saved successfully.',
      measurement: created.rows[0]
    });
  } catch (err) {
    logger.error('Error creating measurement:', err);
    return res.status(500).json({ success: false, message: 'Failed to create measurement profile.' });
  }
}

// PUT /api/measurements/:id
async function updateMeasurement(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await query('SELECT * FROM measurements WHERE id = ?', [id]);

    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Measurement profile not found.' });
    }

    const current = existing.rows[0];
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (current.user_id !== req.user.id && current.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this measurement profile.' });
      }
    }

    const {
      title,
      garment_type,
      unit,
      bust,
      waist,
      hip,
      shoulder,
      sleeve_length,
      armhole,
      shirt_length,
      pant_length,
      neck,
      inseam,
      outseam,
      thigh,
      knee,
      other_measurements,
      notes
    } = req.body;

    const num = (v, defaultVal) => (v !== undefined && v !== '' && !isNaN(Number(v)) ? Number(v) : (v === '' ? null : defaultVal));

    await query(
      `UPDATE measurements SET
        title = ?, garment_type = ?, unit = ?,
        bust = ?, waist = ?, hip = ?, shoulder = ?, sleeve_length = ?, armhole = ?, shirt_length = ?, pant_length = ?,
        neck = ?, inseam = ?, outseam = ?, thigh = ?, knee = ?, other_measurements = ?, notes = ?
      WHERE id = ?`,
      [
        title || current.title,
        garment_type || current.garment_type,
        unit || current.unit,
        num(bust, current.bust),
        num(waist, current.waist),
        num(hip, current.hip),
        num(shoulder, current.shoulder),
        num(sleeve_length, current.sleeve_length),
        num(armhole, current.armhole),
        num(shirt_length, current.shirt_length),
        num(pant_length, current.pant_length),
        num(neck, current.neck),
        num(inseam, current.inseam),
        num(outseam, current.outseam),
        num(thigh, current.thigh),
        num(knee, current.knee),
        other_measurements !== undefined ? other_measurements : current.other_measurements,
        notes !== undefined ? notes : current.notes,
        id
      ]
    );

    const updated = await query('SELECT * FROM measurements WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Measurement profile updated successfully.',
      measurement: updated.rows[0]
    });
  } catch (err) {
    logger.error('Error updating measurement profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update measurement profile.' });
  }
}

// DELETE /api/measurements/:id
async function deleteMeasurement(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await query('SELECT * FROM measurements WHERE id = ?', [id]);

    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Measurement profile not found.' });
    }

    const current = existing.rows[0];
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      if (current.user_id !== req.user.id && current.customer_id !== req.user.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this measurement profile.' });
      }
    }

    await query('DELETE FROM measurements WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Measurement profile deleted successfully.' });
  } catch (err) {
    logger.error('Error deleting measurement profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete measurement profile.' });
  }
}

module.exports = {
  getCustomerMeasurements,
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
};
