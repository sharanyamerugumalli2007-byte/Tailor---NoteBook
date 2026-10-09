import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Scissors,
  CreditCard,
  Truck,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar() {
  const { user, logout } = useContext(AuthContext);

  const links = [
    { name: 'Studio Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Services Catalog', path: '/admin/services', icon: Scissors },
    { name: 'Payment Verification', path: '/admin/payments', icon: CreditCard },
    { name: 'Shipment & Tracking', path: '/admin/shipments', icon: Truck },
    { name: 'Studio Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="portal-sidebar admin-sidebar">
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar admin-avatar">
          <ShieldCheck size={22} />
        </div>
        <div className="sidebar-user-info">
          <h4 className="sidebar-user-name">{user?.name || 'Administrator'}</h4>
          <span className="sidebar-badge admin-badge">Master Tailor Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="sidebar-icon" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer-action">
        <button onClick={logout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out Admin</span>
        </button>
      </div>

      <style>{`
        .admin-sidebar {
          border-color: #E2C0CC;
        }
        .admin-avatar {
          background: linear-gradient(135deg, var(--deep-rose) 0%, #7A2442 100%) !important;
        }
        .admin-badge {
          background: #F8D7DA !important;
          color: #842029 !important;
        }
      `}</style>
    </aside>
  );
}
