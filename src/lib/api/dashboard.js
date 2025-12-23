import api from '../axios';

export const dashboardApi = {
  getStats: (params) => api.get('/reports/dashboard', { params }),
  getBranchSummary: (branchId) => api.get(`/reports/branch/${branchId}`),
  getRecentActivities: (params) => api.get('/activity-logs', { params }),
};

