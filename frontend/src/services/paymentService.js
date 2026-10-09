import api from './api';

export async function getCustomerPayments() {
  const res = await api.get('/customer/payments');
  return res;
}

export async function submitPayment(orderId, paymentData) {
  const res = await api.post(`/customer/orders/${orderId}/payments`, paymentData);
  return res;
}

// Admin
export async function getAdminPayments(params = {}) {
  const res = await api.get('/admin/payments', { params });
  return res.payments || [];
}

export async function verifyPayment(paymentId, reviewNotes) {
  const res = await api.post(`/admin/payments/${paymentId}/verify`, { review_notes: reviewNotes });
  return res;
}

export async function rejectPayment(paymentId, reviewNotes) {
  const res = await api.post(`/admin/payments/${paymentId}/reject`, { review_notes: reviewNotes });
  return res;
}
