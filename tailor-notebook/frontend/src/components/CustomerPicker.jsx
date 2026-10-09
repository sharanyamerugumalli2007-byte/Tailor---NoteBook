import { useEffect, useState } from 'react';
import { listCustomers, getCustomer } from '../services/customerService';
import { useDebounced } from '../hooks/useFetch';

/** Search-as-you-type customer selector. Calls onChange(customer | null). */
export default function CustomerPicker({ value, onChange, disabled, invalid }) {
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const q = useDebounced(text, 250);

  // Load the display name when a customer id is supplied from outside (edit forms, ?customerId=)
  useEffect(() => {
    if (value && (!selected || selected.id !== Number(value))) {
      getCustomer(value).then((c) => { setSelected(c); setText(c.name); }).catch(() => {});
    }
    if (!value && selected) { setSelected(null); setText(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    listCustomers({ search: q || undefined, limit: 8 }).then((d) => setResults(d.items)).catch(() => setResults([]));
  }, [q, open]);

  const pick = (c) => { setSelected(c); setText(c.name); setOpen(false); onChange(c); };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={text} disabled={disabled} placeholder="Search customer by name or phone" aria-invalid={invalid}
        onChange={(e) => { setText(e.target.value); setOpen(true); if (selected) { setSelected(null); onChange(null); } }}
        onFocus={() => !disabled && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && (
        <ul className="list card" style={{ position: 'absolute', zIndex: 10, left: 0, right: 0, top: '100%', padding: 4, marginTop: 4, maxHeight: 260, overflowY: 'auto' }}>
          {results.length === 0 && <li className="muted">No customers found</li>}
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" className="btn btn-sm" style={{ width: '100%', justifyContent: 'space-between', border: 0 }} onMouseDown={() => pick(c)}>
                <span>{c.name}</span><span className="muted">{c.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
