import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getAdminCustomers, getAdminCustomerById } from '../../services/adminService';
import { Users, Search, Eye, Phone, Mail, MapPin, X, ShoppingBag, Ruler } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    getAdminCustomers({ search })
      .then((data) => setCustomers(data))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCust(cust);
    setDetailsLoading(true);
    try {
      const res = await getAdminCustomerById(cust.id);
      setDetailsData(res);
    } catch (err) {
      alert('Failed to load customer profile details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    if (!search) return true;
    return (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Client Directory</span>
              <h1 className="portal-main-title font-serif">Customer Management</h1>
            </div>
          </div>

          <div className="filter-bar studio-card">
            <div className="search-box" style={{ minWidth: '320px' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search customers by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading customer accounts..." size="large" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description="No registered customer profiles found."
            />
          ) : (
            <div className="studio-card">
              <div className="table-responsive">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Contact Info</th>
                      <th>City & Address</th>
                      <th>Total Orders</th>
                      <th>Joined Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <span className="d-block text-muted text-xs">{c.gender || 'Client'}</span>
                        </td>
                        <td>
                          <div>{c.phone}</div>
                          <span className="text-muted text-xs">{c.email}</span>
                        </td>
                        <td>
                          <div>{c.city || 'Bengaluru'}</div>
                          <span className="text-muted text-xs">{c.address || '-'}</span>
                        </td>
                        <td>
                          <span className="badge badge-placed">{c.orderCount || 0} Orders</span>
                        </td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleViewCustomer(c)}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye size={14} />
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Details Modal */}
          {selectedCust && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog-large studio-card">
                <div className="modal-header-row">
                  <h3 className="modal-title font-serif">
                    Customer Profile: {selectedCust.name}
                  </h3>
                  <button onClick={() => setSelectedCust(null)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                {detailsLoading ? (
                  <LoadingSpinner text="Retrieving orders & measurements..." />
                ) : (
                  <div>
                    <div className="grid-3 mb-4">
                      <div className="p-3 bg-light rounded">
                        <span className="text-muted text-xs">Phone</span>
                        <div className="font-bold">{selectedCust.phone}</div>
                      </div>
                      <div className="p-3 bg-light rounded">
                        <span className="text-muted text-xs">Email</span>
                        <div className="font-bold">{selectedCust.email}</div>
                      </div>
                      <div className="p-3 bg-light rounded">
                        <span className="text-muted text-xs">City & State</span>
                        <div className="font-bold">{selectedCust.city || 'Bengaluru'}, {selectedCust.state || 'Karnataka'}</div>
                      </div>
                    </div>

                    <h4 className="font-serif mb-2"><ShoppingBag size={16} /> Order History ({detailsData?.orders?.length || 0})</h4>
                    <div className="orders-mini-list mb-4">
                      {(detailsData?.orders || []).map((o) => (
                        <div key={o.id} className="order-mini-item">
                          <span>#{o.order_number} — {o.garment_type}</span>
                          <span>₹{o.total_amount} | Status: <strong>{o.status}</strong></span>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-serif mb-2"><Ruler size={16} /> Saved Measurement Profiles ({detailsData?.measurements?.length || 0})</h4>
                    <div className="orders-mini-list">
                      {(detailsData?.measurements || []).map((m) => (
                        <div key={m.id} className="order-mini-item">
                          <span>{m.title} ({m.garment_type})</span>
                          <span>Bust: {m.bust || '-'}, Waist: {m.waist || '-'}, Shoulder: {m.shoulder || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
