import axios from '../axios';

export const settingsApi = {
    // Get all settings (merged)
    getSettings: () => axios.get('/settings'),

    // Generic update section
    updateSection: (section, data) => axios.put(`/settings/${section}`, data),

    // Specific updates (wrappers)
    updateBranding: (data) => axios.put('/settings/branding', data),
    updateLocalization: (data) => axios.put('/settings/localization', data),
    updateSecurity: (data) => axios.put('/settings/security', data),
    updateNotifications: (data) => axios.put('/settings/notificationSettings', data),
    updateFeeRules: (data) => axios.put('/settings/feeRules', data),
    updateLibraryRules: (data) => axios.put('/settings/libraryRules', data),
    updateAcademicYear: (data) => axios.put('/settings/academicYear', data),
    updateGradingSystem: (data) => axios.put('/settings/gradingSystem', data),
    updateAttendanceRules: (data) => axios.put('/settings/attendanceRules', data),
    updateExamRules: (data) => axios.put('/settings/examRules', data),

    // Toggle module
    toggleModule: (module, enabled) => axios.post('/settings/toggle-module', { module, enabled }),

    // API Keys
    createApiKey: (data) => axios.post('/settings/api-keys', data),
    revokeApiKey: (keyId) => axios.delete(`/settings/api-keys/${keyId}`),
};
