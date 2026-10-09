import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Ruler,
  Compass,
  CreditCard,
  Bell,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function CustomerSidebar() {
  const { user, logout } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Place New Order', path: '/customer/orders/new', icon: PlusCircle, highlight: true },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { name: 'My Measurements', path: '/customer/measurements', icon: Ruler },
    { name: 'Track Order', path: '/customer/tracking', icon: Compass },
    { name: 'Payment Center', path: '/customer/payments', icon: CreditCard },
    { name: 'Notifications', path: '/customer/notifications', icon: Bell },
    { name: 'My Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <aside className="portal-sidebar">
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="sidebar-user-info">
          <h4 className="sidebar-user-name">{user?.name || 'Customer'}</h4>
          <span className="sidebar-badge">Bespoke Client</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/customer/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-link' : ''}`
              }
            >
              <Icon size={18} className="sidebar-icon" />
              <span>{item.name}</span>
              {item.highlight && <Sparkles size={14} className="sparkle-tag" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer-action">
        <button onClick={logout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .portal-sidebar {
          width: 260px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: var(--shadow-sm);
          height: fit-content;
        }
        .sidebar-profile-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }
        .sidebar-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-pink) 0%, var(--rose-accent) 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(217, 108, 138, 0.25);
        }
        .sidebar-user-name {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }
        .sidebar-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--deep-rose);
          background: var(--soft-blush);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-top: 0.25rem;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .sidebar-link:hover {
          color: var(--deep-rose);
          background: var(--soft-blush);
          transform: translateX(3px);
        }
        .sidebar-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, var(--rose-accent) 0%, var(--deep-rose) 100%);
          box-shadow: 0 4px 12px rgba(217, 108, 138, 0.3);
        }
        .sidebar-link.highlight-link:not(.active) {
          background: var(--blush-light);
          color: var(--deep-rose);
          border: 1px dashed var(--primary-pink);
        }
        .sparkle-tag {
          margin-left: auto;
          color: #ffffff;
        }
        .sidebar-footer-action {
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .sidebar-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--error);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .sidebar-logout-btn:hover {
          background: var(--error-bg);
          border-color: #FFCDD2;
        }
      `}</style>
    </aside>
  );
}
