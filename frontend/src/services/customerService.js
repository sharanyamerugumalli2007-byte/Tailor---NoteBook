import api from './api';

export const listCustomers = async (params) => {
  const res = await api.get('/admin/customers', { params });
  return res.customers || [];
};

export const getCustomer = async (id) => {
  const res = await api.get(`/admin/customers/${id}`);
  return res.customer || res;
};

export const updateCustomer = async (id, data) => {
  const res = await api.put('/customer/profile', data);
  return res;
};

