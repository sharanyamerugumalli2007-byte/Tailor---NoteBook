import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Heart, ShieldCheck, Award, Clock, Users, ArrowRight } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      title: 'Generations of Sartorial Heritage',
      desc: 'Our master pattern cutters have decades of experience in traditional and contemporary silhouette craftsmanship.',
      icon: Award
    },
    {
      title: 'Digital Accuracy & Transparency',
      desc: 'Say goodbye to lost paper notebooks. Your measurements, status milestones, and payment histories are safely vaulted.',
      icon: ShieldCheck
    },
    {
      title: 'Zero Fitting Compromise',
      desc: 'Every garment is stitched with generous 1.5 - 2 inch inner margins and comes with complimentary fitting adjustments.',
      icon: Heart
    }
  ];

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container text-center">
          <span className="section-tag">Our Atelier Story</span>
          <h1 className="page-title font-serif">The Art of Bespoke Tailoring</h1>
          <p className="page-subtitle">
            Tailor Notebook was founded to bridge classic bespoke craftsmanship with effortless digital convenience.
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="about-split grid-2 mb-5">
          <div className="about-image-card studio-card">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
              alt="Atelier sewing machine"
              className="about-img"
            />
          </div>
          <div className="about-text-content">
            <span className="section-tag">Our Mission</span>
            <h2 className="about-heading font-serif">Making Every Silhouette Feel Like It Was Made Just For You</h2>
            <p className="about-paragraph">
              Off-the-rack clothing often forces compromise on sleeve length, bust darts, or waist fit. At Tailor Notebook, we believe custom tailoring should never be cumbersome.
            </p>
            <p className="about-paragraph">
              We empower customers to save their exact measurements online, browse designer styles, submit custom stitching orders, and follow their garment’s journey step-by-step from fabric cutting to doorstep delivery.
            </p>
            <div className="about-badges-row">
              <div className="about-badge-item">
                <span className="badge-num">100%</span>
                <span className="badge-lbl">Bespoke Fit</span>
              </div>
              <div className="about-badge-item">
                <span className="badge-num">5000+</span>
                <span className="badge-lbl">Happy Patrons</span>
              </div>
              <div className="about-badge-item">
                <span className="badge-num">15+</span>
                <span className="badge-lbl">Artisan Craftsmen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="pillars-section mb-5">
          <div className="section-header text-center">
            <span className="section-tag">Atelier Philosophy</span>
            <h2 className="section-title">Why Patrons Trust Tailor Notebook</h2>
          </div>
          <div className="grid-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="pillar-card studio-card">
                  <div className="pillar-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="pillar-title">{p.title}</h3>
                  <p className="pillar-desc">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta-card studio-card text-center">
          <h2 className="font-serif about-cta-title">Experience Tailored Excellence</h2>
          <p className="about-cta-desc">Join thousands of customers who enjoy hassle-free bespoke tailoring.</p>
          <Link to="/customer/orders/new" className="btn btn-primary btn-lg mt-3">
            <Scissors size={18} />
            <span>Place Your First Custom Order</span>
          </Link>
        </div>
      </div>

      <style>{`
        .about-hero {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          padding: 4rem 0 3.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .about-split {
          align-items: center;
          gap: 3.5rem;
        }
        .about-image-card {
          padding: 0.75rem;
        }
        .about-img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .about-heading {
          font-size: 2.2rem;
          margin: 0.5rem 0 1.25rem 0;
          line-height: 1.25;
        }
        .about-paragraph {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .about-badges-row {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .about-badge-item {
          display: flex;
          flex-direction: column;
        }
        .badge-num {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--deep-rose);
          line-height: 1;
        }
        .badge-lbl {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .pillar-card {
          padding: 2.25rem 1.75rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .pillar-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .pillar-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.65rem;
        }
        .pillar-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
        }
        .about-cta-card {
          padding: 3.5rem 2rem;
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          border: 1px solid var(--border-color);
        }
        .about-cta-title {
          font-size: 2.2rem;
          color: var(--deep-rose);
          margin-bottom: 0.5rem;
        }
        .about-cta-desc {
          font-size: 1rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
