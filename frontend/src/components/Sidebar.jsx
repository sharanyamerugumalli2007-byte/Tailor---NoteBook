import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Ruler,
  Scissors,
  Calendar,
  Shirt,
  CreditCard,
  ShieldCheck,
  History,
  Database,
  Bell,
  Settings,
  ShoppingBag,
  Package,
  UserCheck,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Place New Order', path: '/admin/orders/new', icon: PlusCircle, isHighlight: true },
    { label: 'Order Management', path: '/admin/orders', icon: Scissors },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Measurements', path: '/admin/measurements', icon: Ruler },
    { label: 'Payment Verifications', path: '/admin/payments', icon: CreditCard },
    { label: 'Appointments & Trials', path: '/admin/appointments', icon: Calendar },
    { label: 'Garments Catalog', path: '/admin/products', icon: Shirt },
    ...(user?.role === 'admin' ? [{ label: 'Admin Team', path: '/admin/team', icon: ShieldCheck }] : []),
    { label: 'Activity Logs', path: '/admin/audit-logs', icon: History },
    ...(user?.role === 'admin' ? [{ label: 'Database Backup', path: '/admin/backup', icon: Database }] : []),
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Studio Profile', path: '/admin/profile', icon: Settings }
  ];

  const customerNavItems = [
    { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Place New Order', path: '/customer/orders/new', icon: PlusCircle, isHighlight: true },
    { label: 'My Orders', path: '/customer/orders', icon: Package },
    { label: 'Track Any Order', path: '/track-order', icon: Scissors },
    { label: 'My Measurements', path: '/customer/measurements', icon: UserCheck },
    { label: 'Payments & Bills', path: '/customer/payments', icon: CreditCard },
    { label: 'Appointments & Trials', path: '/customer/appointments', icon: Calendar },
    { label: 'Browse Catalog', path: '/customer/catalog', icon: ShoppingBag },
    { label: 'Size Guide & Chart', path: '/customer/size-guide', icon: Ruler }
  ];

  const items = isAdmin ? adminNavItems : customerNavItems;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(30, 27, 29, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--pink-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '64px',
        bottom: 0,
        left: 0,
        zIndex: 95,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isOpen ? 'var(--shadow-xl)' : 'none'
      }}>
        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 0.85rem' }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--rose-dark)',
            letterSpacing: '0.06em',
            padding: '0 0.85rem 0.75rem',
            marginBottom: '0.25rem'
          }}>
            {isAdmin ? 'Studio Management' : 'Customer Workspace'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: item.isHighlight ? '0.65rem 0.85rem' : '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive || item.isHighlight ? 700 : 500,
                    color: isActive
                      ? 'var(--rose-primary)'
                      : item.isHighlight
                      ? 'var(--rose-dark)'
                      : 'var(--text-main)',
                    backgroundColor: isActive
                      ? 'var(--pink-soft)'
                      : item.isHighlight
                      ? 'var(--pink-blush)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid var(--pink-border)'
                      : item.isHighlight
                      ? '1px dashed var(--rose-primary)'
                      : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} className={item.isHighlight ? 'text-rose' : ''} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Shop Info */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--pink-soft)',
          backgroundColor: 'var(--pink-blush)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)'
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              MySQL Studio Database Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
