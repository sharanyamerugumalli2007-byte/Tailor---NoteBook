import { MEASUREMENT_FIELDS } from '../utils/validation';

/** Shows the filled-in measurements; fields that differ from `compareTo` are highlighted. */
export default function MeasurementGrid({ m, compareTo }) {
  const shown = MEASUREMENT_FIELDS.filter(([k]) => m[k] !== null && m[k] !== undefined);
  return (
    <>
      <div className="measure-grid">
        {shown.map(([k, text]) => {
          const changed = compareTo && compareTo[k] !== m[k];
          return (
            <div key={k} className={`measure ${changed ? 'changed' : ''}`} title={changed ? `Previously ${compareTo[k] ?? '—'}` : undefined}>
              <span>{text}</span>
              <strong>{m[k]} {m.unit}</strong>
            </div>
          );
        })}
      </div>
      {shown.length === 0 && <p className="muted">No numeric measurements in this version.</p>}
      {m.other_measurements && <p style={{ marginTop: 12 }}><strong>Other: </strong>{m.other_measurements}</p>}
      {m.notes && <p><strong>Notes: </strong>{m.notes}</p>}
    </>
  );
}
