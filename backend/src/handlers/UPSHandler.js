import { BaseHandler } from './BaseHandler.js';

/**
 * Handler для обробки даних від UPS пристроїв
 */
export class UPSHandler extends BaseHandler {
  /**
   * Валідація UPS даних
   */
  static validate(data) {
    super.validate(data);
    
    // Перевірка обов'язкових полів для UPS
    if (!data.battery && !data.output) {
      throw new Error('UPS data must contain battery or output fields');
    }
    
    // Валідація статусу
    const validStatuses = ['ok', 'warning', 'error', 'critical'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: ${data.status}`);
    }
    
    return true;
  }

  /**
   * Нормалізація UPS даних
   */
  static normalize(data) {
    const normalized = super.normalize(data);
    
    // Зберегти temperature для backward compatibility (якщо є старий формат)
    const temperatureLegacy = data.temperature ?? 
      data.temperature_battery?.value ?? 
      data.temperature_board?.value ?? 
      null;
    
    // Структурувати дані для зберігання
    normalized.data = {
      battery: data.battery || null,
      output: data.output || null,
      // Новий формат: temperature_battery, temperature_board
      temperature_battery: data.temperature_battery || null,
      temperature_board: data.temperature_board || null,
      // Backward compatibility
      temperature: temperatureLegacy,
      temperature_valid: data.temperature_valid !== false,
      efficiency: data.efficiency || null,
      energy_consumed: data.energy_consumed || null,
      energy_supplied: data.energy_supplied || null,
      capacity: data.capacity || null,
      errors: data.errors || null,
      warnings: data.warnings || null,
    };
    
    return normalized;
  }

  /**
   * Обробка помилок від UPS
   */
  static processError(data) {
    if (!data.type || data.type !== 'error') {
      throw new Error('Invalid error data format');
    }
    
    return {
      device_id: data.device_id,
      timestamp: data.timestamp,
      severity: data.severity || 'error',
      category: data.category || 'system',
      message: data.message || 'Unknown error',
      error_stats: data.error_stats || null,
      sensor_data: data.sensor_data || null,
    };
  }
}
