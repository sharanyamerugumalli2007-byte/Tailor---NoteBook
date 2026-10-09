import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getAdminOrders } from '../../services/orderService';
import { addTrackingEvent } from '../../services/trackingService';
import { Truck, PlusCircle, Search, MapPin, Calendar, Clock, CheckCircle2, X } from 'lucide-react';

export default function AdminShipments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [eventData, setEventData] = useState({
    status: 'SHIPPED',
    location: 'Central Atelier Dispatch',
    carrier: 'BlueDart Express',
    description: 'Garment packed in atelier keepsake box and dispatched.'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const handleOpenAddEvent = (ord) => {
    setSelectedOrder(ord);
    setEventData({
      status: ord.status || 'SHIPPED',
      location: 'Bengaluru Logistics Hub',
      carrier: ord.carrier || 'Express Courier',
      description: `Package transit update for ${ord.garment_type}.`
    });
    setEventModalOpen(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      await addTrackingEvent(selectedOrder.id, eventData);
      setEventModalOpen(false);
      alert('Tracking event recorded and customer notified!');
    } catch (err) {
      alert(err.message || 'Failed to record tracking event.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    return (
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.garment_type.toLowerCase().includes(search.toLowerCase()) ||
      (o.tracking_number || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Logistics & Courier Timeline</span>
              <h1 className="portal-main-title font-serif">Shipment & Tracking Management</h1>
            </div>
          </div>

          <div className="filter-bar studio-card">
            <div className="search-box" style={{ minWidth: '320px' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by order #, AWB tracking #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving shipment dispatches..." size="large" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No shipments found"
              description="No orders currently logged for delivery."
            />
          ) : (
            <div className="studio-card">
              <div className="table-responsive">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Order # & Garment</th>
                      <th>Client Delivery City</th>
                      <th>Carrier</th>
                      <th>AWB / Tracking #</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong className="text-rose font-bold">#{o.order_number}</strong>
                          <span className="d-block text-xs text-muted">{o.garment_type}</span>
                        </td>
                        <td>
                          <div>{o.delivery_city || 'Bengaluru'}</div>
                          <span className="d-block text-xs text-muted">{o.delivery_address}</span>
                        </td>
                        <td>{o.carrier || 'Express Atelier Courier'}</td>
                        <td>
                          <code className="font-mono">{o.tracking_number || 'Pending Dispatch'}</code>
                        </td>
                        <td>
                          <StatusBadge status={o.status} type="order" />
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenAddEvent(o)}
                            className="btn btn-primary btn-sm"
                          >
                            <PlusCircle size={14} />
                            <span>Add Tracking Event</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Tracking Event Modal */}
          {eventModalOpen && selectedOrder && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog studio-card">
                <div className="modal-header-row">
                  <h3 className="modal-title font-serif">
                    Add Tracking Event: #{selectedOrder.order_number}
                  </h3>
                  <button onClick={() => setEventModalOpen(false)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleEventSubmit} className="tracking-event-form">
                  <div className="form-group">
                    <label className="form-label">Current Milestone Status</label>
                    <select
                      value={eventData.status}
                      onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="PROCESSING">Processing / Quality Checked</option>
                      <option value="SHIPPED">Shipped from Atelier</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery to Client</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Checkpoint Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar Delivery Hub"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Courier Name</label>
                    <input
                      type="text"
                      value={eventData.carrier}
                      onChange={(e) => setEventData({ ...eventData, carrier: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Description *</label>
                    <textarea
                      rows="3"
                      value={eventData.description}
                      onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                      className="form-textarea"
                      required
                    />
                  </div>

                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      onClick={() => setEventModalOpen(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary"
                    >
                      {submitting ? 'Recording Event...' : 'Broadcast Tracking Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
