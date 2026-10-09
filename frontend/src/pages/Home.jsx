import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { IMAGE_CONFIG, GARMENT_OPTIONS } from '../utils/imageConfig';
import { useAuth } from '../context/AuthContext';
import {
  Scissors,
  Sparkles,
  Ruler,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Star,
  ArrowRight,
  PlusCircle,
  Package,
  Search,
  Clock,
  Heart,
  Layers,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      navigate(`/track-order?id=${encodeURIComponent(trackingIdInput.trim())}`);
    }
  };

  const services = [
    {
      title: 'Bridal & Designer Blouses',
      desc: 'Princess cut, heavy zardozi embroidery, deep neck cuts, padded perfection with custom latkans.',
      price: 'From ₹1,200',
      image: IMAGE_CONFIG.blouse,
      tag: 'Bestseller'
    },
    {
      title: 'Bespoke Suits & Bandhgalas',
      desc: 'Handcrafted formal 2-piece and 3-piece suits, tuxedos, and royal bandhgalas with canvas lining.',
      price: 'From ₹8,500',
      image: IMAGE_CONFIG.suit,
      tag: 'Luxury'
    },
    {
      title: 'Bridal Lehengas & Anarkalis',
      desc: 'Grand flare lehengas with can-can skirts, hand-sequined cholis, and custom dupatta draping.',
      price: 'From ₹6,500',
      image: IMAGE_CONFIG.lehenga,
      tag: 'Couture'
    },
    {
      title: 'Ethnic Kurtas & Salwar Sets',
      desc: 'Pure linen and silk kurtas, tailored churidars, straight trousers, and festive daily elegance.',
      price: 'From ₹1,500',
      image: IMAGE_CONFIG.kurti,
      tag: 'Popular'
    },
    {
      title: 'Bespoke Dresses & Gowns',
      desc: 'Contemporary western and Indo-western evening silhouettes, bodycon fits, and flared gowns.',
      price: 'From ₹2,800',
      image: IMAGE_CONFIG.dress,
      tag: 'Modern'
    },
    {
      title: 'Express 48h Alteration & Fit',
      desc: 'Neckline modifications, waist tapering, hem shortening, and size upgrades by master tailors.',
      price: 'From ₹350',
      image: IMAGE_CONFIG.sewingMachine,
      tag: 'Express'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Choose Garment & Style',
      desc: 'Select from blouses, lehengas, suits, or upload your own Pinterest reference image.',
      icon: Scissors
    },
    {
      step: '02',
      title: 'Submit Body Measurements',
      desc: 'Enter custom measurements easily or pick from your saved digital profiles.',
      icon: Ruler
    },
    {
      step: '03',
      title: 'Master Tailor Crafting',
      desc: 'Our artisans cut, stitch, and handcraft your garment with transparent milestone updates.',
      icon: Sparkles
    },
    {
      step: '04',
      title: 'Doorstep Delivery & Trial',
      desc: 'Receive your perfectly ironed outfit right at your home with guaranteed 100% fit.',
      icon: Truck
    }
  ];

  const reviews = [
    {
      name: 'Anusha Sharma',
      role: 'Bridal Client, Bengaluru',
      rating: 5,
      comment: 'The bridal blouse fitting was flawless! The maggam embroidery and neckline sat perfectly without needing a single alteration. Tracking every stage online was so reassuring.',
      avatar: IMAGE_CONFIG.avatarFemale
    },
    {
      name: 'Rajesh Kumar',
      role: 'Executive, Indiranagar',
      rating: 5,
      comment: 'Ordered a bespoke 2-piece navy suit. The shoulder padding and trouser break were tailored to absolute perfection. Best tailoring platform I have ever used.',
      avatar: IMAGE_CONFIG.avatarMale
    },
    {
      name: 'Priya Nair',
      role: 'Fashion Designer, Koramangala',
      rating: 5,
      comment: 'Saved measurements feature makes placing recurring orders so effortless. TailorCraft is a game-changer for custom clothing!',
      avatar: IMAGE_CONFIG.avatarFemale
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffffff 40%, #fdf2f8 100%)',
        padding: '5rem 2rem 6rem',
        borderBottom: '1px solid var(--pink-border)',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Glows */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 207, 232, 0.6) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 205, 211, 0.5) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          {/* Left Text Column */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--pink-soft)',
              border: '1px solid var(--pink-border)',
              color: 'var(--rose-dark)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={16} className="text-rose" /> Luxury Bespoke Tailoring
            </div>

            <h1 className="heading-serif" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              lineHeight: 1.15,
              color: 'var(--primary)',
              marginBottom: '1.25rem'
            }}>
              Your Perfect Outfit <br />
              <span className="text-gradient-rose">Starts Here</span>
            </h1>

            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: '2.25rem',
              maxWidth: '540px'
            }}>
              Custom tailoring made simple — choose your style, provide your measurements, place your order and track it from anywhere with our 100% fit guarantee.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <Link
                to={isAuthenticated ? (isAdmin ? "/admin/orders/new" : "/customer/orders/new") : "/login?redirect=/customer/orders/new"}
                className="btn btn-primary btn-lg btn-pill pulse-glow"
                style={{ fontSize: '1rem', padding: '0.9rem 2.2rem' }}
              >
                <PlusCircle size={20} /> Place an Order
              </Link>

              <a href="#services" className="btn btn-secondary btn-lg btn-pill">
                Explore Services
              </a>

              <Link to="/track-order" className="btn btn-soft-pink btn-lg btn-pill">
                <Package size={18} className="text-rose" /> Track Order
              </Link>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--pink-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} className="text-rose" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>100% Fit Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} className="text-rose" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Master Artisans</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} className="text-rose" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Floating Card Composition */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '4px solid white'
            }}>
              <img
                src={IMAGE_CONFIG.hero}
                alt="TailorCraft Luxury Studio"
                style={{ width: '100%', height: '520px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(225, 29, 72, 0.45) 100%)'
              }} />
            </div>

            {/* Floating Live Tracking Preview Card */}
            <div className="glass-panel animate-float" style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '260px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Live Milestone
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary)' }}>
                Order #TC-2026-000001
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--rose-primary)', fontWeight: 600, marginTop: '2px' }}>
                Stage: Stitching by Manoj Craftsman
              </div>
            </div>

            {/* Floating Rating Pill */}
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '20px',
              right: '-15px',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Order Tracking Widget */}
      <section style={{
        padding: '3.5rem 2rem',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--pink-border)'
      }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fff0f5 0%, #fffafb 100%)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--pink-border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Package size={18} /> INSTANT STATUS LOOKUP
          </div>
          <h2 className="heading-serif" style={{ fontSize: '1.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Track Your Tailoring Order
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
            Enter your Order Number (e.g. <strong>ORD-1001</strong> or <strong>TC-2026-000001</strong>) to view real-time stitching & delivery progress.
          </p>

          <form onSubmit={handleQuickTrack} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
            maxWidth: '550px',
            margin: '0 auto'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter Order ID (e.g., ORD-1001)..."
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.6rem', borderRadius: 'var(--radius-full)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-pill">
              Track Order <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Section 1: Our Services */}
      <section id="services" style={{ padding: '5rem 2rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose-primary)', letterSpacing: '0.05em' }}>
            Our Tailoring Services
          </span>
          <h2 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
            Bespoke Garments Handcrafted for You
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            From intricate bridal saree blouses to sharp bespoke suits, experience master tailoring with customized lining, cuts, and handwork.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '2rem'
        }}>
          {services.map((srv, idx) => (
            <div key={idx} className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={srv.image}
                  alt={srv.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <span className="badge badge-rose" style={{ position: 'absolute', top: '14px', right: '14px', boxShadow: 'var(--shadow-sm)' }}>
                  {srv.tag}
                </span>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--rose-dark)'
                }}>
                  {srv.price}
                </div>
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {srv.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                    {srv.desc}
                  </p>
                </div>
                <Link
                  to={isAuthenticated ? (isAdmin ? "/admin/orders/new" : "/customer/orders/new") : "/login?redirect=/customer/orders/new"}
                  className="btn btn-outline-rose btn-sm"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                >
                  <PlusCircle size={15} /> Order This Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section id="how-it-works" style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(180deg, #fffafb 0%, #fff0f5 100%)',
        borderTop: '1px solid var(--pink-border)',
        borderBottom: '1px solid var(--pink-border)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose-primary)', letterSpacing: '0.05em' }}>
              Simple 4-Step Process
            </span>
            <h2 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
              How TailorCraft Works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Say goodbye to messy paper notebooks. Seamlessly manage tailoring online from fabric selection to delivery.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            position: 'relative'
          }}>
            {steps.map((st, i) => {
              const IconComp = st.icon;
              return (
                <div key={i} className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: 'var(--pink-border)'
                  }}>
                    {st.step}
                  </div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'var(--pink-soft)',
                    border: '1.5px solid var(--pink-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--rose-primary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <IconComp size={30} />
                  </div>
                  <h3 className="heading-serif" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.6rem' }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Why Choose Us */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose-primary)', letterSpacing: '0.05em' }}>
              The TailorCraft Difference
            </span>
            <h2 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.4rem', marginBottom: '1.25rem' }}>
              Why Discerning Clients Trust Our Studio
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              We blend heritage tailoring craftsmanship with state-of-the-art digital milestone tracking, ensuring you get bespoke luxury without the stress.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { title: '100% Fit Guarantee & Free Adjustments', desc: 'If the fit is not impeccable on first trial, our master tailor will adjust it free of cost.' },
                { title: 'Digital Measurement Profiles', desc: 'Store your measurements online once and reuse them for all future bespoke orders.' },
                { title: 'Transparent Milestone Tracking', desc: 'Track your stitching in real-time from pattern cutting to steam pressing and delivery.' },
                { title: 'Transparent Pricing & 50% Advance', desc: 'Clear itemized estimates with easy simulated advance payments.' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--pink-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--rose-primary)',
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '4px solid white'
            }}>
              <img
                src={IMAGE_CONFIG.tailorWorking}
                alt="Master Tailor at work"
                style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div className="glass-panel" style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '280px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div className="heading-serif" style={{ fontSize: '1.5rem', color: 'var(--rose-primary)', fontWeight: 800 }}>
                15+ Years
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                Master Tailoring Experience in Bespoke Ethnic & Western Wear
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Featured Designs & Presets */}
      <section id="designs" style={{
        padding: '5rem 2rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--pink-border)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose-primary)', letterSpacing: '0.05em' }}>
                Curated Showcase
              </span>
              <h2 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.4rem' }}>
                Featured Bespoke Designs
              </h2>
            </div>
            <Link
              to={isAuthenticated ? (isAdmin ? "/admin/orders/new" : "/customer/orders/new") : "/login?redirect=/customer/orders/new"}
              className="btn btn-primary btn-pill"
            >
              <PlusCircle size={16} /> Place Custom Order
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {GARMENT_OPTIONS.slice(0, 8).map((g, i) => (
              <div key={i} className="card card-hover" style={{ overflow: 'hidden' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={g.image}
                    alt={g.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--rose-primary)'
                  }}>
                    Est. ₹{g.basePrice}
                  </div>
                </div>
                <div className="card-body">
                  <h4 className="heading-serif" style={{ fontSize: '1.125rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    {g.name}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {g.desc}
                  </p>
                  <Link
                    to={isAuthenticated ? (isAdmin ? `/admin/orders/new?garment=${g.id}` : `/customer/orders/new?garment=${g.id}`) : `/login?redirect=/customer/orders/new?garment=${g.id}`}
                    className="btn btn-soft-pink btn-sm"
                    style={{ width: '100%' }}
                  >
                    Select This Garment <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Customer Reviews */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(180deg, #fff0f5 0%, #fffafb 100%)',
        borderTop: '1px solid var(--pink-border)',
        borderBottom: '1px solid var(--pink-border)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose-primary)', letterSpacing: '0.05em' }}>
              Testimonials
            </span>
            <h2 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.4rem', marginBottom: '0.5rem' }}>
              Loved by Our Clients
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Read real fitting experiences from our bespoke tailoring customers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {reviews.map((rev, i) => (
              <div key={i} className="card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '1rem' }}>
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    "{rev.comment}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid var(--pink-soft)', paddingTop: '1rem' }}>
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary)' }}>
                      {rev.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rev.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{
        padding: '5rem 2rem',
        background: 'var(--rose-gradient)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.2)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={16} /> BESPOKE ELEGANCE AWAITS
          </div>
          <h2 className="heading-serif" style={{ fontSize: '2.75rem', color: 'white', marginBottom: '1rem' }}>
            Ready to Get Your Dream Outfit Tailored?
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.95, lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Select your style, enter your measurements, and let our master tailors craft your bespoke garment with live digital tracking.
          </p>
          <Link
            to={isAuthenticated ? (isAdmin ? "/admin/orders/new" : "/customer/orders/new") : "/login?redirect=/customer/orders/new"}
            className="btn btn-secondary btn-lg btn-pill"
            style={{
              background: 'white',
              color: 'var(--rose-primary)',
              fontWeight: 800,
              fontSize: '1.0625rem',
              padding: '1rem 2.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <PlusCircle size={20} /> Place Your Order Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
