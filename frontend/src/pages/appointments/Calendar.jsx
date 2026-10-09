import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthGrid, todayISO } from '../../utils/dateUtils';
import { formatTime } from '../../utils/formatters';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Month grid. `byDate` maps ISO date -> appointments. */
export default function Calendar({ year, month, byDate, selected, onSelectDate, onSelectAppt, onNavigate }) {
  const days = monthGrid(year, month);
  const today = todayISO();
  const title = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const shift = (n) => { const d = new Date(year, month + n, 1); onNavigate(d.getFullYear(), d.getMonth()); };

  return (
    <div>
      <div className="cal-head">
        <h2>{title}</h2>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button className="btn btn-sm" onClick={() => { const n = new Date(); onNavigate(n.getFullYear(), n.getMonth()); onSelectDate(today); }}>Today</button>
          <button className="btn btn-sm" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="cal">
        {DOW.map((d) => <div className="cal-dow" key={d}>{d}</div>)}
        {days.map((iso) => {
          const list = (byDate[iso] || []);
          const other = Number(iso.slice(5, 7)) - 1 !== month;
          return (
            <div key={iso} role="button" tabIndex={0}
              className={`cal-day ${other ? 'other' : ''} ${iso === today ? 'today' : ''} ${iso === selected ? 'selected' : ''} ${list.length ? 'has-appt' : ''}`}
              onClick={() => onSelectDate(iso)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectDate(iso)}>
              <span className="cal-num">{Number(iso.slice(8))}</span>
              {list.slice(0, 2).map((a) => (
                <span key={a.id} className={`cal-appt ${a.status === 'CANCELLED' ? 'cancelled' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onSelectAppt(a); }}>
                  {formatTime(a.appointment_time)} {a.customer_name}
                </span>
              ))}
              {list.length > 2 && <span className="cal-more">+{list.length - 2} more</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
