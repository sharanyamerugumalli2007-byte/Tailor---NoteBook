import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getAdminOrders, updateOrderStatus } from '../../services/orderService';
import {
  ShoppingBag,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  X,
  Ruler,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('Express Courier');
  const [expectedDate, setExpectedDate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders({ status: statusFilter, payment_status: paymentFilter, search })
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const handleOpenStatusModal = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setAdminNotes(ord.admin_notes || '');
    setTrackingNumber(ord.tracking_number || '');
    setCarrier(ord.carrier || 'Express Courier');
    setExpectedDate(ord.expected_delivery_date ? ord.expected_delivery_date.slice(0, 10) : '');
    setStatusModalOpen(true);
  };

  const handleOpenViewModal = (ord) => {
    setSelectedOrder(ord);
    setViewDetailsOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: adminNotes,
        tracking_number: trackingNumber,
        carrier,
        expected_delivery_date: expectedDate || null
      });
      setStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    return (
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.garment_type.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone || '').includes(search)
    );
  });

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Master Atelier Orders</span>
              <h1 className="portal-main-title font-serif">Order Lifecycle Management</h1>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar studio-card">
            <div className="filter-group-cluster">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select filter-select"
              >
                <option value="ALL">All Order Statuses</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing / Stitching</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="form-select filter-select"
              >
                <option value="ALL">All Payment States</option>
                <option value="PENDING">Pending Advance</option>
                <option value="SUBMITTED">Verification Pending</option>
                <option value="VERIFIED">Advance Verified</option>
              </select>
            </div>

            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by order #, client name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving orders from MySQL database..." size="large" />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="No tailoring orders match your current filter parameters."
            />
          ) : (
            <div className="orders-table-card studio-card">
              <div className="table-responsive">
                <table className="size-table admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Client</th>
                      <th>Garment Spec</th>
                      <th>Total & Advance</th>
                      <th>Payment Status</th>
                      <th>Stitching Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="font-bold text-rose">
                          #{o.order_number}
                          <span className="order-sub-date d-block">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <strong>{o.customer_name || 'Client'}</strong>
                          <span className="d-block text-muted text-xs">{o.customer_phone}</span>
                        </td>
                        <td>
                          <strong>{o.garment_type}</strong> (Qty: {o.quantity})
                          <span className="d-block text-muted text-xs">
                            {o.fabric_source === 'customer_provided' ? 'Customer Fabric' : 'Studio Fabric'}
                          </span>
                        </td>
                        <td>
                          <strong>₹{Number(o.total_amount).toFixed(2)}</strong>
                          <span className="d-block text-xs text-success">
                            Paid: ₹{Number(o.advance_paid || 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={o.payment_status} type="payment" />
                        </td>
                        <td>
                          <StatusBadge status={o.status} type="order" />
                        </td>
                        <td className="table-actions-cell">
                          <button
                            onClick={() => handleOpenViewModal(o)}
                            className="btn btn-outline btn-sm"
                            title="View Full Specs"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(o)}
                            className="btn btn-primary btn-sm"
                            title="Update Status"
                          >
                            <Edit2 size={14} />
                            <span>Update</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Update Modal */}
          {statusModalOpen && selectedOrder && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog studio-card">
                <div className="modal-header-row">
                  <h3 className="modal-title font-serif">
                    Update Order #{selectedOrder.order_number}
                  </h3>
                  <button onClick={() => setStatusModalOpen(false)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleStatusSubmit} className="status-update-form">
                  <div className="form-group">
                    <label className="form-label">Select New Stitching Status *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="ORDER_PLACED">Order Placed (Initial Review)</option>
                      <option value="CONFIRMED">Confirmed (Materials Prepped)</option>
                      <option value="PROCESSING">Processing (Cutting & Stitching)</option>
                      <option value="SHIPPED">Shipped (Dispatched to Carrier)</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered (Completed)</option>
                      <option value="CORRECTION_REQUIRED">Correction Required</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(newStatus) && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Tracking Airway Bill (AWB) #</label>
                        <input
                          type="text"
                          placeholder="e.g. TN-TRACK-994821"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Carrier Name</label>
                        <input
                          type="text"
                          placeholder="e.g. BlueDart / Dunzo / Atelier Courier"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label">Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Notes / Update Description</label>
                    <textarea
                      rows="3"
                      placeholder="Add internal notes or customer message for this milestone..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="form-textarea"
                    />
                  </div>

                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      onClick={() => setStatusModalOpen(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-primary"
                    >
                      {updating ? 'Updating Status...' : 'Apply Status Change'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {viewDetailsOpen && selectedOrder && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog-large studio-card">
                <div className="modal-header-row">
                  <h3 className="modal-title font-serif">
                    Order #{selectedOrder.order_number} Details
                  </h3>
                  <button onClick={() => setViewDetailsOpen(false)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid-2 mb-4">
                  <div className="specs-list">
                    <div className="spec-item">
                      <span className="spec-label">Customer Name</span>
                      <span className="spec-val">{selectedOrder.customer_name || 'Patron'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Phone</span>
                      <span className="spec-val">{selectedOrder.customer_phone || '-'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Garment</span>
                      <span className="spec-val">{selectedOrder.garment_type} (Qty: {selectedOrder.quantity})</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Sleeve & Neck</span>
                      <span className="spec-val">{selectedOrder.sleeve_style}, {selectedOrder.neck_design}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Fit Preference</span>
                      <span className="spec-val">{selectedOrder.fit_preference}</span>
                    </div>
                  </div>

                  <div className="specs-list">
                    <div className="spec-item">
                      <span className="spec-label">Total Amount</span>
                      <span className="spec-val font-bold">₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Advance Paid</span>
                      <span className="spec-val font-bold text-success">₹{Number(selectedOrder.advance_paid || 0).toFixed(2)}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Remaining Due</span>
                      <span className="spec-val font-bold">₹{Number(selectedOrder.remaining_balance).toFixed(2)}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Delivery Address</span>
                      <span className="spec-val">{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.customization_notes && (
                  <div className="p-3 bg-light rounded mb-3">
                    <strong>Customization Notes:</strong>
                    <p className="text-muted text-sm mt-1">{selectedOrder.customization_notes}</p>
                  </div>
                )}

                <div className="modal-footer-actions">
                  <button
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleOpenStatusModal(selectedOrder);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Change Status
                  </button>
                  <button onClick={() => setViewDetailsOpen(false)} className="btn btn-outline btn-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .filter-group-cluster {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-select {
          min-width: 180px;
          padding: 0.5rem 1rem;
        }
        .admin-orders-table td {
          vertical-align: middle;
        }
        .table-actions-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .d-block { display: block; }
        .text-xs { font-size: 0.75rem; }
        .order-sub-date {
          font-size: 0.725rem;
          color: var(--text-light);
          font-weight: normal;
        }
      `}</style>
    </div>
  );
}
