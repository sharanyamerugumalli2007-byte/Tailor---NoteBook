import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceById } from '../../services/serviceService';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import {
  Scissors,
  Clock,
  CheckCircle2,
  Ruler,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getServiceById(id)
      .then((data) => setService(data))
      .catch((err) => setError(err.message || 'Failed to load service details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading service specifications..." size="large" />;
  if (error || !service) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem' }}>
        <EmptyState
          title="Service Not Found"
          description={error || "We couldn't locate the requested tailoring service."}
          actionText="Back to Catalog"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const customizationHighlights = [
    'Custom neck designs (Sweetheart, Boat neck, V-Neck, Collar, Keyhole, Halter)',
    'Sleeve style options (Full sleeve, Elbow, Sleeveless, Puff sleeve, Bell sleeve)',
    'Padding & Lining customization (Pure cotton breathable lining, soft cups)',
    'Reinforced internal seam allowances for effortless future alterations (up to 2 inches)',
    'Can-can flare additions & custom piping trims available'
  ];

  const measurementGuideList = [
    'Chest / Bust measurement across highest point',
    'Natural Waist & High Hip circumference',
    'Shoulder width from bone to bone',
    'Sleeve length and Armhole circumference',
    'Total desired garment length from shoulder to hem'
  ];

  return (
    <div className="service-details-page">
      <div className="container py-5">
        <Link to="/services" className="back-link mb-4">
          <ArrowLeft size={16} />
          <span>Back to All Tailoring Services</span>
        </Link>

        <div className="details-layout">
          {/* Left Column: Imagery & Guarantee */}
          <div className="details-visual-col">
            <div className="service-main-image-card studio-card">
              <img
                src={service.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                alt={service.name}
                className="service-large-img"
              />
              <div className="image-turnaround-badge">
                <Clock size={16} />
                <span>Estimated Turnaround: {service.estimated_days} Business Days</span>
              </div>
            </div>

            <div className="trust-box studio-card mt-4">
              <div className="trust-item">
                <ShieldCheck size={24} className="text-rose" />
                <div>
                  <h4 className="trust-title">100% Fit Guarantee</h4>
                  <p className="trust-desc">Complimentary studio alteration within 7 days if fitting requires fine-tuning.</p>
                </div>
              </div>
              <div className="trust-item mt-3">
                <Sparkles size={24} className="text-rose" />
                <div>
                  <h4 className="trust-title">Artisan Craftsmanship</h4>
                  <p className="trust-desc">Hand-finished hemlines, high-tensile threads, and premium cotton linings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Service Specifications & Order CTA */}
          <div className="details-info-col">
            <div className="info-card studio-card">
              <span className="section-tag">{service.category} Atelier</span>
              <h1 className="service-main-title font-serif">{service.name}</h1>

              <div className="price-box">
                <span className="price-title">Base Tailoring Fee:</span>
                <span className="price-number">₹{Number(service.base_price).toFixed(2)}</span>
                <span className="price-note">(Includes standard lining, stitching & pressing)</span>
              </div>

              <p className="service-full-desc">{service.description || service.short_description}</p>

              <div className="spec-section">
                <h3 className="spec-heading">
                  <Layers size={18} /> Customization Highlights
                </h3>
                <ul className="spec-list">
                  {customizationHighlights.map((item, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} className="spec-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="spec-section">
                <h3 className="spec-heading">
                  <Ruler size={18} /> Required Measurements
                </h3>
                <ul className="spec-list">
                  {measurementGuideList.map((item, i) => (
                    <li key={i}>
                      <ChevronRight size={16} className="spec-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cta-action-panel">
                <Link
                  to={`/customer/orders/new?serviceId=${service.id}`}
                  className="btn btn-primary btn-lg btn-block"
                >
                  <Scissors size={18} />
                  <span>Start Custom Order for {service.name}</span>
                </Link>
                <p className="cta-footnote text-center">
                  You can provide your fabric or select tailor-provided fabric during order placement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .service-details-page {
          padding-bottom: 5rem;
        }
        .py-5 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mt-4 { margin-top: 1.5rem; }
        .mt-3 { margin-top: 1rem; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--deep-rose);
        }
        .details-layout {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 3rem;
          align-items: flex-start;
        }
        .service-main-image-card {
          padding: 0.75rem;
          position: relative;
        }
        .service-large-img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          border-radius: var(--radius-md);
          display: block;
        }
        .image-turnaround-badge {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(6px);
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--deep-rose);
          box-shadow: var(--shadow-sm);
        }
        .trust-box {
          padding: 1.5rem;
          background: #ffffff;
        }
        .trust-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .trust-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .trust-desc {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .info-card {
          padding: 2.5rem;
          background: #ffffff;
        }
        .service-main-title {
          font-size: 2.4rem;
          margin: 0.4rem 0 1.25rem 0;
        }
        .price-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.75rem;
        }
        .price-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .price-number {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--deep-rose);
        }
        .price-note {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .service-full-desc {
          font-size: 1rem;
          color: var(--text-main);
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .spec-section {
          margin-bottom: 2rem;
        }
        .spec-heading {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .spec-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .spec-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .spec-icon {
          color: var(--rose-accent);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .cta-action-panel {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .cta-footnote {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-top: 0.85rem;
        }
        @media (max-width: 992px) {
          .details-layout {
            grid-template-columns: 1fr;
          }
          .service-large-img { height: 350px; }
        }
      `}</style>
    </div>
  );
}
