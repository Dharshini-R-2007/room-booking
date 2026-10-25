import api from './api';

export const studentService = {
  getStudents: async () => {
    const response = await api.get('/api/students');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },

  createStudent: async (data) => {
    const response = await api.post('/api/students', data);
    return response.data;
  },

  updateStudent: async (id, data) => {
    const response = await api.put(`/api/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/api/students/me');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/api/students/me/password', data);
    return response.data;
  }
};

export default studentService;
