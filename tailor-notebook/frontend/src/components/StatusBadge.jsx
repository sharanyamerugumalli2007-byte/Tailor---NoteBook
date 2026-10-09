import { label } from '../utils/formatters';

const TONE = {
  ORDER_RECEIVED: 'neutral', MEASUREMENT_TAKEN: 'info', CUTTING: 'info', STITCHING: 'info', TRIAL: 'warn',
  READY: 'good', DELIVERED: 'done', CANCELLED: 'bad',
  PENDING: 'warn', PARTIALLY_PAID: 'info', PAID: 'good',
  SCHEDULED: 'info', COMPLETED: 'good', RESCHEDULED: 'warn',
};

export default function StatusBadge({ value }) {
  return <span className={`badge badge-${TONE[value] || 'neutral'}`}>{label(value)}</span>;
}
