import api, { unwrap } from './api';

export const listNotifications = () => unwrap(api.get('/notifications'));
export const markRead = (id) => unwrap(api.patch(`/notifications/${id}/read`));
export const markAllRead = () => unwrap(api.patch('/notifications/read-all'));
export const dashboardStats = () => unwrap(api.get('/dashboard/stats'));
export const recentOrders = () => unwrap(api.get('/dashboard/recent-orders'));
export const upcomingAppointments = () => unwrap(api.get('/dashboard/upcoming-appointments'));
