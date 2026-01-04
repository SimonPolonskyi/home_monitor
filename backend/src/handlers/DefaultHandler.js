import { BaseHandler } from './BaseHandler.js';

/**
 * Універсальний handler для невідомих типів пристроїв
 */
export class DefaultHandler extends BaseHandler {
  /**
   * Нормалізація даних (зберігає все як є)
   */
  static normalize(data) {
    const normalized = super.normalize(data);
    // Зберігаємо всі дані як є
    normalized.data = data;
    return normalized;
  }
}
