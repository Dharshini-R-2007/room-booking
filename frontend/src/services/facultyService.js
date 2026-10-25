import api from './api';

export const facultyService = {
  getAllFaculty: async () => {
    const response = await api.get('/api/faculties');
    return response.data;
  },

  getFacultyById: async (id) => {
    const response = await api.get(`/api/faculties/${id}`);
    return response.data;
  },

  createFaculty: async (data) => {
    const response = await api.post('/api/faculties', data);
    return response.data;
  },

  updateFaculty: async (id, data) => {
    const response = await api.put(`/api/faculties/${id}`, data);
    return response.data;
  },

  deleteFaculty: async (id) => {
    const response = await api.delete(`/api/faculties/${id}`);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get('/api/faculty/dashboard/summary');
    return response.data;
  },

  getDashboardBookings: async (params = {}) => {
    const response = await api.get('/api/faculty/dashboard/bookings', { params });
    return response.data;
  },

  getDashboardBookingById: async (bookingId) => {
    const response = await api.get(`/api/faculty/dashboard/bookings/${bookingId}`);
    return response.data;
  },

  getClassroomSchedule: async (classroomId, date) => {
    const response = await api.get(`/api/faculty/dashboard/classrooms/${classroomId}/schedule`, {
      params: { date }
    });
    return response.data;
  },

  getBookingsByClass: async (className, params = {}) => {
    const response = await api.get(`/api/faculty/dashboard/classes/${className}/bookings`, { params });
    return response.data;
  }
};

export default facultyService;
