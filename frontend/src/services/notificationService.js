import api from './api';

export async function getNotifications() {
  const res = await api.get('/customer/notifications');
  return res;
}

export async function markAsRead(id) {
  const res = await api.patch(`/customer/notifications/${id}/read`);
  return res;
}

export async function markAllAsRead() {
  const res = await api.post('/customer/notifications/read-all');
  return res;
}
