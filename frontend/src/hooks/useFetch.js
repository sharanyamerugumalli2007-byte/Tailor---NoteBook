import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';

/**
 * Runs an async loader and exposes { data, loading, error, reload }.
 * Re-runs whenever `deps` change. Stale responses from older runs are ignored.
 */
export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const run = useRef(0);

  const load = useCallback(() => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => { if (id === run.current) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (id === run.current) setState({ data: null, loading: false, error: errorMessage(err) }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

/** Debounce a fast-changing value (search boxes). */
export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
