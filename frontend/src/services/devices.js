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
   * Оновити пристрій
   */
  async updateDevice(deviceId, data) {
    const response = await api.patch(`/devices/${deviceId}`, data);
    return response.data;
  },

  /**
   * Експорт даних (format: csv | json). Для CSV повертає blob для завантаження.
   */
  async exportData(deviceId, options = {}) {
    const params = new URLSearchParams({ format: 'json', ...options });
    const response = await api.get(`/devices/${deviceId}/export?${params}`);
    return response.data;
  },

  /**
   * Завантажити CSV файл
   */
  async downloadCsv(deviceId, options = {}) {
    const params = new URLSearchParams({ format: 'csv', ...options });
    const response = await api.get(`/devices/${deviceId}/export?${params}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ups-${deviceId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
