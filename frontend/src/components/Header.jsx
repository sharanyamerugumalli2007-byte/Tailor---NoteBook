import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Scissors, Bell, Menu, User, LogOut, PlusCircle, Sparkles, ExternalLink, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/dateUtils';

const Header = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel" style={{
      height: '64px',
      borderBottom: '1px solid var(--pink-border)',
      padding: '0 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left side: Hamburger (mobile) + Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', border: '1px solid var(--pink-border)' }}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <Link to={isAdmin ? '/admin/dashboard' : '/customer/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'var(--rose-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-rose)'
          }}>
            <Scissors size={18} />
          </div>
          <div>
            <span className="heading-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Tailor<span className="text-rose">Craft</span>
            </span>
            <span className="hide-on-mobile" style={{ display: 'inline-block', marginLeft: '8px', fontSize: '0.6875rem', color: 'var(--text-rose)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isAdmin ? 'Studio Admin' : 'Customer Hub'}
            </span>
          </div>
        </Link>
      </div>

      {/* Right side: Global Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Place New Order Action Button */}
        <Link
          to={isAdmin ? "/admin/orders/new" : "/customer/orders/new"}
          className="btn btn-primary btn-sm btn-pill hide-on-mobile pulse-glow"
          style={{ padding: '0.45rem 1.15rem' }}
        >
          <PlusCircle size={15} /> PLACE NEW ORDER
        </Link>

        {/* View Public Website */}
        <Link
          to="/"
          target="_blank"
          className="btn btn-secondary btn-sm hide-on-mobile"
          title="Open Public Boutique Landing Page"
        >
          <ExternalLink size={14} /> Boutique Home
        </Link>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--pink-border)'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--rose-primary)',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifMenu && (
            <div className="card glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '340px',
              maxHeight: '440px',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              zIndex: 1000,
              border: '1.5px solid var(--pink-border)'
            }}>
              <div style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--pink-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--pink-blush)'
              }}>
                <span className="heading-serif" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--rose-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderBottom: '1px solid var(--pink-soft)',
                        backgroundColor: n.is_read ? '#ffffff' : 'var(--pink-subtle)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: n.is_read ? 600 : 700, fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '2px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          background: 'var(--pink-soft)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--pink-border)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--rose-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="hide-on-mobile" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--rose-dark)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--rose-primary)', cursor: 'pointer', padding: '2px', display: 'flex' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
