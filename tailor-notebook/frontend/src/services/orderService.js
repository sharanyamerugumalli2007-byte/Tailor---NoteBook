import api, { unwrap } from './api';

export const listOrders = (params) => unwrap(api.get('/orders', { params }));
export const getOrder = (id) => unwrap(api.get(`/orders/${id}`));
export const createOrder = (data) => unwrap(api.post('/orders', data));
export const updateOrder = (id, data) => unwrap(api.put(`/orders/${id}`, data));
export const deleteOrder = (id) => unwrap(api.delete(`/orders/${id}`));
export const updateOrderStatus = (id, status, notes) => unwrap(api.patch(`/orders/${id}/status`, { status, notes }));
