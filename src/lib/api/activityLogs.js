import api from '../axios';

export const activityLogApi = {
    getAll: (params) => api.get('/activity-logs', { params }),
    getById: (id) => api.get(`/activity-logs/${id}`),
    getUserLogs: (userId, params) => api.get(`/activity-logs/user/${userId}`, { params }),
    getMyLogs: (params) => api.get('/activity-logs/my/logs', { params }),
    getUserLoginHistory: (userId, params) => api.get(`/activity-logs/user/${userId}/logins`, { params }),
    getMyLoginHistory: (params) => api.get('/activity-logs/my/logins', { params }),
    getEntityHistory: (model, entityId, params) => api.get(`/activity-logs/entity/${model}/${entityId}`, { params }),
    getSuspicious: (params) => api.get('/activity-logs/security/suspicious', { params }),
    reviewSuspicious: (id, userId) => api.post(`/activity-logs/security/${id}/review`, { userId }),
    getStats: (params) => api.get('/activity-logs/stats/overview', { params }),
    getActions: () => api.get('/activity-logs/meta/actions'),
    getModules: () => api.get('/activity-logs/meta/modules'),
    cleanup: (daysToKeep) => api.delete('/activity-logs/cleanup', { params: { daysToKeep } }),
    export: (params) => api.get('/activity-logs/export', { params, responseType: 'blob' }),
};
