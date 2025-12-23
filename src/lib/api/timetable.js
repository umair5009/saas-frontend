import api from '../axios';

export const timetableApi = {
  // Timetables
  getAll: (params) => api.get('/timetable', { params }),
  getById: (id) => api.get(`/timetable/${id}`),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),

  // Period Management
  addPeriod: (timetableId, data) => api.post(`/timetable/${timetableId}/periods`, data),
  updatePeriod: (timetableId, data) => api.put(`/timetable/${timetableId}/periods`, data),
  deletePeriod: (timetableId, data) => api.delete(`/timetable/${timetableId}/periods`, { data }),

  // Substitute Management
  getSubstitutes: () => api.get('/timetable/substitutes'),
  assignSubstitute: (timetableId, data) => api.post(`/timetable/${timetableId}/substitute`, data),
  removeSubstitute: (timetableId, data) => api.delete(`/timetable/${timetableId}/substitute`, { data }),
  getAvailableSubstitutes: (params) => api.get('/timetable/substitutes/available', { params }),

  // Teacher Timetable
  getTeacherTimetable: (teacherId, params) => api.get(`/timetable/teacher/${teacherId}`, { params }),

  // Room Management
  checkRoomAvailability: (params) => api.get('/timetable/room/availability', { params }),
  getRoomSchedule: (room, params) => api.get(`/timetable/room/${room}/schedule`, { params }),

  // Conflict Detection
  checkConflicts: (params) => api.get('/timetable/conflicts', { params }),

  // Holidays
  // TODO: Verify holiday routes in backend
  getHolidays: (params) => api.get('/timetable/holidays', { params }),
  addHoliday: (data) => api.post('/timetable/holidays', data),
  deleteHoliday: (id) => api.delete(`/timetable/holidays/${id}`),
};

