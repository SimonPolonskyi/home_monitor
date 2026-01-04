import api from './api';

export const authService = {
  /**
   * Вхід користувача
   */
  async login(username, password) {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Вихід користувача
   */
  async logout() {
    await api.post('/api/auth/logout');
  },

  /**
   * Отримати поточного користувача
   */
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
