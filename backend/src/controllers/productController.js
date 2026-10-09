const { query, isMySQLConnected, getLocalStore, saveLocalStore } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/auditService');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category, q } = req.query;

    if (isMySQLConnected()) {
      let sql = 'SELECT * FROM products WHERE is_active = 1';
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (q) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR fabric_details LIKE ?)';
        const term = `%${q}%`;
        params.push(term, term, term);
      }

      sql += ' ORDER BY id ASC';
      const products = await query(sql, params);
      return successResponse(res, 'Products fetched successfully', products);
    } else {
      const store = getLocalStore();
      let list = (store?.products || []).filter(p => p.is_active !== 0);

      if (category && category !== 'all') {
        list = list.filter(p => p.category === category);
      }
      if (q) {
        const term = q.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.fabric_details && p.fabric_details.toLowerCase().includes(term))
        );
      }

      return successResponse(res, 'Products fetched successfully', list);
    }
  } catch (err) {
    console.error('[GetProducts Error]:', err);
    return errorResponse(res, 'Failed to fetch products.', 500);
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    let product = null;
    if (isMySQLConnected()) {
      const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) return errorResponse(res, 'Product not found', 404);
      product = rows[0];
    } else {
      const store = getLocalStore();
      product = (store?.products || []).find(p => p.id == id);
      if (!product) return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, 'Product details fetched', product);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch product details.', 500);
  }
};

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name, category, description, fabric_details, base_price,
      image_url, available_sizes = 'XS,S,M,L,XL,XXL,3XL',
      is_custom_stitchable = 1, stock_quantity = 50
    } = req.body;

    if (!name || !category || !base_price) {
      return errorResponse(res, 'Name, category, and base price are required.', 400);
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let newId;
    if (isMySQLConnected()) {
      const result = await query(
        `INSERT INTO products (
          name, category, description, fabric_details, base_price,
          image_url, available_sizes, is_custom_stitchable, stock_quantity, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          name, category, description || null, fabric_details || null,
          parseFloat(base_price), image_url || null, available_sizes,
          is_custom_stitchable ? 1 : 0, stock_quantity || 50, timestamp
        ]
      );
      newId = result.insertId;
    } else {
      const store = getLocalStore();
      newId = (store.products.length > 0 ? Math.max(...store.products.map(p => p.id)) : 0) + 1;
      const newProd = {
        id: newId,
        name,
        category,
        description: description || null,
        fabric_details: fabric_details || null,
        base_price: parseFloat(base_price),
        image_url: image_url || null,
        available_sizes,
        is_custom_stitchable: is_custom_stitchable ? 1 : 0,
        stock_quantity: parseInt(stock_quantity) || 50,
        is_active: 1,
        created_at: timestamp
      };
      store.products.push(newProd);
      saveLocalStore();
    }

    await logActivity({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_PRODUCT',
      entityType: 'product',
      entityId: newId,
      details: `Created product: ${name} (${category})`
    });

    return successResponse(res, 'Product created successfully', { id: newId }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create product.', 500);
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, description, fabric_details, base_price,
      image_url, available_sizes, stock_quantity, is_active
    } = req.body;

    if (isMySQLConnected()) {
      await query(
        `UPDATE products SET 
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          fabric_details = COALESCE(?, fabric_details),
          base_price = COALESCE(?, base_price),
          image_url = COALESCE(?, image_url),
          available_sizes = COALESCE(?, available_sizes),
          stock_quantity = COALESCE(?, stock_quantity),
          is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [
          name, category, description, fabric_details,
          base_price ? parseFloat(base_price) : null,
          image_url, available_sizes, stock_quantity, is_active, id
        ]
      );
    } else {
      const store = getLocalStore();
      const p = (store?.products || []).find(item => item.id == id);
      if (!p) return errorResponse(res, 'Product not found', 404);

      if (name) p.name = name;
      if (category) p.category = category;
      if (description) p.description = description;
      if (fabric_details) p.fabric_details = fabric_details;
      if (base_price) p.base_price = parseFloat(base_price);
      if (image_url) p.image_url = image_url;
      if (available_sizes) p.available_sizes = available_sizes;
      if (stock_quantity != null) p.stock_quantity = stock_quantity;
      if (is_active != null) p.is_active = is_active;
      saveLocalStore();
    }

    return successResponse(res, 'Product updated successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to update product.', 500);
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMySQLConnected()) {
      await query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    } else {
      const store = getLocalStore();
      const p = (store?.products || []).find(item => item.id == id);
      if (p) p.is_active = 0;
      saveLocalStore();
    }
    return successResponse(res, 'Product deleted successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to delete product.', 500);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
