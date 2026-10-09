import api from './api';

export async function getOrderTracking(orderIdOrNumber) {
  const res = await api.get(`/tracking/${orderIdOrNumber}`);
  return res;
}

export async function addTrackingEvent(orderId, eventData) {
  const res = await api.post(`/tracking/admin/orders/${orderId}/tracking`, eventData);
  return res;
}
