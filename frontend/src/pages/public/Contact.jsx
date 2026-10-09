import React, { useState } from 'react';
import { submitContact } from '../../services/contactService';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitContact(formData);
      setSuccessMsg(res.message || 'Thank you! Your message has been sent to our master tailors.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container text-center">
          <span className="section-tag">Studio Desk & Consultations</span>
          <h1 className="page-title font-serif">Get in Touch with Our Atelier</h1>
          <p className="page-subtitle">
            Have questions about custom bridal blouses, fabric compatibility, or order delivery? We would love to assist you.
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="contact-grid grid-2">
          {/* Contact Details Card */}
          <div className="contact-info-card studio-card">
            <h2 className="info-title font-serif">Visit or Contact Our Studio</h2>
            <p className="info-desc">
              Our master artisans are available for consultation, fabric discussions, and fitting appointments.
            </p>

            <div className="info-items-list">
              <div className="info-item">
                <div className="info-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="item-label">Studio Address</h4>
                  <p className="item-value">Shop 12, Blossom Lane, Fashion District, Bengaluru, Karnataka 560001</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="item-label">Direct Hotline</h4>
                  <p className="item-value">+91 98765 43210</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="item-label">Concierge Email</h4>
                  <p className="item-value">support@tailornotebook.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="item-label">Studio Operating Hours</h4>
                  <p className="item-value">Monday to Saturday: 10:00 AM – 8:30 PM (Sunday by Appointment)</p>
                </div>
              </div>
            </div>

            <div className="whatsapp-help-box mt-4">
              <MessageCircle size={22} className="text-success" />
              <div>
                <h4 className="wa-title">Need Instant Sizing Help?</h4>
                <p className="wa-desc">Connect with our master pattern cutter on WhatsApp for quick fitting advice.</p>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="contact-form-card studio-card">
            <h2 className="form-heading font-serif">Send Us a Message</h2>
            <p className="form-sub">We usually respond within 2 to 4 hours during business days.</p>

            {successMsg && (
              <div className="alert alert-success animate-fade mb-3">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-error animate-fade mb-3">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="priya@example.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 00000"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Bridal Blouse Customization Query"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Message / Requirement *</label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your garment style, fabric, or delivery timeline..."
                  className="form-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-block mt-2"
              >
                <Send size={16} />
                <span>{loading ? 'Sending Message...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .contact-hero {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          padding: 4rem 0 3.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .contact-info-card, .contact-form-card {
          padding: 2.5rem;
          background: #ffffff;
        }
        .info-title, .form-heading {
          font-size: 1.85rem;
          margin-bottom: 0.5rem;
        }
        .info-desc, .form-sub {
          font-size: 0.925rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .info-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .info-icon {
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
        .item-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }
        .item-value {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .whatsapp-help-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #E8F5E9;
          border: 1px solid #C8E6C9;
          padding: 1.25rem;
          border-radius: var(--radius-md);
        }
        .wa-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #2E7D32;
        }
        .wa-desc {
          font-size: 0.8rem;
          color: #388E3C;
        }
        .alert {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .alert-success {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid #A5D6A7;
        }
        .alert-error {
          background: var(--error-bg);
          color: var(--error);
          border: 1px solid #FFCDD2;
        }
        .mb-3 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
