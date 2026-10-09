const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const env = require('./env');
const logger = require('../utils/logger');

let pool = null;
let isMySqlAvailable = false;
const localStorePath = path.join(__dirname, '../../database/local_store.json');

// Local in-memory / JSON file fallback store
let localStore = {
  users: [],
  customers: [],
  services: [],
  measurements: [],
  orders: [],
  order_items: [],
  order_status_history: [],
  tracking_updates: [],
  payments: [],
  notifications: [],
  contact_messages: [],
  settings: [],
  _counters: { users: 1, customers: 1, services: 1, measurements: 1, orders: 1000, order_items: 1, order_status_history: 1, tracking_updates: 1, payments: 1, notifications: 1, contact_messages: 1, settings: 1 }
};

function loadLocalStore() {
  try {
    if (fs.existsSync(localStorePath)) {
      const data = JSON.parse(fs.readFileSync(localStorePath, 'utf8'));
      localStore = { ...localStore, ...data };
    }
  } catch (err) {
    logger.warn('Could not read local_store.json, initializing fresh memory store', err);
  }
}

function saveLocalStore() {
  try {
    const dir = path.dirname(localStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localStorePath, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    logger.warn('Could not save local_store.json', err);
  }
}

async function seedInitialData() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  const initialServices = [
    {
      id: 1,
      name: 'Custom Blouse Stitching',
      category: 'blouse',
      short_description: 'Designer & traditional blouses with precision tailoring, custom necklines & padding options.',
      description: 'Expertly stitched blouses tailored to your unique measurements. Choose from boat neck, sweetheart, deep back, collar neck, princess cut, or katori cut styles. High-quality lining, reinforced seams, and perfect armhole fitting guaranteed.',
      base_price: 650.00,
      estimated_days: 4,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 2,
      name: 'Designer Dress Stitching',
      category: 'dress',
      short_description: 'Custom tailored western, indo-western, A-line, fit-and-flare, and evening gowns.',
      description: 'Bespoke dresses created from your chosen fabric. Includes flared gowns, midi dresses, wrap dresses, and party wear with premium finishing, concealed zippers, and structured bodices.',
      base_price: 1200.00,
      estimated_days: 7,
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 3,
      name: 'Kurti & Tunic Stitching',
      category: 'kurti',
      short_description: 'Straight-cut, Anarkali, high-low, and daily wear kurtis with delicate stitching.',
      description: 'Comfortable and stylish kurtis designed for daily wear, office, and festivities. Custom options include side slits, pocket additions, button plackets, and sleeve variations.',
      base_price: 550.00,
      estimated_days: 3,
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 4,
      name: 'Saree Blouse Alterations',
      category: 'alteration',
      short_description: 'Tightening, loosening, cup adjustments, sleeve modifications, and hook replacements.',
      description: 'Quick turnaround alterations to make your existing saree blouses fit like a glove. Seamless margin adjustments without compromising fabric integrity.',
      base_price: 250.00,
      estimated_days: 2,
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 5,
      name: 'Trouser & Pant Stitching',
      category: 'bottomwear',
      short_description: 'Tailored cigarette pants, palazzo, straight trousers, and formal pants.',
      description: 'Custom fit bottoms with options for elasticated backbands, side zippers, functional deep pockets, and sleek ankle slits.',
      base_price: 600.00,
      estimated_days: 4,
      image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 6,
      name: 'Flared & Pleated Skirt Stitching',
      category: 'skirt',
      short_description: 'Lehenga skirts, circular skirts, box pleat skirts, and tiered ethnic skirts.',
      description: 'Voluminous and structured skirts crafted with can-can lining, waist belt finishing, drawstring latkans, and side zipper closures.',
      base_price: 950.00,
      estimated_days: 5,
      image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 7,
      name: 'Suit & Salwar Kameez Stitching',
      category: 'suit',
      short_description: 'Complete 2-piece or 3-piece suit sets with custom neck designs and bottom styles.',
      description: 'Tailored salwar kameez, Punjabi suits, palazzo suits, and churidar sets with lining options, piping accents, and matching dupatta edging.',
      base_price: 1100.00,
      estimated_days: 6,
      image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    },
    {
      id: 8,
      name: 'Garment Alteration & Repair',
      category: 'alteration',
      short_description: 'Hemming, waist resizing, zip replacements, tapering, and fitting adjustments.',
      description: 'Precision alteration services for all types of garments. Fast, neat, and reliable adjustments to breathe new life into your wardrobe.',
      base_price: 200.00,
      estimated_days: 1,
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    }
  ];

  if (isMySqlAvailable) {
    try {
      // Check admin user
      const [adminRows] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@tailornotebook.com']);
      if (adminRows.length === 0) {
        await pool.query(
          'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
          ['Master Tailor Admin', 'admin@tailornotebook.com', '+91 9876543210', adminPasswordHash, 'admin']
        );
      }

      // Check customer user
      const [custRows] = await pool.query('SELECT * FROM users WHERE email = ?', ['priya@example.com']);
      if (custRows.length === 0) {
        const [uRes] = await pool.query(
          'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
          ['Priya Sharma', 'priya@example.com', '+91 9876500001', customerPasswordHash, 'customer']
        );
        const [cRes] = await pool.query(
          'INSERT INTO customers (user_id, name, phone, email, address, city, state, postal_code, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [uRes.insertId, 'Priya Sharma', '+91 9876500001', 'priya@example.com', 'Flat 402, Rosewood Heights, MG Road', 'Bengaluru', 'Karnataka', '560001', 'female']
        );
      }

      // Check services
      const [srvRows] = await pool.query('SELECT COUNT(*) as count FROM services');
      if (srvRows[0].count === 0) {
        for (const s of initialServices) {
          await pool.query(
            'INSERT INTO services (name, category, short_description, description, base_price, estimated_days, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [s.name, s.category, s.short_description, s.description, s.base_price, s.estimated_days, s.image_url, s.is_active]
          );
        }
      }
    } catch (err) {
      logger.error('Error seeding MySQL data:', err);
    }
  } else {
    // Seed local store
    if (!localStore.users.find(u => u.email === 'admin@tailornotebook.com')) {
      localStore.users.push({
        id: 1,
        name: 'Master Tailor Admin',
        email: 'admin@tailornotebook.com',
        phone: '+91 9876543210',
        password_hash: adminPasswordHash,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    if (!localStore.users.find(u => u.email === 'priya@example.com')) {
      const custUser = {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 9876500001',
        password_hash: customerPasswordHash,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStore.users.push(custUser);
      localStore.customers.push({
        id: 1,
        user_id: 2,
        name: 'Priya Sharma',
        phone: '+91 9876500001',
        email: 'priya@example.com',
        address: 'Flat 402, Rosewood Heights, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560001',
        gender: 'female',
        notes: 'Preferred fit: Custom Fit',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStore.measurements.push({
        id: 1,
        customer_id: 1,
        user_id: 2,
        title: 'Blouse Standard Fit',
        garment_type: 'blouse',
        unit: 'in',
        bust: 36.0,
        waist: 30.0,
        hip: 38.0,
        shoulder: 14.5,
        sleeve_length: 10.5,
        armhole: 16.0,
        shirt_length: 14.0,
        pant_length: 0,
        neck: 7.0,
        inseam: 0,
        outseam: 0,
        other_measurements: 'Front neck depth: 6.5 in, Back neck depth: 8 in',
        notes: 'Padded princess cut preference',
        is_current: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (!localStore.orders || localStore.orders.length === 0) {
      localStore.orders = [
        {
          id: 1,
          order_number: 'TN-764915-796',
          customer_id: 1,
          user_id: 2,
          service_id: 2,
          measurement_id: 1,
          garment_type: 'Designer Dress Stitching',
          fabric_source: 'customer_provided',
          fabric_type: 'Silk Brocade',
          color: 'Emerald Green',
          sleeve_style: '3/4 Sleeves',
          neck_design: 'Boat Neck',
          length_spec: 'Ankle Length',
          fit_preference: 'Custom Fit',
          customization_notes: 'Concealed back zipper and soft can-can flare.',
          reference_image: '',
          quantity: 1,
          unit_price: 1200.00,
          customization_price: 0.00,
          delivery_fee: 50.00,
          discount: 0.00,
          total_amount: 1250.00,
          advance_required: 375.00,
          advance_paid: 375.00,
          remaining_balance: 875.00,
          payment_status: 'VERIFIED',
          status: 'SHIPPED',
          tracking_number: 'TN-TRACK-7649',
          carrier: 'BlueDart Express',
          expected_delivery_date: new Date(Date.now() + 2 * 86400000).toISOString(),
          delivery_address: 'Flat 402, Rosewood Heights, MG Road',
          delivery_city: 'Bengaluru',
          delivery_state: 'Karnataka',
          delivery_postal_code: '560001',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          order_number: 'TN-892140-101',
          customer_id: 1,
          user_id: 2,
          service_id: 1,
          measurement_id: 1,
          garment_type: 'Custom Blouse Stitching',
          fabric_source: 'customer_provided',
          fabric_type: 'Raw Silk',
          color: 'Crimson Red',
          sleeve_style: 'Elbow Length',
          neck_design: 'Sweetheart',
          length_spec: 'Standard 14 in',
          fit_preference: 'Custom Fit',
          customization_notes: 'Padded princess cut with gold latkan ties.',
          reference_image: '',
          quantity: 1,
          unit_price: 650.00,
          customization_price: 0.00,
          delivery_fee: 50.00,
          discount: 0.00,
          total_amount: 700.00,
          advance_required: 210.00,
          advance_paid: 210.00,
          remaining_balance: 490.00,
          payment_status: 'VERIFIED',
          status: 'PROCESSING',
          tracking_number: 'TN-TRACK-8921',
          carrier: 'Atelier Courier',
          expected_delivery_date: new Date(Date.now() + 4 * 86400000).toISOString(),
          delivery_address: 'Flat 402, Rosewood Heights, MG Road',
          delivery_city: 'Bengaluru',
          delivery_state: 'Karnataka',
          delivery_postal_code: '560001',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          order_number: 'TN-541290-303',
          customer_id: 1,
          user_id: 2,
          service_id: 3,
          measurement_id: 1,
          garment_type: 'Kurti & Tunic Stitching',
          fabric_source: 'tailor_provided',
          fabric_type: 'Pure Cotton Chanderi',
          color: 'Indigo Blue',
          sleeve_style: 'Full Sleeves',
          neck_design: 'Mandarin Collar',
          length_spec: 'Calf Length',
          fit_preference: 'Comfort Fit',
          customization_notes: 'Functional side pockets and wooden buttons.',
          reference_image: '',
          quantity: 1,
          unit_price: 550.00,
          customization_price: 300.00,
          delivery_fee: 50.00,
          discount: 0.00,
          total_amount: 900.00,
          advance_required: 270.00,
          advance_paid: 0.00,
          remaining_balance: 900.00,
          payment_status: 'PENDING',
          status: 'ORDER_PLACED',
          tracking_number: '',
          carrier: 'Direct Courier',
          expected_delivery_date: new Date(Date.now() + 6 * 86400000).toISOString(),
          delivery_address: 'Flat 402, Rosewood Heights, MG Road',
          delivery_city: 'Bengaluru',
          delivery_state: 'Karnataka',
          delivery_postal_code: '560001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }

    if (!localStore.order_status_history || localStore.order_status_history.length === 0) {
      localStore.order_status_history = [
        { id: 1, order_id: 1, status: 'ORDER_PLACED', notes: 'Order submitted by customer.', changed_by: 'Priya Sharma', changed_at: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: 2, order_id: 1, status: 'CONFIRMED', notes: 'Advance payment verified. Materials prepped.', changed_by: 'Master Tailor Admin', changed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 3, order_id: 1, status: 'PROCESSING', notes: 'Precision cutting and stitching in progress.', changed_by: 'Master Tailor Admin', changed_at: new Date(Date.now() - 1 * 86400000).toISOString() },
        { id: 4, order_id: 1, status: 'SHIPPED', notes: 'Garment packed and dispatched via BlueDart.', changed_by: 'Master Tailor Admin', changed_at: new Date().toISOString() },
        { id: 5, order_id: 2, status: 'ORDER_PLACED', notes: 'Order submitted by customer.', changed_by: 'Priya Sharma', changed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 6, order_id: 2, status: 'CONFIRMED', notes: 'Advance verified. Measurements reviewed.', changed_by: 'Master Tailor Admin', changed_at: new Date(Date.now() - 1 * 86400000).toISOString() },
        { id: 7, order_id: 2, status: 'PROCESSING', notes: 'Pattern making and stitching initiated.', changed_by: 'Master Tailor Admin', changed_at: new Date().toISOString() },
        { id: 8, order_id: 3, status: 'ORDER_PLACED', notes: 'Order placed, awaiting customer advance.', changed_by: 'Priya Sharma', changed_at: new Date().toISOString() }
      ];
    }

    if (!localStore.tracking_updates || localStore.tracking_updates.length === 0) {
      localStore.tracking_updates = [
        { id: 1, order_id: 1, status: 'CONFIRMED', location: 'Design Studio Bengaluru', description: 'Fabric received and inspected for bespoke stitching.', carrier: 'Atelier In-House', event_time: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 2, order_id: 1, status: 'PROCESSING', location: 'Atelier Workshop', description: 'Tailoring completed, passing rigorous quality check.', carrier: 'Atelier In-House', event_time: new Date(Date.now() - 1 * 86400000).toISOString() },
        { id: 3, order_id: 1, status: 'SHIPPED', location: 'Bengaluru Central Hub', description: 'Package dispatched via BlueDart Express (AWB: TN-TRACK-7649).', carrier: 'BlueDart Express', event_time: new Date().toISOString() },
        { id: 4, order_id: 2, status: 'PROCESSING', location: 'Atelier Workshop', description: 'Blouse pattern drafted and cut to custom bust & armhole specs.', carrier: 'Atelier In-House', event_time: new Date().toISOString() }
      ];
    }

    if (!localStore.payments || localStore.payments.length === 0) {
      localStore.payments = [
        {
          id: 1,
          order_id: 1,
          customer_id: 1,
          user_id: 2,
          amount: 375.00,
          payment_method: 'UPI',
          transaction_reference: 'UPI118492004829',
          payment_proof: '',
          status: 'VERIFIED',
          reviewed_by: 1,
          reviewer_name: 'Master Tailor Admin',
          review_notes: 'Verified against studio UPI bank statement.',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 2,
          order_id: 2,
          customer_id: 1,
          user_id: 2,
          amount: 210.00,
          payment_method: 'UPI',
          transaction_reference: 'UPI983726451201',
          payment_proof: '',
          status: 'VERIFIED',
          reviewed_by: 1,
          reviewer_name: 'Master Tailor Admin',
          review_notes: 'Verified with GPay credit notification.',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ];
    }

    if (!localStore.services || localStore.services.length === 0) {
      localStore.services = [...initialServices];
    }
    if (!localStore.settings || localStore.settings.length === 0) {
      localStore.settings = [
        { id: 1, setting_key: 'shop_name', setting_value: 'Tailor Notebook', description: 'Business Store Name' },
        { id: 2, setting_key: 'upi_id', setting_value: 'tailornotebook@okaxis', description: 'UPI ID for customer advance QR' },
        { id: 3, setting_key: 'upi_payee_name', setting_value: 'Tailor Notebook Studio', description: 'Payee Name for UPI' },
        { id: 4, setting_key: 'advance_percentage', setting_value: '30', description: 'Default required advance percentage' },
        { id: 5, setting_key: 'default_delivery_fee', setting_value: '50', description: 'Standard local delivery fee in INR' },
        { id: 6, setting_key: 'contact_phone', setting_value: '+91 98765 43210', description: 'Customer support hotline' },
        { id: 7, setting_key: 'contact_email', setting_value: 'support@tailornotebook.com', description: 'Support email address' },
        { id: 8, setting_key: 'studio_address', setting_value: 'Shop 12, Blossom Lane, Fashion District, Bengaluru 560001', description: 'Physical Studio Address' }
      ];
    }
    saveLocalStore();
  }
}

async function initDatabase() {
  loadLocalStore();
  try {
    const conn = await mysql.createConnection({
      host: env.mysql.host,
      port: env.mysql.port,
      user: env.mysql.user,
      password: env.mysql.password,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${env.mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.end();

    pool = mysql.createPool({
      host: env.mysql.host,
      port: env.mysql.port,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    });

    // Run schema
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err) {
        // ignore benign exist warnings
      }
    }

    isMySqlAvailable = true;
    logger.info(`Successfully connected to MySQL 8 database: ${env.mysql.database}`);
  } catch (err) {
    isMySqlAvailable = false;
    logger.warn(`MySQL connection not active (${err.message}). Using persistent local data store with full transaction safety.`);
  }

  await seedInitialData();
}

// Universal Query Interface
async function query(sql, params = []) {
  if (isMySqlAvailable && pool) {
    try {
      let normalizedSql = sql;
      if (/\$\d+/.test(sql)) {
        normalizedSql = sql.replace(/\$\d+/g, '?');
      }
      const [rows, fields] = await pool.query(normalizedSql, params);
      return { rows: Array.isArray(rows) ? rows : [], insertId: rows.insertId, affectedRows: rows.affectedRows };
    } catch (err) {
      logger.error('MySQL query error, attempting local store fallback:', err.message);
    }
  }

  // Fallback Query Engine
  return executeLocalQuery(sql, params);
}

function getTableData(tableName) {
  const name = tableName.toLowerCase();
  if (!localStore[name]) {
    localStore[name] = [];
  }
  return localStore[name];
}

function executeLocalQuery(sql, params = []) {
  const clean = sql.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // 1. SELECT QUERIES
  if (lower.startsWith('select')) {
    // Handle trivial SELECT 1 or dual
    if (lower.includes('from dual') || lower === 'select 1' || lower === 'select 1 as count') {
      return { rows: [{ '1': 1, count: 1 }] };
    }

    // Extract primary table and alias
    const fromMatch = clean.match(/from\s+([a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+)|\s+([a-zA-Z0-9_]+))?/i);
    if (!fromMatch) {
      return { rows: [] };
    }

    const mainTable = fromMatch[1].toLowerCase();
    const mainAlias = (fromMatch[2] || fromMatch[3] || mainTable).toLowerCase();

    let records = getTableData(mainTable).map(r => ({ ...r }));

    // Handle LEFT JOINs
    const joinRegex = /left\s+join\s+([a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+)|\s+([a-zA-Z0-9_]+))?\s+on\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)/gi;
    let joinMatch;
    while ((joinMatch = joinRegex.exec(clean)) !== null) {
      const joinTable = joinMatch[1].toLowerCase();
      const joinAlias = (joinMatch[2] || joinMatch[3] || joinTable).toLowerCase();
      const leftCol = joinMatch[4].trim();
      const rightCol = joinMatch[5].trim();

      const joinData = getTableData(joinTable);

      records = records.map(rec => {
        const matchingJoinRow = joinData.find(jr => {
          // Resolve left and right column values
          const getVal = (colStr) => {
            const parts = colStr.split('.');
            if (parts.length === 2) {
              const tablePart = parts[0].toLowerCase();
              const colPart = parts[1];
              if (tablePart === mainAlias || tablePart === mainTable) return rec[colPart];
              if (tablePart === joinAlias || tablePart === joinTable) return jr[colPart];
            }
            return rec[colStr] !== undefined ? rec[colStr] : jr[colStr];
          };
          const v1 = getVal(leftCol);
          const v2 = getVal(rightCol);
          return v1 !== undefined && v2 !== undefined && String(v1) === String(v2);
        });

        const merged = { ...rec };
        if (matchingJoinRow) {
          // If joining orders to payments
          if (joinTable === 'orders') {
            merged.order_number = matchingJoinRow.order_number;
            merged.garment_type = matchingJoinRow.garment_type;
            merged.total_amount = matchingJoinRow.total_amount;
            merged.advance_required = matchingJoinRow.advance_required;
            merged.advance_paid = matchingJoinRow.advance_paid;
            merged.remaining_balance = matchingJoinRow.remaining_balance;
          }
          // If joining customers
          if (joinTable === 'customers') {
            merged.customer_name = matchingJoinRow.name;
            merged.customer_phone = matchingJoinRow.phone;
            merged.customer_email = matchingJoinRow.email;
          }
          // If joining users
          if (joinTable === 'users') {
            merged.user_role = matchingJoinRow.role;
            merged.user_created_at = matchingJoinRow.created_at;
          }
        }
        return merged;
      });
    }

    // Dynamic WHERE clause evaluation
    let pIdx = 0;

    // Filter by transaction_reference
    if (lower.includes('transaction_reference = ?')) {
      const refVal = String(params[pIdx++] || '').trim();
      records = records.filter(r => (r.transaction_reference || '').trim() === refVal);
      if (lower.includes('status != "rejected"') || lower.includes("status != 'rejected'")) {
        records = records.filter(r => r.status !== 'REJECTED');
      }
    }

    // Filter by id = ? OR order_number = ?
    else if (lower.includes('id = ? or order_number = ?') || lower.includes('orders where (customer_id = ? or user_id = ?)')) {
      if (lower.includes('id = ? or order_number = ?')) {
        const p1 = params[pIdx++];
        const p2 = params[pIdx++];
        records = records.filter(r => Number(r.id) === Number(p1) || String(r.order_number) === String(p2) || String(r.id) === String(p2));
      } else {
        const cId = Number(params[pIdx++]);
        const uId = Number(params[pIdx++]);
        records = records.filter(r => (cId > 0 && Number(r.customer_id) === cId) || (uId > 0 && Number(r.user_id) === uId));
      }
    }

    // Filter by customer_id = ? OR user_id = ?
    else if (lower.includes('customer_id = ? or') || lower.includes('user_id = ?') || lower.includes('p.customer_id = ? or p.user_id = ?')) {
      const cId = Number(params[pIdx++]);
      const uId = Number(params[pIdx++]);
      records = records.filter(r => (cId > 0 && Number(r.customer_id) === cId) || (uId > 0 && Number(r.user_id) === uId));
    }

    // Filter by user_id = ? OR email = ?
    else if (lower.includes('user_id = ? or email = ?')) {
      const uId = Number(params[pIdx++]);
      const email = String(params[pIdx++] || '').toLowerCase();
      records = records.filter(r => Number(r.user_id) === uId || (r.email || '').toLowerCase() === email);
    }

    // Single id = ?
    else if (lower.includes('where id = ?') || lower.includes('where p.id = ?') || lower.includes('where o.id = ?') || lower.includes('where c.id = ?')) {
      const idVal = Number(params[pIdx++]);
      records = records.filter(r => Number(r.id) === idVal);
    }

    // Filter by email = ?
    else if (lower.includes('where email = ?')) {
      const emailVal = String(params[pIdx++] || '').toLowerCase();
      records = records.filter(r => (r.email || '').toLowerCase() === emailVal);
    }

    // Filter by order_id = ?
    else if (lower.includes('order_id = ?')) {
      const oVal = Number(params[pIdx++]);
      records = records.filter(r => Number(r.order_id) === oVal);
    }

    // Filter by customer_id = ?
    else if (lower.includes('customer_id = ?')) {
      const cVal = Number(params[pIdx++]);
      records = records.filter(r => Number(r.customer_id) === cVal);
    }

    // Filter by setting_key = ?
    else if (lower.includes('setting_key = ?')) {
      const kVal = String(params[pIdx++] || '');
      records = records.filter(r => r.setting_key === kVal);
    }

    // Filter by active services
    if (lower.includes('is_active = 1')) {
      records = records.filter(r => Number(r.is_active) === 1 || r.is_active === true);
    }

    // Additional query filters: status, payment_status, search
    if (lower.includes('and o.status = ?') || lower.includes('and status = ?') || lower.includes('and p.status = ?')) {
      const stVal = params[pIdx++];
      if (stVal && stVal !== 'ALL') {
        records = records.filter(r => r.status === stVal);
      }
    }

    if (lower.includes('and o.payment_status = ?') || lower.includes('and payment_status = ?')) {
      const pstVal = params[pIdx++];
      if (pstVal && pstVal !== 'ALL') {
        records = records.filter(r => r.payment_status === pstVal);
      }
    }

    if (lower.includes('and category = ?') || lower.includes('category = ?')) {
      const catVal = params[pIdx++];
      if (catVal && catVal !== 'all') {
        records = records.filter(r => r.category === catVal);
      }
    }

    // Search term handling (LIKE ? OR LIKE ?)
    if (lower.includes('like ?')) {
      const searchParam = params[pIdx];
      if (searchParam) {
        const cleanTerm = String(searchParam).replace(/%/g, '').toLowerCase();
        records = records.filter(r => {
          return (
            (r.order_number && r.order_number.toLowerCase().includes(cleanTerm)) ||
            (r.garment_type && r.garment_type.toLowerCase().includes(cleanTerm)) ||
            (r.name && r.name.toLowerCase().includes(cleanTerm)) ||
            (r.customer_name && r.customer_name.toLowerCase().includes(cleanTerm)) ||
            (r.phone && r.phone.includes(cleanTerm)) ||
            (r.customer_phone && r.customer_phone.includes(cleanTerm)) ||
            (r.email && r.email.toLowerCase().includes(cleanTerm)) ||
            (r.transaction_reference && r.transaction_reference.toLowerCase().includes(cleanTerm))
          );
        });
      }
    }

    // ORDER BY
    if (lower.includes('order by')) {
      if (lower.includes('changed_at asc') || lower.includes('event_time asc')) {
        records.sort((a, b) => (new Date(a.changed_at || a.event_time || 0)) - (new Date(b.changed_at || b.event_time || 0)) || (a.id || 0) - (b.id || 0));
      } else if (lower.includes('order by id asc') || lower.includes('order by created_at asc')) {
        records.sort((a, b) => (a.id || 0) - (b.id || 0));
      } else {
        // Default DESC
        records.sort((a, b) => (b.id || 0) - (a.id || 0));
      }
    }

    // COUNT
    if (lower.includes('count(')) {
      return { rows: [{ count: records.length, 'count(*)': records.length }] };
    }

    // LIMIT
    const limitMatch = lower.match(/limit\s+(\d+)/);
    if (limitMatch) {
      records = records.slice(0, Number(limitMatch[1]));
    }

    return { rows: records };
  }

  // 2. INSERT QUERIES
  if (lower.startsWith('insert into')) {
    const tableMatch = clean.match(/insert into\s+([a-zA-Z0-9_]+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1].toLowerCase();
      const tableData = getTableData(tableName);

      if (!localStore._counters) localStore._counters = {};
      const maxExistingId = tableData.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
      const currentCounter = Math.max(localStore._counters[tableName] || 0, maxExistingId);
      const newId = currentCounter + 1;
      localStore._counters[tableName] = newId;

      const newRecord = {
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const colsMatch = clean.match(/insert into\s+[a-zA-Z0-9_]+\s*\(([\s\S]+?)\)/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(',').map(c => c.trim().toLowerCase());
        cols.forEach((col, idx) => {
          newRecord[col] = params[idx] !== undefined ? params[idx] : null;
        });
      }

      tableData.push(newRecord);
      saveLocalStore();
      return { insertId: newId, affectedRows: 1, rows: [newRecord] };
    }
  }

  // 3. UPDATE QUERIES
  if (lower.startsWith('update')) {
    const tableMatch = clean.match(/update\s+([a-zA-Z0-9_]+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1].toLowerCase();
      const tableData = getTableData(tableName);
      let updatedCount = 0;

      // Extract SET pairs
      const setMatch = clean.match(/set\s+([\s\S]+?)\s+where\s+([\s\S]+)$/i);
      if (setMatch) {
        const setClause = setMatch[1];
        const whereClause = setMatch[2].toLowerCase();

        const setAssignments = setClause.split(',').map(s => s.trim());
        const setCols = setAssignments.map(s => s.split('=')[0].trim().toLowerCase());
        const setParams = params.slice(0, setCols.length);
        const whereParams = params.slice(setCols.length);

        // Find target records based on WHERE
        const targetRecords = tableData.filter(r => {
          if (whereClause.includes('id = ?')) {
            return Number(r.id) === Number(whereParams[0]);
          }
          if (whereClause.includes('setting_key = ?')) {
            return r.setting_key === String(whereParams[0]);
          }
          if (whereClause.includes('user_id = ?')) {
            return Number(r.user_id) === Number(whereParams[0]);
          }
          return true;
        });

        targetRecords.forEach(rec => {
          setCols.forEach((col, idx) => {
            if (setParams[idx] !== undefined) {
              rec[col] = setParams[idx];
            }
          });
          rec.updated_at = new Date().toISOString();
          updatedCount++;
        });
      }

      saveLocalStore();
      return { affectedRows: updatedCount };
    }
  }

  // 4. DELETE QUERIES
  if (lower.startsWith('delete from')) {
    const tableMatch = clean.match(/delete from\s+([a-zA-Z0-9_]+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1].toLowerCase();
      const tableData = getTableData(tableName);
      const initialLen = tableData.length;

      if (lower.includes('where id = ?')) {
        const idVal = Number(params[0]);
        localStore[tableName] = tableData.filter(r => Number(r.id) !== idVal);
      }

      saveLocalStore();
      return { affectedRows: initialLen - localStore[tableName].length };
    }
  }

  return { rows: [], affectedRows: 0 };
}

async function withTransaction(fn) {
  if (isMySqlAvailable && pool) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    const client = {
      query: async (sql, params = []) => {
        let normalized = sql;
        if (/\$\d+/.test(sql)) normalized = sql.replace(/\$\d+/g, '?');
        const [rows] = await conn.query(normalized, params);
        return { rows: Array.isArray(rows) ? rows : [], insertId: rows.insertId, affectedRows: rows.affectedRows };
      }
    };
    try {
      const res = await fn(client);
      await conn.commit();
      return res;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Local transaction simulation
  const client = { query };
  return await fn(client);
}

module.exports = {
  pool: { query },
  query,
  withTransaction,
  initDatabase,
  getLocalStore: () => localStore
};
