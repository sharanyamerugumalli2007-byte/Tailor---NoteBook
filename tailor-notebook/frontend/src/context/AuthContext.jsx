import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { tokenStore } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  // Restore the session from the stored token
  useEffect(() => {
    if (!tokenStore.get()) return;
    authService.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authService.login(email, password);
    tokenStore.set(token);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, login, logout, isAdmin: user?.role === 'admin' }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
