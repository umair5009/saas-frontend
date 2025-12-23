import api from '../axios';

export const staffApi = {
  // Basic CRUD
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),

  // Statistics
  getStatistics: () => api.get('/staff/statistics'),
  getTeachersBySubject: (params) => api.get('/staff/teachers-by-subject', { params }),

  // Status management
  changeStatus: (id, data) => api.put(`/staff/${id}/status`, data),

  // Leave management
  applyLeave: (id, data) => api.post(`/staff/${id}/leave`, data),
  approveLeave: (id, data) => api.put(`/staff/${id}/leave/approve`, data),

  // Performance
  addPerformanceEvaluation: (id, data) => api.post(`/staff/${id}/performance`, data),

  // Attendance
  updateAttendanceSummary: (id, data) => api.put(`/staff/${id}/attendance-summary`, data),

  // Teacher assignments
  assignSubjects: (id, data) => api.put(`/staff/${id}/assign-subjects`, data),
  assignClassTeacher: (id, data) => api.put(`/staff/${id}/assign-class-teacher`, data),
};
