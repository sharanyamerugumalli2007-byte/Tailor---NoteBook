import api from './api';

export async function getServices(params = {}) {
  const res = await api.get('/services', { params });
  return res.services || [];
}

export async function getServiceById(id) {
  const res = await api.get(`/services/${id}`);
  return res.service;
}

export async function createService(data) {
  const res = await api.post('/services', data);
  return res.service;
}

export async function updateService(id, data) {
  const res = await api.put(`/services/${id}`, data);
  return res.service;
}

export async function deleteService(id) {
  const res = await api.delete(`/services/${id}`);
  return res;
}
