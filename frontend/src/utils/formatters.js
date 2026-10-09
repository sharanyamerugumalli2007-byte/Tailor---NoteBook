const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

export const formatMoney = (n) => money.format(Number(n || 0));

// Dates arrive as 'YYYY-MM-DD' (or ISO timestamps); parse as local dates to avoid timezone shifts
export const parseDate = (d) => (d ? new Date(String(d).length === 10 ? `${d}T00:00:00` : d) : null);

export const formatDate = (d) => {
  const dt = parseDate(d);
  return dt ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

export const formatDateTime = (d) => {
  const dt = parseDate(d);
  return dt ? dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
};

export const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const label = (s) =>
  s ? String(s).toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '';

export const unitLabel = (u) => (u === 'cm' ? 'cm' : 'in');
