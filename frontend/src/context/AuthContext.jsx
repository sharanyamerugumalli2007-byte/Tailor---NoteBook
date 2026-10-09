import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { tokenStore } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.getUser());
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((userData) => {
        setUser(userData);
        tokenStore.setUser(userData);
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, requiredRole) => {
    const res = await authService.login(email, password, requiredRole);
    tokenStore.set(res.token);
    tokenStore.setUser(res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    tokenStore.set(res.token);
    tokenStore.setUser(res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      tokenStore.setUser(merged);
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin' || user?.role === 'staff',
      isCustomer: user?.role === 'customer'
    }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
