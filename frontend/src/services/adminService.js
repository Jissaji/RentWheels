import api from './api';

export const adminService = {
  // Dashboard Analytics
  async getDashboardStats() {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  // Customer Management
  async getAllUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  },

  // Maintenance Management
  async getAllMaintenance(params = {}) {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  async createMaintenance(data) {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  async updateMaintenance(id, data) {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  async deleteMaintenance(id) {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  // Payment Management
  async getAllPayments(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  async updatePaymentStatus(id, payment_status) {
    const response = await api.put(`/payments/${id}`, { payment_status });
    return response.data;
  }
};
