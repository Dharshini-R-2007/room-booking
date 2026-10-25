import api from './api';

export const bookingService = {
  checkAvailableClassrooms: async (data) => {
    const response = await api.post('/api/bookings/available', data);
    return response.data;
  },

  createBooking: async (data) => {
    const response = await api.post('/api/bookings', data);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/api/bookings/my');
    return response.data;
  },

  getFilteredBookings: async (params = {}) => {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  }
};

export default bookingService;
