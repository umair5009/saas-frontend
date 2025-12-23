import api from '../axios';

export const branchApi = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  toggleStatus: (id, data) => api.patch(`/branches/${id}/toggle-status`, data),
  getTree: (params) => api.get('/branches/tree', { params }),
  getChildren: (id) => api.get(`/branches/${id}/children`),
  getStatistics: (id) => api.get(`/branches/${id}/statistics`),
  updateSettings: (id, section, data) => api.put(`/branches/${id}/settings/${section}`, data),
  transferStudents: (id, data) => api.post(`/branches/${id}/transfer-students`, data),
  assignPrincipal: (id, data) => api.post(`/branches/${id}/principal`, data),
};

