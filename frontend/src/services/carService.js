import api from './api';

export const carService = {
  async getAllCars(params = {}) {
    const response = await api.get('/cars', { params });
    return response.data;
  },

  async getFeaturedCars() {
    const response = await api.get('/cars/featured');
    return response.data;
  },

  async getCarById(id) {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  },

  async checkAvailability(id, pickupDate, returnDate) {
    const response = await api.get(`/cars/${id}/check-availability`, {
      params: { pickup_date: pickupDate, return_date: returnDate }
    });
    return response.data;
  },

  // Admin methods
  async createCar(carData) {
    const response = await api.post('/cars', carData);
    return response.data;
  },

  async updateCar(id, carData) {
    const response = await api.put(`/cars/${id}`, carData);
    return response.data;
  },

  async deleteCar(id) {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  },

  async getCarBookings(id) {
    const response = await api.get(`/cars/${id}/bookings`);
    return response.data;
  }
};
