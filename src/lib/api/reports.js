import api from '../axios';

export const reportsApi = {
  // Dashboard
  getDashboard: (params) => api.get('/reports/dashboard', { params }),
  getBranchSummary: (branchId, params) => api.get(`/reports/branch/${branchId}`, { params }),

  // Student Reports
  getStudentReport: (params) => api.get('/reports/students', { params }),
  getStudentStrength: (params) => api.get('/reports/students/strength', { params }),
  getStudentAdmissions: (params) => api.get('/reports/students/admissions', { params }),

  // Fee Reports
  getFeeReport: (params) => api.get('/reports/fees', { params }),
  getFeeCollection: (params) => api.get('/reports/fees/collection', { params }),
  getFeePending: (params) => api.get('/reports/fees/pending', { params }),
  getFeeDefaulters: (params) => api.get('/reports/fees/defaulters', { params }),

  // Attendance Reports
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getAttendanceSummary: (params) => api.get('/reports/attendance/summary', { params }),
  getAbsenteeReport: (params) => api.get('/reports/attendance/absentees', { params }),

  // Exam Reports
  getExamReport: (params) => api.get('/reports/exams', { params }),
  getExamResults: (params) => api.get('/reports/exams/results', { params }),
  getClassPerformance: (params) => api.get('/reports/exams/class-performance', { params }),
  getSubjectAnalysis: (params) => api.get('/reports/exams/subject-analysis', { params }),

  // Staff Reports
  getStaffReport: (params) => api.get('/reports/staff', { params }),
  getStaffAttendance: (params) => api.get('/reports/staff/attendance', { params }),

  // Financial Reports
  getFinancialReport: (params) => api.get('/reports/financial', { params }),
  getIncomeExpense: (params) => api.get('/reports/financial/income-expense', { params }),

  // Custom Reports
  getCustomReport: (params) => api.get('/reports/custom', { params }),
  createCustomReport: (data) => api.post('/reports/custom', data),

  // Export
  exportReport: (reportType, format, params) =>
    api.get(`/reports/export/${format}`, {
      params: { ...params, reportType },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

