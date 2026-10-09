import api from './api';

export async function getMeasurements(params = {}) {
  const res = await api.get('/customer/measurements', { params });
  return res.measurements || [];
}

export async function getMeasurementById(id) {
  const res = await api.get(`/measurements/${id}`);
  return res.measurement;
}

export async function createMeasurement(data) {
  const res = await api.post('/customer/measurements', data);
  return res.measurement;
}

export async function updateMeasurement(id, data) {
  const res = await api.put(`/customer/measurements/${id}`, data);
  return res.measurement;
}

export async function deleteMeasurement(id) {
  const res = await api.delete(`/customer/measurements/${id}`);
  return res;
}
