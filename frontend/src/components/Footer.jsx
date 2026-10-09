import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Heart, Phone, Mail, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="studio-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="logo-icon-wrap">
                <Scissors size={20} />
              </div>
              <span className="brand-name">Tailor Notebook</span>
            </div>
            <p className="footer-desc">
              Your modern digital bespoke tailoring studio. Celebrating bespoke silhouettes, master fitting, custom embellishments, and seamless online order tracking.
            </p>
            <div className="trust-pills">
              <span className="trust-pill"><ShieldCheck size={14} /> 100% Fit Guarantee</span>
              <span className="trust-pill"><Sparkles size={14} /> Master Artisans</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Atelier Services</h4>
            <ul className="footer-links">
              <li><Link to="/services">Custom Blouse Stitching</Link></li>
              <li><Link to="/services">Designer Gowns & Dresses</Link></li>
              <li><Link to="/services">Kurti & Tunic Tailoring</Link></li>
              <li><Link to="/services">Saree Blouse Alterations</Link></li>
              <li><Link to="/services">Trousers & Bottomwear</Link></li>
              <li><Link to="/services">Suit & Salwar Sets</Link></li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Atelier</Link></li>
              <li><Link to="/size-guide">Interactive Size Guide</Link></li>
              <li><Link to="/about">Our Craftsmanship</Link></li>
              <li><Link to="/contact">Studio Consultation</Link></li>
              <li><Link to="/login">Customer Login</Link></li>
              <li><Link to="/admin/login">Admin Desk</Link></li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Studio Desk</h4>
            <div className="contact-list">
              <div className="contact-item">
                <MapPin size={16} className="contact-icon" />
                <span>Shop 12, Blossom Lane, Fashion District, Bengaluru 560001</span>
              </div>
              <div className="contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <Mail size={16} className="contact-icon" />
                <span>support@tailornotebook.com</span>
              </div>
              <div className="contact-item">
                <Clock size={16} className="contact-icon" />
                <span>Mon – Sat: 10:00 AM – 8:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tailor Notebook Atelier. All rights reserved.</p>
          <p className="made-with">
            Crafted with <Heart size={14} className="heart-icon" /> for perfect bespoke fits.
          </p>
        </div>
      </div>

      <style>{`
        .studio-footer {
          background: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: 4.5rem 0 2rem 0;
          margin-top: 5rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1.2fr 1.8fr;
          gap: 3rem;
          margin-bottom: 3.5rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .footer-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 1.25rem;
        }
        .trust-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
        }
        .footer-heading {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-links a {
          font-size: 0.875rem;
          color: var(--text-muted);
          transition: color 0.2s, transform 0.2s;
          display: inline-block;
        }
        .footer-links a:hover {
          color: var(--rose-accent);
          transform: translateX(3px);
        }
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .contact-icon {
          color: var(--rose-accent);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .made-with {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .heart-icon {
          color: var(--rose-accent);
          fill: var(--rose-accent);
        }
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
