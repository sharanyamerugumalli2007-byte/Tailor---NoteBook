import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../../components/CustomerSidebar';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../../services/notificationService';
import {
  Bell,
  CheckCircle2,
  Package,
  CreditCard,
  Truck,
  CheckCheck,
  ArrowRight
} from 'lucide-react';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = () => {
    setLoading(true);
    getNotifications()
      .then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      fetchList();
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchList();
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER': return Package;
      case 'PAYMENT': return CreditCard;
      case 'SHIPPING': return Truck;
      default: return Bell;
    }
  };

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Updates & Alerts</span>
              <h1 className="portal-main-title font-serif">Notifications ({unreadCount} unread)</h1>
            </div>

            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm">
                <CheckCheck size={16} />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner text="Checking for atelier updates..." size="large" />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You have no notifications right now. Any status updates or payment verification notices will appear here."
            />
          ) : (
            <div className="notifications-list-container studio-card">
              {notifications.map((notif) => {
                const Icon = getIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`notif-card-item ${notif.is_read ? 'read' : 'unread'}`}
                  >
                    <div className="notif-icon-wrap">
                      <Icon size={18} />
                    </div>

                    <div className="notif-content-wrap">
                      <div className="notif-top-row">
                        <h4 className="notif-title">{notif.title}</h4>
                        <span className="notif-date">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="notif-text">{notif.message}</p>

                      <div className="notif-bottom-actions">
                        {notif.link && (
                          <Link to={notif.link} className="notif-link-btn">
                            <span>View Details</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}

                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="btn-mark-read"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .notifications-list-container {
          padding: 1.5rem;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .notif-card-item {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.25rem;
          border-radius: var(--radius-md);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .notif-card-item.unread {
          background: #FFF0F5;
          border-left: 4px solid var(--deep-rose);
        }
        .notif-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notif-content-wrap {
          flex: 1;
        }
        .notif-top-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.35rem;
        }
        .notif-title {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .notif-date {
          font-size: 0.75rem;
          color: var(--text-light);
        }
        .notif-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .notif-bottom-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .notif-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .btn-mark-read {
          background: none;
          border: none;
          font-size: 0.775rem;
          color: var(--text-light);
          cursor: pointer;
        }
        .btn-mark-read:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
