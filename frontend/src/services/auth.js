import api from './api';

export const authService = {
  /**
   * Вхід користувача
   */
  async login(username, password) {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Вихід користувача
   */
  async logout() {
    await api.post('/auth/logout');
  },

  /**
   * Отримати поточного користувача
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
