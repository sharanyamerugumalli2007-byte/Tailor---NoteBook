import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Scissors, User, LogOut, Menu, X, Bell, ShoppingBag, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="site-header">
      <nav className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrap">
            <Scissors className="logo-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Tailor Notebook</span>
            <span className="brand-tagline">Bespoke Atelier</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Auth / Action Section */}
        <div className="nav-actions desktop-only">
          {user ? (
            <div className="user-dropdown">
              {isAdmin ? (
                <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
                  <ShieldCheck size={16} />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link to="/customer/dashboard" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={16} />
                  <span>My Studio</span>
                </Link>
              )}
              <div className="user-menu-pill">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-greeting">{user.name?.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="btn-icon-logout"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Sparkles size={15} />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle mobile-only"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer animate-fade">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="mobile-actions">
            {user ? (
              <div className="mobile-user-box">
                <p className="mobile-user-name">Signed in as <strong>{user.name}</strong></p>
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary btn-block mb-2"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary btn-block mb-2"
                  >
                    Customer Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-outline btn-block">
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mobile-guest-box">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline btn-block mb-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary btn-block"
                >
                  Sign Up & Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 248, 250, 0.94);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .nav-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .logo-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--rose-accent) 0%, var(--deep-rose) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(217, 108, 138, 0.3);
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--deep-rose);
          line-height: 1.1;
        }
        .brand-tagline {
          font-size: 0.725rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }
        .nav-item {
          font-size: 0.925rem;
          font-weight: 500;
          color: var(--text-main);
          transition: color 0.2s, transform 0.2s;
          position: relative;
          padding: 0.25rem 0;
        }
        .nav-item:hover, .nav-item.active {
          color: var(--deep-rose);
          font-weight: 600;
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--rose-accent);
          border-radius: var(--radius-full);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .guest-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-dropdown {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-menu-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          padding: 0.3rem 0.6rem 0.3rem 0.35rem;
          border-radius: var(--radius-full);
        }
        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-greeting {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .btn-icon-logout {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          padding: 0.2rem;
          border-radius: var(--radius-full);
          transition: color 0.2s;
        }
        .btn-icon-logout:hover {
          color: var(--error);
        }
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: flex;
        }
        .mobile-toggle {
          background: none;
          border: none;
          color: var(--deep-rose);
          cursor: pointer;
        }
        .mobile-drawer {
          background: #ffffff;
          border-bottom: 2px solid var(--border-color);
          padding: 1.5rem;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .mobile-nav-item {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-main);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--bg-main);
        }
        .mobile-nav-item.active {
          color: var(--deep-rose);
        }
        .btn-block {
          width: 100%;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        @media (max-width: 868px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </header>
  );
}
