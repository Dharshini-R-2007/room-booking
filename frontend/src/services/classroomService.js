import api from './api';

export const classroomService = {
  getAllClassrooms: async () => {
    const response = await api.get('/api/classrooms');
    return response.data;
  },

  searchClassrooms: async (params = {}) => {
    const response = await api.get('/api/classrooms/search', { params });
    return response.data;
  },

  getClassroomById: async (id) => {
    const response = await api.get(`/api/classrooms/${id}`);
    return response.data;
  },

  createClassroom: async (data) => {
    const response = await api.post('/api/classrooms', data);
    return response.data;
  },

  updateClassroom: async (id, data) => {
    const response = await api.put(`/api/classrooms/${id}`, data);
    return response.data;
  },

  deleteClassroom: async (id) => {
    const response = await api.delete(`/api/classrooms/${id}`);
    return response.data;
  }
};

export default classroomService;
