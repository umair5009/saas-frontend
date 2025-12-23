import api from '../axios';

export const examApi = {
  // Exam Schedules
  getSchedules: (params) => api.get('/exams/schedules', { params }),
  createSchedule: (data) => api.post('/exams/schedules', data),
  updateSchedule: (id, data) => api.put(`/exams/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/exams/schedules/${id}`),
  
  // Exams
  getAll: (params) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  
  // Marks
  initializeStudents: (id) => api.post(`/exams/${id}/initialize-students`),
  enterMarks: (id, data) => api.post(`/exams/${id}/marks`, data),
  bulkEnterMarks: (id, data) => api.post(`/exams/${id}/marks/bulk`, data),
  verifyMarks: (id, data) => api.post(`/exams/${id}/marks/verify`, data),
  
  // Results
  calculateStatistics: (id) => api.post(`/exams/${id}/calculate-statistics`),
  publishResults: (id) => api.post(`/exams/${id}/publish`),
  getStudentResults: (studentId, params) => api.get(`/exams/results/student/${studentId}`, { params }),
  getClassResults: (params) => api.get('/exams/results/class', { params }),
  getReportCard: (studentId, params) => api.get(`/exams/report-card/${studentId}`, { params }),
};

