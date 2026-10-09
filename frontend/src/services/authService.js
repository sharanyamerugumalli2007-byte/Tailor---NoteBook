import api from './api';

export async function login(email, password, requiredRole) {
  const res = await api.post('/auth/login', { email, password, requiredRole });
  return res;
}

export async function register(userData) {
  const res = await api.post('/auth/register', userData);
  return res;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.user;
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword });
  return res;
}

export async function updateProfile(profileData) {
  const res = await api.put('/auth/profile', profileData);
  return res;
}
