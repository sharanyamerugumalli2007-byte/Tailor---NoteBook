import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Ruler, ClipboardList, CalendarDays, Bell, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import Footer from './Footer';

const NAV = [
  ['/', 'Dashboard', LayoutDashboard, true],
  ['/customers', 'Customers', Users],
  ['/measurements', 'Measurements', Ruler],
  ['/orders', 'Orders', ClipboardList],
  ['/appointments', 'Appointments', CalendarDays],
  ['/notifications', 'Notifications', Bell],
  ['/profile', 'Profile', UserCircle],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Tailor Notebook</span>
        </div>
        <nav onClick={() => setOpen(false)}>
          {NAV.map(([to, text, Icon, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {text}
            </NavLink>
          ))}
        </nav>
        <button className="nav-link logout" onClick={handleLogout}><LogOut size={18} /> Log out</button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="topbar-right">
            <NotificationBell />
            <div className="who"><strong>{user?.name}</strong><span className="muted">{user?.role === 'admin' ? 'Shop owner' : 'Staff'}</span></div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
        <Footer />
      </div>
    </div>
  );
}
