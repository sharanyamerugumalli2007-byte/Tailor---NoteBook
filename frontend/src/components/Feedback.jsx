import { AlertTriangle, Inbox } from 'lucide-react';

export function Loading({ text = 'Loading…' }) {
  return <div className="state" role="status"><div className="spinner" /> <span>{text}</span></div>;
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <AlertTriangle size={20} />
      <span>{message}</span>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ text, action }) {
  return (
    <div className="state">
      <Inbox size={20} />
      <span>{text}</span>
      {action}
    </div>
  );
}

/** Renders loading / error / empty / content for any useFetch result. */
export function Async({ state, loadingText, errorText, isEmpty, emptyText, emptyAction, children }) {
  if (state.loading && !state.data) return <Loading text={loadingText} />;
  if (state.error) return <ErrorMessage message={errorText ? `${errorText} ${state.error}` : state.error} onRetry={state.reload} />;
  if (isEmpty?.(state.data)) return <EmptyState text={emptyText} action={emptyAction} />;
  return children(state.data);
}
