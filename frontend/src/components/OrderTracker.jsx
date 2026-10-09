import { Check } from 'lucide-react';
import { label, formatDate } from '../utils/formatters';

const FLOW = ['ORDER_RECEIVED', 'MEASUREMENT_TAKEN', 'CUTTING', 'STITCHING', 'TRIAL', 'READY', 'DELIVERED'];

/** Horizontal "tape" progress tracker with the date each step was reached. */
export default function OrderTracker({ status, history = [] }) {
  if (status === 'CANCELLED') return <div className="state state-error">This order was cancelled.</div>;
  const current = FLOW.indexOf(status);
  const reached = (s) => history.filter((h) => h.status === s).pop();
  return (
    <ol className="tracker">
      {FLOW.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''}>
          <span className="tracker-dot">{i < current ? <Check size={12} /> : null}</span>
          <span className="tracker-name">{label(s)}</span>
          <span className="tracker-date">{reached(s) ? formatDate(reached(s).changed_at) : ''}</span>
        </li>
      ))}
    </ol>
  );
}
