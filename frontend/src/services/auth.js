import api from './api';

export const authService = {
  /**
   * Вхід користувача
   */
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      console.log('Login response:', response);
      console.log('Login response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login request error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
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
