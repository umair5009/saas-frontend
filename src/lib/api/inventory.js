import api from '../axios';

export const inventoryApi = {
  // ==================== ITEMS/ASSETS ====================
  getItems: (params) => api.get('/inventory', { params }),
  getItemById: (id) => api.get(`/inventory/${id}`),
  createItem: (data) => api.post('/inventory', data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),

  // ==================== SUMMARY & STATS ====================
  getSummary: (params) => api.get('/inventory/summary', { params }),

  // ==================== ASSIGNMENT ====================
  assignItem: (id, data) => api.post(`/inventory/${id}/assign`, data),
  returnItem: (id, data) => api.post(`/inventory/${id}/return`, data),

  // ==================== MAINTENANCE ====================
  scheduleMaintenance: (id, data) => api.post(`/inventory/${id}/maintenance/schedule`, data),
  completeMaintenance: (id, data) => api.post(`/inventory/${id}/maintenance/complete`, data),

  // ==================== TRANSFER & DISPOSAL ====================
  transferItem: (id, data) => api.post(`/inventory/${id}/transfer`, data),
  disposeItem: (id, data) => api.post(`/inventory/${id}/dispose`, data),

  // ==================== STOCK ====================
  updateStock: (id, data) => api.post(`/inventory/${id}/stock`, data),

  // ==================== ALERTS ====================
  getLowStock: (params) => api.get('/inventory/alerts/low-stock', { params }),
  getMaintenanceDue: (params) => api.get('/inventory/alerts/maintenance-due', { params }),
  getWarrantyExpiring: (params) => api.get('/inventory/alerts/warranty-expiring', { params }),

  // ==================== REPORTS ====================
  getDepreciationReport: (params) => api.get('/inventory/reports/depreciation', { params }),

  // ==================== CATEGORIES ====================
  getCategories: (params) => api.get('/inventory/categories', { params }),
  getCategoryById: (id) => api.get(`/inventory/categories/${id}`),
  createCategory: (data) => api.post('/inventory/categories', data),
  updateCategory: (id, data) => api.put(`/inventory/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/inventory/categories/${id}`),

  // ==================== VENDORS ====================
  getVendors: (params) => api.get('/inventory/vendors', { params }),
  getVendorById: (id) => api.get(`/inventory/vendors/${id}`),
  createVendor: (data) => api.post('/inventory/vendors', data),
  updateVendor: (id, data) => api.put(`/inventory/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/inventory/vendors/${id}`),

  // ==================== PURCHASE ORDERS ====================
  getPurchaseOrders: (params) => api.get('/inventory/purchase-orders', { params }),
  getPurchaseOrderById: (id) => api.get(`/inventory/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post('/inventory/purchase-orders', data),
  updatePurchaseOrder: (id, data) => api.put(`/inventory/purchase-orders/${id}`, data),
  deletePurchaseOrder: (id) => api.delete(`/inventory/purchase-orders/${id}`),
};
