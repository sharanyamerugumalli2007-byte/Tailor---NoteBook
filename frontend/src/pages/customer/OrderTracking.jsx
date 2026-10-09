import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerSidebar from '../../components/CustomerSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getOrderTracking } from '../../services/trackingService';
import {
  Compass,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialOrder) {
      handleSearchOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleSearchOrder = async (orderNum) => {
    const q = (orderNum || orderQuery).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      const res = await getOrderTracking(q);
      setTrackingData(res);
    } catch (err) {
      setTrackingData(null);
      setErrorMsg(err.message || 'No tracking information found for this order number.');
    } finally {
      setLoading(false);
    }
  };

  const statusMilestones = [
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Cutting & Stitching' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStatus = trackingData?.order?.status || '';
  const currentIdx = statusMilestones.findIndex(m => m.key === currentStatus);

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Live Logistics & Atelier Progress</span>
              <h1 className="portal-main-title font-serif">Track Your Bespoke Order</h1>
            </div>
          </div>

          {/* Search Box Card */}
          <div className="track-search-card studio-card">
            <h3 className="track-search-title font-serif">Enter Order Number</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchOrder();
              }}
              className="track-search-form"
            >
              <div className="search-input-wrap">
                <Compass size={20} className="track-icon" />
                <input
                  type="text"
                  placeholder="e.g. TN-123456-789"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="form-input with-icon"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                <span>{loading ? 'Locating...' : 'Track Progress'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {loading ? (
            <LoadingSpinner text="Checking live atelier tracking records..." size="large" />
          ) : errorMsg ? (
            <div className="alert alert-error animate-fade">
              <span>{errorMsg}</span>
            </div>
          ) : trackingData ? (
            <div className="tracking-results-wrap animate-fade">
              {/* Order Status Header */}
              <div className="track-status-banner studio-card">
                <div className="track-banner-left">
                  <div className="track-garment-icon">
                    <Truck size={24} />
                  </div>
                  <div>
                    <span className="track-order-no">Order #{trackingData.order.order_number}</span>
                    <h2 className="track-garment-title font-serif">{trackingData.order.garment_type}</h2>
                  </div>
                </div>

                <div className="track-banner-right">
                  <StatusBadge status={trackingData.order.status} />
                </div>
              </div>

              {/* Visual Progress Stepper */}
              <div className="milestone-stepper-card studio-card">
                <h3 className="card-section-title font-serif">Stitching Milestones</h3>

                <div className="milestones-track">
                  {statusMilestones.map((m, idx) => {
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <div
                        key={m.key}
                        className={`milestone-node ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className="node-marker">
                          {isPassed ? <CheckCircle2 size={16} /> : <div className="dot" />}
                        </div>
                        <span className="node-label">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping & Delivery Details */}
              <div className="grid-2">
                <div className="details-card studio-card">
                  <h3 className="card-section-title font-serif">
                    <Truck size={18} /> Logistics Details
                  </h3>
                  <div className="specs-list">
                    <div className="spec-item">
                      <span className="spec-label">Carrier / Courier</span>
                      <span className="spec-val">{trackingData.order.carrier || 'Express Atelier Dispatch'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Tracking Airway Bill (AWB)</span>
                      <span className="spec-val font-bold text-rose">
                        {trackingData.order.tracking_number || 'Will be assigned upon dispatch'}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Estimated Delivery</span>
                      <span className="spec-val">
                        {trackingData.order.expected_delivery_date
                          ? new Date(trackingData.order.expected_delivery_date).toLocaleDateString()
                          : '4 - 6 Business Days'}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Delivery Address</span>
                      <span className="spec-val">
                        {trackingData.order.delivery_address}, {trackingData.order.delivery_city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chronological Event Log */}
                <div className="details-card studio-card">
                  <h3 className="card-section-title font-serif">
                    <Clock size={18} /> Chronological Tracking Events
                  </h3>

                  {(trackingData.trackingEvents || []).length === 0 ? (
                    <p className="text-muted">No shipment transit events logged yet. Order is currently in studio preparation.</p>
                  ) : (
                    <div className="history-timeline">
                      {trackingData.trackingEvents.map((evt, i) => (
                        <div key={evt.id || i} className="timeline-item">
                          <div className="timeline-marker">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="timeline-body">
                            <div className="timeline-title-row">
                              <span className="timeline-status">{evt.status.replace(/_/g, ' ')}</span>
                              <span className="timeline-time">{new Date(evt.event_time).toLocaleString()}</span>
                            </div>
                            <p className="timeline-notes">
                              <strong>{evt.location}</strong> - {evt.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : searched ? (
            <EmptyState
              icon={Compass}
              title="No tracking info"
              description="Please check that the order number matches your invoice (e.g. TN-123456-789)."
            />
          ) : (
            <div className="tracking-placeholder studio-card text-center py-5">
              <Compass size={48} className="text-rose mb-3" />
              <h3 className="font-serif">Live Real-Time Atelier Tracking</h3>
              <p className="text-muted max-w-md mx-auto">
                Enter your unique order number above to view cutting, stitching, trial, and courier milestones.
              </p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .track-search-card {
          padding: 2rem;
          background: #ffffff;
        }
        .track-search-title {
          font-size: 1.35rem;
          margin-bottom: 1rem;
        }
        .track-search-form {
          display: flex;
          gap: 1rem;
          max-width: 600px;
        }
        .search-input-wrap {
          position: relative;
          flex: 1;
        }
        .track-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }
        .tracking-results-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .track-status-banner {
          padding: 1.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
        }
        .track-banner-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .track-garment-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .track-order-no {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .track-garment-title {
          font-size: 1.6rem;
          margin-top: 0.15rem;
        }
        .milestone-stepper-card {
          padding: 2rem;
          background: #ffffff;
        }
        .milestones-track {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 1.5rem;
          padding: 0 1rem;
        }
        .milestones-track::before {
          content: '';
          position: absolute;
          left: 2rem;
          right: 2rem;
          top: 15px;
          height: 3px;
          background: var(--border-color);
          z-index: 1;
        }
        .milestone-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        .node-marker {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--bg-main);
          border: 2px solid var(--border-color);
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .node-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: center;
          max-width: 90px;
        }
        .milestone-node.passed .node-marker {
          background: var(--success);
          border-color: var(--success);
          color: #ffffff;
        }
        .milestone-node.passed .node-label {
          color: var(--text-main);
        }
        .milestone-node.current .node-marker {
          background: var(--deep-rose);
          border-color: var(--deep-rose);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(168, 63, 98, 0.4);
        }
        .milestone-node.current .node-label {
          color: var(--deep-rose);
          font-weight: 700;
        }
        .max-w-md { max-width: 440px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        @media (max-width: 768px) {
          .milestones-track {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }
          .milestones-track::before {
            display: none;
          }
          .milestone-node {
            flex-direction: row;
            gap: 1rem;
          }
          .node-label { max-width: none; text-align: left; }
        }
      `}</style>
    </div>
  );
}
