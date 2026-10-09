export const toISODate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${m}-${day}`;
};

export const todayISO = () => toISODate(new Date());

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

/** 6x7 grid of ISO dates for the month containing `date` (weeks start on Monday). */
export const monthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => toISODate(new Date(year, month, 1 - offset + i)));
};
