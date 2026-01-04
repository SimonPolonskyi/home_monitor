import api from './api';

export const deviceService = {
  /**
   * Отримати всі пристрої
   */
  async getDevices(type = null) {
    const params = type ? { type } : {};
    const response = await api.get('/devices', { params });
    return response.data;
  },

  /**
   * Отримати пристрій за ID
   */
  async getDevice(deviceId) {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
  },

  /**
   * Отримати поточний стан пристрою
   */
  async getCurrentState(deviceId) {
    const response = await api.get(`/devices/${deviceId}/current`);
    return response.data;
  },

  /**
   * Отримати історію вимірювань
   */
  async getHistory(deviceId, options = {}) {
    const response = await api.get(`/devices/${deviceId}/history`, {
      params: options,
    });
    return response.data;
  },

  /**
   * Отримати помилки пристрою
   */
  async getErrors(deviceId, options = {}) {
    const response = await api.get(`/devices/${deviceId}/errors`, {
      params: options,
    });
    return response.data;
  },

  /**
   * Отримати попередження пристрою
   */
  async getWarnings(deviceId, options = {}) {
    const response = await api.get(`/devices/${deviceId}/warnings`, {
      params: options,
    });
    return response.data;
  },
};
