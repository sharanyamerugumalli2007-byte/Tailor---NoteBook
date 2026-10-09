import api, { unwrap } from './api';

export const listMeasurements = (customerId) => unwrap(api.get(`/customers/${customerId}/measurements`));
export const getMeasurement = (id) => unwrap(api.get(`/measurements/${id}`));
export const createMeasurement = (customerId, data) => unwrap(api.post(`/customers/${customerId}/measurements`, data));
export const updateMeasurement = (id, data) => unwrap(api.put(`/measurements/${id}`, data));
export const restoreMeasurement = (id) => unwrap(api.post(`/measurements/${id}/restore`));
