import api, { unwrap } from './api';

export const listCustomers = (params) => unwrap(api.get('/customers', { params }));
export const getCustomer = (id) => unwrap(api.get(`/customers/${id}`));
export const createCustomer = (data) => unwrap(api.post('/customers', data));
export const updateCustomer = (id, data) => unwrap(api.put(`/customers/${id}`, data));
export const deleteCustomer = (id) => unwrap(api.delete(`/customers/${id}`));
export const getCustomerHistory = (id) => unwrap(api.get(`/customers/${id}/history`));
