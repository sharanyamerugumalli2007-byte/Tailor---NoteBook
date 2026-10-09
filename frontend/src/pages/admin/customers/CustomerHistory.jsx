import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { formatDate, formatTime } from '../../../utils/dateUtils';
import { formatCurrency } from '../../../utils/formatters';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { ArrowLeft, Ruler, Scissors, Calendar, Clock, CheckCircle } from 'lucide-react';

const CustomerHistory = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomerHistory(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch customer history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  if (loading) return <Loading message="Loading customer 360 history..." />;
  if (error) return <ErrorMessage message={error} retry={fetchHistory} />;
  if (!data?.customer) return <ErrorMessage message="Customer record not found." />;

  const { customer, measurements = [], orders = [], appointments = [] } = data;

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(`/admin/customers/${id}`)}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} /> Back to Customer
        </button>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            360° Customer Relationship Timeline
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Complete audit history of measurements, tailored orders, and fittings for <strong>{customer.name}</strong>
          </span>
        </div>
      </div>

      {/* Customer Profile Banner */}
      <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{customer.name}</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Tel: {customer.phone} &bull; Email: {customer.email || 'None'} &bull; Gender: {customer.gender}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
              Address: {customer.address || 'Not specified'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
            <div style={{ background: '#ffffff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{measurements.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Versions</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{orders.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>{appointments.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fittings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Measurement History Versions */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Ruler size={20} color="var(--accent)" />
          <h3 className="heading-serif" style={{ fontSize: '1.2rem' }}>
            1. Measurement History & Versioning ({measurements.length})
          </h3>
        </div>

        {measurements.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No measurement versions recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {measurements.map((m) => (
              <div
                key={m.id}
                style={{
                  border: m.is_current ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  backgroundColor: m.is_current ? '#fffbeb' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.925rem' }}>Version {m.version}</strong>
                    {m.is_current ? (
                      <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>CURRENT ACTIVE</span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>HISTORICAL</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Recorded: {formatDate(m.created_at)} &bull; Unit: <strong>{m.unit}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Chest:</span> <strong>{m.chest || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Waist:</span> <strong>{m.waist || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Hip:</span> <strong>{m.hip || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Shoulder:</span> <strong>{m.shoulder || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Sleeve:</span> <strong>{m.sleeve_length || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Shirt L:</span> <strong>{m.shirt_length || '—'}</strong></div>
                </div>

                {m.notes && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Notes: {m.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Order History */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Scissors size={20} color="var(--accent)" />
          <h3 className="heading-serif" style={{ fontSize: '1.2rem' }}>
            2. Tailored Orders & Itemized History ({orders.length})
          </h3>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders placed by this customer.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to={`/admin/orders/${ord.id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)' }}>
                      {ord.order_number}
                    </Link>
                    <StatusBadge status={ord.status} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Ordered: {formatDate(ord.order_date)} &bull; Delivery: {formatDate(ord.expected_delivery_date)}
                  </div>
                </div>

                {/* Items List */}
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', margin: '0.5rem 0' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Order Items:
                  </strong>
                  {(ord.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.2rem 0' }}>
                      <span>&bull; {it.item_type} - {it.description || 'Custom tailored'} (Qty: {it.quantity})</span>
                      <strong>{formatCurrency(it.price * it.quantity)}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <div>
                    Advance Paid: <strong style={{ color: '#15803d' }}>{formatCurrency(ord.advance_amount)}</strong> &bull; Balance Due: <strong style={{ color: '#b91c1c' }}>{formatCurrency(ord.remaining_amount)}</strong>
                  </div>
                  <div>
                    Total Amount: <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{formatCurrency(ord.total_amount)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Appointment History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calendar size={20} color="var(--accent)" />
          <h3 className="heading-serif" style={{ fontSize: '1.2rem' }}>
            3. Fittings, Trials & Appointments History ({appointments.length})
          </h3>
        </div>

        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No appointment records found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {appointments.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem' }}>{app.purpose} Fitting</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Scheduled for {formatDate(app.appointment_date)} at {formatTime(app.appointment_time)}
                  </div>
                  {app.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      Notes: {app.notes}
                    </div>
                  )}
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHistory;
