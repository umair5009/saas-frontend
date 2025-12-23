import api from '../axios';

export const transportApi = {
  // Vehicles
  getVehicles: (params) => api.get('/transport/vehicles', { params }),
  getVehicleById: (id) => api.get(`/transport/vehicles/${id}`),
  createVehicle: (data) => api.post('/transport/vehicles', data),
  updateVehicle: (id, data) => api.put(`/transport/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/transport/vehicles/${id}`),

  // Routes
  getRoutes: (params) => api.get('/transport/routes', { params }),
  getRouteById: (id) => api.get(`/transport/routes/${id}`),
  createRoute: (vehicleId, data) => api.post(`/transport/${vehicleId}/routes`, data),
  updateRoute: (vehicleId, routeId, data) => api.put(`/transport/${vehicleId}/routes/${routeId}`, data),
  deleteRoute: (vehicleId, routeId) => api.delete(`/transport/${vehicleId}/routes/${routeId}`),

  // Stops
  getStops: (params) => api.get('/transport/stops', { params }),
  addStop: (data) => api.post('/transport/stops', data),
  updateStop: (id, data) => api.put(`/transport/stops/${id}`, data),

  // Assignments
  getAssignments: (params) => api.get('/transport/assignments', { params }),
  assignStudent: (vehicleId, data) => api.post(`/transport/${vehicleId}/students/assign`, data),
  updateAssignment: (vehicleId, data) => api.put(`/transport/${vehicleId}/students/update`, data),
  removeAssignment: (vehicleId, data) => api.post(`/transport/${vehicleId}/students/remove`, data),

  // Drivers
  getDrivers: (params) => api.get('/transport/drivers', { params }),
  assignDriver: (data) => api.post('/transport/drivers/assign', data),

  // Tracking
  getVehicleLocation: (vehicleId) => api.get(`/transport/${vehicleId}/location`),
  updateLocation: (vehicleId, data) => api.post(`/transport/${vehicleId}/location`, data),

  // Dashboard
  getDashboard: (params) => api.get('/transport/dashboard', { params }),
};

