import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { listNotifications } from '../services/notificationService';

// Polls the unread count; the Notifications page dispatches 'tn:notifications' after changes
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => listNotifications().then((d) => alive && setUnread(d.unread)).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    window.addEventListener('tn:notifications', load);
    return () => { alive = false; clearInterval(t); window.removeEventListener('tn:notifications', load); };
  }, []);
  return (
    <Link to="/notifications" className="bell" aria-label={`Notifications, ${unread} unread`}>
      <Bell size={20} />
      {unread > 0 && <span className="bell-count">{unread > 99 ? '99+' : unread}</span>}
    </Link>
  );
}
