import api from './api';

export async function getCustomerOrders(params = {}) {
  const res = await api.get('/customer/orders', { params });
  return res.orders || [];
}

export async function getOrderById(id) {
  const res = await api.get(`/orders/${id}`);
  return res.order;
}

export async function createOrder(data) {
  const res = await api.post('/customer/orders', data);
  return res.order;
}

export async function cancelOrder(id, reason) {
  const res = await api.post(`/customer/orders/${id}/cancel`, { reason });
  return res;
}

// Admin
export async function getAdminOrders(params = {}) {
  const res = await api.get('/admin/orders', { params });
  return res.orders || [];
}

export async function updateOrderStatus(id, statusData) {
  const res = await api.patch(`/admin/orders/${id}/status`, statusData);
  return res.order;
}
