import api from './api';

export async function getAdminDashboard() {
  const res = await api.get('/admin/dashboard');
  return res;
}

export async function getAdminCustomers(params = {}) {
  const res = await api.get('/customer/admin/all', { params });
  return res.customers || [];
}

export async function getAdminCustomerById(id) {
  const res = await api.get(`/customer/admin/${id}`);
  return res;
}

export async function getSettings() {
  const res = await api.get('/admin/settings');
  return res.settings;
}

export async function updateSettings(data) {
  const res = await api.put('/admin/settings', data);
  return res;
}
