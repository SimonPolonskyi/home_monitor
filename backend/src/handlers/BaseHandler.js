/**
 * Базовий клас для обробки даних від пристроїв
 */
export class BaseHandler {
  /**
   * Валідація даних
   */
  static validate(data) {
    if (!data.device_id) {
      throw new Error('device_id is required');
    }
    if (!data.timestamp) {
      throw new Error('timestamp is required');
    }
    return true;
  }

  /**
   * Нормалізація даних в уніфікований формат
   */
  static normalize(data) {
    return {
      device_id: data.device_id,
      timestamp: data.timestamp,
      status: data.status || 'ok',
      data_valid: data.data_valid !== false,
      data: data,
    };
  }

  /**
   * Обробка даних
   */
  static process(data) {
    this.validate(data);
    return this.normalize(data);
  }
}
