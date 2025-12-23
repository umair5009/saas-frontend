import api from '../axios';

export const studentApi = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  changeStatus: (id, data) => api.put(`/students/${id}/status`, data),
  promote: (data) => api.post('/students/bulk/promote', data),
  transfer: (id, data) => api.put(`/students/${id}/transfer`, data),
  getReportCard: (id, params) => api.get(`/students/${id}/report-card`, { params }),
  bulkImport: (data) => api.post('/students/bulk/import', data),
  getStatistics: (params) => api.get('/students/statistics', { params }),
};

