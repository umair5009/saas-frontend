import api from '../axios';

export const attendanceApi = {
  // Marking
  mark: (data) => api.post('/attendance/mark', data),
  bulkMark: (data) => api.post('/attendance/mark/bulk', data),
  
  // Get
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  getClassAttendance: (params) => api.get('/attendance/class', { params }),
  
  // Update/Delete
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  
  // Leave
  applyLeave: (data) => api.post('/attendance/leave/apply', data),
  approveLeave: (data) => api.post('/attendance/leave/approve', data),
  
  // Reports
  getStudentSummary: (studentId, params) => api.get(`/attendance/summary/student/${studentId}`, { params }),
  getReport: (params) => api.get('/attendance/report', { params }),
  getAbsentees: (params) => api.get('/attendance/absentees', { params }),
  getLowAttendance: (params) => api.get('/attendance/low-attendance', { params }),
};

