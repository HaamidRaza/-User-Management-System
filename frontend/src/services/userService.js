import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data.user;
  },

  createUser: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data.user;
  },

  updateUser: async (id, updates) => {
    const { data } = await api.put(`/users/${id}`, updates);
    return data.user;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
