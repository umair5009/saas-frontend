import api from '../axios';

export const libraryApi = {
  // Books
  getBooks: (params) => api.get('/library/books', { params }),
  getBook: (id) => api.get(`/library/books/${id}`),
  getBookById: (id) => api.get(`/library/books/${id}`), // Alias for compatibility
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
  deleteBook: (id) => api.delete(`/library/books/${id}`),
  addBookCopies: (id, data) => api.post(`/library/books/${id}/copies`, data),

  // Categories
  getCategories: (params) => api.get('/library/categories', { params }),
  createCategory: (data) => api.post('/library/categories', data),
  updateCategory: (id, data) => api.put(`/library/categories/${id}`, data),

  // Issue/Return
  issueBook: (data) => api.post('/library/issue', data),
  returnBook: (data) => api.post('/library/return', data),
  renewBook: (transactionId) => api.post(`/library/renew/${transactionId}`),

  // Transactions
  getTransactions: (params) => api.get('/library/transactions', { params }),
  getTransaction: (id) => api.get(`/library/transactions/${id}`),
  getOverdueReport: (params) => api.get('/library/overdue-report', { params }),

  // Members
  getMembers: (params) => api.get('/library/members', { params }),
  getMemberHistory: (memberType, memberId, params) => api.get(`/library/member-history/${memberType}/${memberId}`, { params }),

  // Reservations
  reserveBook: (data) => api.post('/library/reserve', data),
  cancelReservation: (id) => api.post(`/library/reservations/${id}/cancel`),
  getReservations: (params) => api.get('/library/reservations', { params }),

  // Dashboard
  getDashboard: (params) => api.get('/library/dashboard', { params }),

  // Fines
  collectFine: (id, data) => api.post(`/library/fines/${id}/collect`, data),
  waiveFine: (id, data) => api.post(`/library/fines/${id}/waive`, data),

  // Settings
  getLibrarySettings: () => api.get('/library/settings'),
  updateLibrarySettings: (data) => api.put('/library/settings', data),
};

