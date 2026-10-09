import api from './api';

export async function submitContact(data) {
  const res = await api.post('/contact', data);
  return res;
}

export async function getAdminContactMessages() {
  const res = await api.get('/contact/admin');
  return res.messages || [];
}
