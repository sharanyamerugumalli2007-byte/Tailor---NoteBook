import React, { useState, useEffect } from 'react';
import { productService } from '../../../services/productService';
import { formatCurrency } from '../../../utils/formatters';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import { Plus, Edit2, Trash2, Shirt, Layers } from 'lucide-react';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Suits',
    description: '',
    fabric_details: '',
    base_price: '',
    image_url: '',
    available_sizes: 'XS,S,M,L,XL,XXL,3XL',
    stock_quantity: 50,
    is_custom_stitchable: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts();
      if (res.success) setProducts(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Suits',
      description: '',
      fabric_details: '',
      base_price: '',
      image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      available_sizes: 'XS,S,M,L,XL,XXL,3XL',
      stock_quantity: 50,
      is_custom_stitchable: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      description: p.description || '',
      fabric_details: p.fabric_details || '',
      base_price: p.base_price,
      image_url: p.image_url || '',
      available_sizes: p.available_sizes || 'XS,S,M,L,XL,XXL,3XL',
      stock_quantity: p.stock_quantity || 50,
      is_custom_stitchable: p.is_custom_stitchable
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        showToast('Garment updated in catalog', 'success');
      } else {
        await productService.createProduct(formData);
        showToast('New garment added to catalog', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.userMessage || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this garment from the active catalog?')) return;
    try {
      await productService.deleteProduct(id);
      showToast('Product removed', 'success');
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const columns = [
    {
      header: 'Garment / Fabric',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.image_url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200'}
            alt={row.name}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fabric: {row.fabric_details || 'Standard Bespoke Fabric'}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
          {row.category}
        </span>
      )
    },
    {
      header: 'Base Price',
      accessor: (row) => <strong>{formatCurrency(row.base_price)}</strong>
    },
    {
      header: 'Available Sizes',
      accessor: (row) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {row.available_sizes}
        </span>
      )
    },
    {
      header: 'Stock / Custom',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem' }}>
          {row.stock_quantity} units &bull; {row.is_custom_stitchable ? 'Custom Stitchable' : 'Ready Only'}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger)' }}
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Garments & Fabric Catalog
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage ready-to-stitch apparel, luxury fabrics, price points, and inclusive size ranges.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Garment
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchProducts} />}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No garments in catalog."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Garment: ${editingProduct.name}` : 'Add New Garment to Catalog'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">Garment Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Royal Heritage Bandhgala Suit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Suits">Suits & Blazers</option>
                <option value="Shirts">Shirts</option>
                <option value="Kurtas">Kurtas & Sets</option>
                <option value="Blouses">Blouses & Saree Wear</option>
                <option value="Trousers">Trousers & Pants</option>
                <option value="Dresses">Dresses & Gowns</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Base Tailoring Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="50"
                className="form-control"
                placeholder="e.g. 2500"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fabric Specification</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Pure Kanchipuram Silk, 100% Egyptian Cotton"
              value={formData.fabric_details}
              onChange={(e) => setFormData({ ...formData, fabric_details: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Available Sizes (Comma Separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="XS,S,M,L,XL,XXL,3XL"
                value={formData.available_sizes}
                onChange={(e) => setFormData({ ...formData, available_sizes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity Available</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Garment Description</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Style, silhouette, lapel type, occasion wear..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsManager;
