// Label + control + error message wrapper for react-hook-form fields
export default function Field({ label, error, hint, children, className = '' }) {
  return (
    <label className={`field ${error ? 'field-error' : ''} ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-msg" role="alert">{error.message || error}</span>}
    </label>
  );
}
