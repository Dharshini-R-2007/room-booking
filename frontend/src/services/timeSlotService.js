import api from './api';

export const timeSlotService = {
  getTimeSlots: async (includeInactive = false) => {
    const response = await api.get('/api/time-slots', {
      params: { includeInactive }
    });
    return response.data;
  },

  createTimeSlot: async (data) => {
    const response = await api.post('/api/time-slots', data);
    return response.data;
  },

  updateTimeSlot: async (id, data) => {
    const response = await api.put(`/api/time-slots/${id}`, data);
    return response.data;
  },

  updateTimeSlotStatus: async (id, active) => {
    const response = await api.patch(`/api/time-slots/${id}/status`, { active });
    return response.data;
  },

  deleteTimeSlot: async (id) => {
    const response = await api.delete(`/api/time-slots/${id}`);
    return response.data;
  }
};

export default timeSlotService;
