import api from './api';

export const bookingService = {
  async calculatePrice(calculationData) {
    const response = await api.post('/bookings/calculate', calculationData);
    return response.data;
  },

  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async getCustomerSummary() {
    const response = await api.get('/bookings/customer-summary');
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async cancelBooking(id, reason) {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Admin methods
  async getAllBookings(params = {}) {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  async updateBookingStatus(id, status, reason = null) {
    const response = await api.put(`/bookings/${id}/status`, { status, reason });
    return response.data;
  },

  async modifyBooking(id, bookingData) {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  }
};
