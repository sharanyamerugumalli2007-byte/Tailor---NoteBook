import api, { unwrap } from './api';

export const listAppointments = (params) => unwrap(api.get('/appointments', { params }));
export const getAppointment = (id) => unwrap(api.get(`/appointments/${id}`));
export const createAppointment = (data) => unwrap(api.post('/appointments', data));
export const updateAppointment = (id, data) => unwrap(api.put(`/appointments/${id}`, data));
export const deleteAppointment = (id) => unwrap(api.delete(`/appointments/${id}`));
export const updateAppointmentStatus = (id, status) => unwrap(api.patch(`/appointments/${id}/status`, { status }));
