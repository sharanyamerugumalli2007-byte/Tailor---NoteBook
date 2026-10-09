import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../../services/serviceService';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { Scissors, Search, Clock, ArrowRight, Filter, Sparkles } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'blouse', label: 'Custom Blouses' },
    { id: 'dress', label: 'Dresses & Gowns' },
    { id: 'kurti', label: 'Kurtis & Tunics' },
    { id: 'alteration', label: 'Alterations & Repairs' },
    { id: 'bottomwear', label: 'Trousers & Pants' },
    { id: 'skirt', label: 'Lehenga & Skirts' },
    { id: 'suit', label: 'Suits & Salwars' },
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = () => {
    setLoading(true);
    getServices({ category: selectedCategory })
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  const filteredServices = services.filter((s) => {
    if (!search) return true;
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.short_description || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="services-page">
      <div className="services-header-hero">
        <div className="container text-center">
          <span className="section-tag">Bespoke Atelier Offerings</span>
          <h1 className="page-title font-serif">Tailoring Services & Pricing</h1>
          <p className="page-subtitle">
            Explore our artisanal tailoring services. Each garment is meticulously crafted to your bespoke body measurements with guaranteed perfection.
          </p>
        </div>
      </div>

      <div className="container content-wrap">
        {/* Filters & Search */}
        <div className="filter-bar studio-card">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search tailoring styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching atelier catalog..." size="large" />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            title="No tailoring services found"
            description="Try changing your search term or selecting another category filter."
            actionText="Reset Filters"
            onAction={() => { setSelectedCategory('all'); setSearch(''); }}
          />
        ) : (
          <div className="grid-3 services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="service-item-card studio-card">
                <div className="service-img-container">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                    alt={service.name}
                    className="service-card-img"
                  />
                  <div className="turnaround-tag">
                    <Clock size={13} />
                    <span>{service.estimated_days} Days Turnaround</span>
                  </div>
                </div>

                <div className="service-card-body">
                  <span className="category-label">{service.category}</span>
                  <h3 className="service-title font-serif">{service.name}</h3>
                  <p className="service-text">{service.short_description || service.description}</p>

                  <div className="service-card-bottom">
                    <div className="price-tag-wrap">
                      <span className="starting-text">Stitching from</span>
                      <span className="service-price-amount">₹{Number(service.base_price).toFixed(2)}</span>
                    </div>

                    <div className="actions-cluster">
                      <Link to={`/services/${service.id}`} className="btn btn-outline btn-sm">
                        Details
                      </Link>
                      <Link
                        to={`/customer/orders/new?serviceId=${service.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Scissors size={14} />
                        <span>Order Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .services-header-hero {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          padding: 4rem 0 3.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .page-title {
          font-size: 2.85rem;
          margin-bottom: 0.75rem;
        }
        .page-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .content-wrap {
          padding-top: 2.5rem;
          padding-bottom: 5rem;
        }
        .filter-bar {
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding: 1.25rem 1.5rem;
        }
        .category-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .cat-pill {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-pill:hover {
          border-color: var(--rose-accent);
          color: var(--deep-rose);
        }
        .cat-pill.active {
          background: var(--deep-rose);
          color: #ffffff;
          border-color: var(--deep-rose);
        }
        .search-box {
          position: relative;
          min-width: 260px;
        }
        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }
        .search-input {
          width: 100%;
          padding: 0.55rem 1rem 0.55rem 2.4rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          font-size: 0.875rem;
          outline: none;
          background: #ffffff;
        }
        .search-input:focus {
          border-color: var(--rose-accent);
        }
        .service-item-card {
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          height: 100%;
        }
        .service-img-container {
          position: relative;
          height: 240px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .service-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .service-item-card:hover .service-card-img {
          transform: scale(1.05);
        }
        .turnaround-tag {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--deep-rose);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .service-card-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .category-label {
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--rose-accent);
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .service-title {
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
        }
        .service-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.5rem;
          flex: 1;
        }
        .service-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.15rem;
          border-top: 1px solid var(--border-color);
        }
        .price-tag-wrap {
          display: flex;
          flex-direction: column;
        }
        .starting-text {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .service-price-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--deep-rose);
        }
        .actions-cluster {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
