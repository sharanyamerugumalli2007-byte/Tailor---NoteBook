import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../../services/serviceService';
import { LoadingSpinner } from '../../components/CommonComponents';
import {
  Scissors,
  Sparkles,
  Ruler,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Truck,
  Heart,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data.slice(0, 6)))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Select Garment & Style',
      desc: 'Browse bespoke blouses, kurtis, gowns, suits, and bottomwear with endless neck and sleeve customizations.',
      icon: Scissors
    },
    {
      num: '02',
      title: 'Provide Measurements',
      desc: 'Save your precise body measurements or pick standard sizes with our interactive size recommendation tool.',
      icon: Ruler
    },
    {
      num: '03',
      title: 'Quick UPI Advance',
      desc: 'Confirm your tailoring slot with an instant UPI advance payment verified directly by our studio team.',
      icon: ShieldCheck
    },
    {
      num: '04',
      title: 'Track & Doorstep Fit',
      desc: 'Watch your garment progress through cutting, stitching, and trial stages right to your doorstep.',
      icon: Truck
    }
  ];

  const features = [
    {
      title: '100% Master Fit Guarantee',
      desc: 'Every garment is handcrafted by master tailors with double-stitched seams and generous alteration margins.',
      icon: ShieldCheck
    },
    {
      title: 'Real-time Stitching Timeline',
      desc: 'No more guessing or endless phone calls. Follow cutting, stitching, and dispatch updates on your phone.',
      icon: Clock
    },
    {
      title: 'Saved Measurement Vault',
      desc: 'Store multiple measurement profiles for yourself, family members, or specific garment styles.',
      icon: Ruler
    },
    {
      title: 'Express Doorstep Delivery',
      desc: 'Enjoy swift, safe delivery across the city with real-time tracking number and carrier updates.',
      icon: Truck
    }
  ];

  const testimonials = [
    {
      name: 'Ananya Deshmukh',
      role: 'Bridal Client',
      comment: 'My wedding blouse fit like an absolute dream! The sweetheart neckline and padded finishing were flawless. The tracking updates gave me complete peace of mind.',
      rating: 5,
      avatar: 'A'
    },
    {
      name: 'Meera Krishnan',
      role: 'Regular Customer',
      comment: 'Tailor Notebook changed how I get my kurtis and trousers stitched. I uploaded my measurements once, and every single order fits perfectly without repeat visits.',
      rating: 5,
      avatar: 'M'
    },
    {
      name: 'Shreya Patel',
      role: 'Corporate Professional',
      comment: 'The UPI advance payment and digital invoice made everything so transparent. Outstanding stitching quality and arrived two days before the estimated date!',
      rating: 5,
      avatar: 'S'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content animate-fade">
            <div className="hero-badge">
              <Sparkles size={15} />
              <span>Modern Bespoke Tailoring Studio</span>
            </div>
            <h1 className="hero-title">
              Your Perfect Fit, <br />
              <span className="text-gradient">Made Simple.</span>
            </h1>
            <p className="hero-desc">
              Experience the elegance of handcrafted bespoke tailoring from the comfort of your home.
              Custom blouses, designer dresses, kurtis, suits, and alterations tailored to your exact measurements with real-time tracking.
            </p>
            <div className="hero-cta-group">
              <Link to="/customer/orders/new" className="btn btn-primary btn-lg">
                <Scissors size={18} />
                <span>Get Started & Order</span>
              </Link>
              <Link to="/services" className="btn btn-secondary btn-lg">
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">5,000+</span>
                <span className="stat-label">Garments Tailored</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">99.4%</span>
                <span className="stat-label">First-Time Fit Rate</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">4.9 ★</span>
                <span className="stat-label">Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card studio-card glow-effect">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
                alt="Tailoring craftsmanship atelier"
                className="hero-main-img"
              />
              <div className="floating-badge top-right">
                <CheckCircle2 size={16} className="text-success" />
                <span>Master Artisan Certified</span>
              </div>
              <div className="floating-badge bottom-left">
                <Ruler size={16} className="text-rose" />
                <span>Precision 0.25" Tolerances</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Our Atelier Craft</span>
            <h2 className="section-title">Popular Tailoring Services</h2>
            <p className="section-desc">
              From traditional bridal blouses to sharp modern silhouettes, crafted with meticulous attention to detail.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading studio services..." />
          ) : (
            <div className="grid-3">
              {services.map((service) => (
                <div key={service.id} className="service-card studio-card">
                  <div className="service-img-wrap">
                    <img
                      src={service.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={service.name}
                      className="service-img"
                    />
                    <span className="turnaround-badge">
                      <Clock size={12} /> {service.estimated_days} Days Turnaround
                    </span>
                  </div>
                  <div className="service-content">
                    <h3 className="service-name font-serif">{service.name}</h3>
                    <p className="service-desc">{service.short_description}</p>
                    <div className="service-footer">
                      <div className="service-price">
                        <span className="price-label">Starting from</span>
                        <span className="price-val">₹{Number(service.base_price).toFixed(2)}</span>
                      </div>
                      <div className="service-buttons">
                        <Link to={`/services/${service.id}`} className="btn btn-outline btn-sm">
                          Details
                        </Link>
                        <Link
                          to={`/customer/orders/new?serviceId=${service.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/services" className="btn btn-secondary btn-lg">
              <span>View All Services & Pricing</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Seamless Journey</span>
            <h2 className="section-title">How Tailor Notebook Works</h2>
            <p className="section-desc">
              Four effortless steps between your design vision and your custom tailored garment.
            </p>
          </div>

          <div className="grid-4 steps-grid">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="step-card studio-card">
                  <span className="step-num">{step.num}</span>
                  <div className="step-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-info">
              <span className="section-tag">The Studio Advantage</span>
              <h2 className="section-title">Tailoring Perfection Meets Digital Convenience</h2>
              <p className="section-desc mb-4">
                We combine generations of sartorial heritage with intuitive modern technology, making bespoke tailoring as effortless as ordering your favorite coffee.
              </p>

              <div className="features-list">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="feature-item">
                      <div className="feature-icon-wrap">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="feature-title">{f.title}</h4>
                        <p className="feature-desc">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="why-visual">
              <div className="why-image-card studio-card">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                  alt="Tailoring fabric patterns"
                  className="why-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Client Love</span>
            <h2 className="section-title">What Our Patrons Say</h2>
            <p className="section-desc">
              Real reviews from real women who trust Tailor Notebook for their wardrobe essentials.
            </p>
          </div>

          <div className="grid-3">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card studio-card">
                <div className="stars-row">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="star-icon" fill="#D99A24" color="#D99A24" />
                  ))}
                </div>
                <p className="testimonial-comment">"{t.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <h4 className="author-name">{t.name}</h4>
                    <span className="author-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner studio-card">
            <div className="cta-content">
              <h2 className="cta-title font-serif">Ready for Your Perfect Silhouette?</h2>
              <p className="cta-desc">
                Begin your bespoke journey today. Select your garment style, enter your measurements, and let our master tailors create magic.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <Sparkles size={18} />
                  <span>Create Account & Stitch Now</span>
                </Link>
                <Link to="/size-guide" className="btn btn-secondary btn-lg">
                  <span>View Size & Fit Guide</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 5rem 0 4rem 0;
          background: radial-gradient(circle at 80% 20%, #FCE4EC 0%, #FFF8FA 70%);
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 4rem;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-weight: 700;
          font-size: 0.825rem;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.15;
          margin-bottom: 1.5rem;
        }
        .text-gradient {
          background: linear-gradient(135deg, var(--deep-rose) 0%, var(--rose-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 2.25rem;
          max-width: 580px;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-num {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--deep-rose);
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border-color);
        }
        .hero-visual {
          position: relative;
        }
        .hero-image-card {
          position: relative;
          padding: 0.75rem;
          border-radius: var(--radius-xl);
          background: #ffffff;
        }
        .hero-main-img {
          width: 100%;
          height: 480px;
          object-fit: cover;
          border-radius: var(--radius-lg);
          display: block;
        }
        .floating-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 0.6rem 1.1rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-main);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }
        .floating-badge.top-right {
          top: 2rem;
          right: -1rem;
        }
        .floating-badge.bottom-left {
          bottom: 2rem;
          left: -1rem;
        }
        .text-success { color: var(--success); }
        .text-rose { color: var(--deep-rose); }

        .section {
          padding: 5rem 0;
        }
        .section-header {
          max-width: 620px;
          margin: 0 auto 3.5rem auto;
        }
        .text-center { text-align: center; }
        .section-tag {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--rose-accent);
          margin-bottom: 0.5rem;
        }
        .section-title {
          font-size: 2.35rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
        }
        .section-desc {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .service-card {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          height: 100%;
        }
        .service-img-wrap {
          position: relative;
          height: 220px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .service-card:hover .service-img {
          transform: scale(1.05);
        }
        .turnaround-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--deep-rose);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .service-content {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .service-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .service-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.5rem;
          flex: 1;
        }
        .service-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .service-price {
          display: flex;
          flex-direction: column;
        }
        .price-label {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .price-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--deep-rose);
        }
        .service-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .how-it-works-section {
          background: #ffffff;
        }
        .step-card {
          position: relative;
          padding: 2rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .step-num {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-pink);
          opacity: 0.5;
        }
        .step-icon-wrap {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .step-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.65rem;
        }
        .step-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        .why-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
          align-items: center;
        }
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .feature-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .feature-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .why-img {
          width: 100%;
          height: 460px;
          object-fit: cover;
          border-radius: var(--radius-lg);
        }

        .testimonial-card {
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }
        .stars-row {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        .testimonial-comment {
          font-size: 0.95rem;
          color: var(--text-main);
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 1.5rem;
          flex: 1;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .author-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--primary-pink);
          color: #ffffff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .author-name {
          font-size: 0.925rem;
          font-weight: 700;
        }
        .author-role {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        .cta-banner {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          border: 2px solid var(--border-color);
          padding: 4rem 2rem;
          text-align: center;
          border-radius: var(--radius-xl);
        }
        .cta-content {
          max-width: 680px;
          margin: 0 auto;
        }
        .cta-title {
          font-size: 2.6rem;
          font-weight: 700;
          color: var(--deep-rose);
          margin-bottom: 1rem;
        }
        .cta-desc {
          font-size: 1.05rem;
          color: var(--text-main);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .mt-5 { margin-top: 2.5rem; }
        .mb-4 { margin-bottom: 1.5rem; }

        @media (max-width: 992px) {
          .hero-container, .why-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .hero-title { font-size: 2.75rem; }
          .hero-main-img { height: 360px; }
        }
      `}</style>
    </div>
  );
}
