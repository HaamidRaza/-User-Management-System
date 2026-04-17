import api from "./api";

export const userService = {
  getUsers: async (params = {}) => {
    // Remove empty string/null/undefined values so they don't get sent as role=&status=
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== "" && v != null),
    );
    const { data } = await api.get("/users", { params: cleanParams });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get("/users/stats");
    return data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data.user;
  },

  createUser: async (userData) => {
    const { data } = await api.post("/users", userData);
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
