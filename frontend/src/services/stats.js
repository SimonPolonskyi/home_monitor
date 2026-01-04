import api from './api';

export const statsService = {
  /**
   * Отримати загальну статистику
   */
  async getStats() {
    const response = await api.get('/stats');
    return response.data;
  },
};
