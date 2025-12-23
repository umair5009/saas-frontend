import api from '../axios';

export const notificationApi = {
  // Get notifications
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: (params) => api.get('/notifications/unread', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),

  // Send notifications
  send: (data) => api.post('/notifications', data),
  sendBulk: (data) => api.post('/notifications/send-bulk', data),

  // Templates
  getTemplates: (params) => api.get('/notifications/templates', { params }),
  createTemplate: (data) => api.post('/notifications/templates', data),
  updateTemplate: (id, data) => api.put(`/notifications/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/notifications/templates/${id}`),

  // Scheduled
  getScheduled: (params) => api.get('/notifications/scheduled', { params }),
  scheduleNotification: (data) => api.post('/notifications/schedule', data),
  cancelScheduled: (id) => api.delete(`/notifications/scheduled/${id}`),

  // Announcements
  getAnnouncements: (params) => api.get('/notifications/announcements', { params }),
  createAnnouncement: (data) => api.post('/notifications/announcements', data),

  // Settings
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (data) => api.put('/notifications/settings', data),
};

