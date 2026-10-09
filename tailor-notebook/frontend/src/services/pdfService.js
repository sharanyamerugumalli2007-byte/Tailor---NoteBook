import api from './api';

// PDFs need the auth header, so fetch as a blob and open it in a new tab (printable/downloadable there)
async function openPdf(path) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const win = window.open(url, '_blank');
  if (!win) {
    const a = Object.assign(document.createElement('a'), { href: url, download: 'document.pdf' });
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export const openMeasurementPdf = (customerId, measurementId) =>
  openPdf(`/pdf/measurements/${customerId}${measurementId ? `?measurementId=${measurementId}` : ''}`);
export const openOrderPdf = (orderId) => openPdf(`/pdf/orders/${orderId}`);
