import api from './api';

export const rentalRecordService = {
  async getAllRecords() {
    const response = await api.get('/rental-records');
    return response.data;
  },

  async getPendingPickups() {
    const response = await api.get('/rental-records/pending-pickups');
    return response.data;
  },

  async getActiveReturns() {
    const response = await api.get('/rental-records/active-returns');
    return response.data;
  },

  async processPickup(pickupData) {
    const response = await api.post('/rental-records/pickup', pickupData);
    return response.data;
  },

  async processReturn(returnData) {
    const response = await api.post('/rental-records/return', returnData);
    return response.data;
  }
};
