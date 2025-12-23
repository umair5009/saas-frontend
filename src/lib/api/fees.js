import api from '../axios';

export const feeApi = {
  // Fee Structures
  getStructures: (params) => api.get('/fees/structures', { params }),
  createStructure: (data) => api.post('/fees/structures', data),
  updateStructure: (id, data) => api.put(`/fees/structures/${id}`, data),
  deleteStructure: (id) => api.delete(`/fees/structures/${id}`),

  // Scholarships
  getScholarships: (params) => api.get('/fees/scholarships', { params }),
  createScholarship: (data) => api.post('/fees/scholarships', data),
  updateScholarship: (id, data) => api.put(`/fees/scholarships/${id}`, data),
  deleteScholarship: (id) => api.delete(`/fees/scholarships/${id}`),

  // Discount Rules
  getDiscountRules: (params) => api.get('/fees/discount-rules', { params }),
  createDiscountRule: (data) => api.post('/fees/discount-rules', data),
  updateDiscountRule: (id, data) => api.put(`/fees/discount-rules/${id}`, data),

  // Installment Plans
  getInstallmentPlans: (params) => api.get('/fees/installment-plans', { params }),
  createInstallmentPlan: (data) => api.post('/fees/installment-plans', data),

  // Invoices
  getInvoices: (params) => api.get('/fees/invoices', { params }),
  getInvoiceById: (id) => api.get(`/fees/invoices/${id}`),
  createInvoice: (data) => api.post('/fees/invoices', data),
  generateInvoices: (data) => api.post('/fees/invoices/bulk', data),
  updateInvoice: (id, data) => api.put(`/fees/invoices/${id}`, data),
  cancelInvoice: (id) => api.post(`/fees/invoices/${id}/cancel`),
  applyLateFee: (id, data) => api.post(`/fees/invoices/${id}/late-fee`, data),
  waiveLateFee: (id) => api.post(`/fees/invoices/${id}/waive-late-fee`),

  // Payments
  collectPayment: (data) => api.post('/fees/payments', data),
  getPayments: (params) => api.get('/fees/payments', { params }),
  getPayment: (id) => api.get(`/fees/payments/${id}`),
  processRefund: (id, data) => api.post(`/fees/payments/${id}/refund`, data),

  // Reminders
  sendReminder: (data) => api.post('/fees/reminders', data),
  getReminders: (params) => api.get('/fees/reminders', { params }),

  // Reports
  getSummary: (params) => api.get('/fees/summary', { params }),
  getStudentLedger: (studentId, params) => api.get(`/fees/ledger/${studentId}`, { params }),
  getDefaulters: (params) => api.get('/fees/defaulters', { params }),
};
