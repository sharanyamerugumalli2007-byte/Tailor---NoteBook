import React from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Notification Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Alerts for incoming order requests, advance payment submissions, fitting appointments, and milestone updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={markAllAsRead}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p>No notifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: n.is_read ? '#ffffff' : '#fffdf7',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>{n.title}</strong>
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                      {n.type}
                    </span>
                    {!n.is_read && (
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem', display: 'block' }}>
                    {formatDateTime(n.created_at)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {n.link && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        markAsRead(n.id);
                        navigate(n.link);
                      }}
                    >
                      View Details <ExternalLink size={12} />
                    </button>
                  )}
                  {!n.is_read && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => markAsRead(n.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
