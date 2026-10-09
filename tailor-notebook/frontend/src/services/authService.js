import api, { unwrap, unwrapWithMessage } from './api';

export const login = (email, password) => unwrap(api.post('/auth/login', { email, password }));
export const logout = () => api.post('/auth/logout').catch(() => {});
export const me = () => unwrap(api.get('/auth/me'));
export const updateProfile = (data) => unwrap(api.put('/auth/profile', data));
export const createBackup = () => unwrapWithMessage(api.post('/backups'));
export const listBackups = () => unwrap(api.get('/backups'));
export const downloadBackup = async (name) => {
  const res = await api.get(`/backups/${name}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
};
