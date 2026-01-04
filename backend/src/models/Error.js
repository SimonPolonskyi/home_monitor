import { getDB } from '../database/db.js';

export class Error {
  /**
   * Створити запис помилки
   */
  static create(deviceId, timestamp, severity, category, message, errorStats = null, sensorData = null) {
    const db = getDB();
    
    const result = db.prepare(`
      INSERT INTO errors (device_id, timestamp, severity, category, message, error_stats, sensor_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      deviceId,
      timestamp,
      severity,
      category,
      message,
      errorStats ? JSON.stringify(errorStats) : null,
      sensorData ? JSON.stringify(sensorData) : null
    );
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Знайти помилку за ID
   */
  static findById(id) {
    const db = getDB();
    const error = db.prepare('SELECT * FROM errors WHERE id = ?').get(id);
    if (error) {
      if (error.error_stats) {
        try {
          error.error_stats = JSON.parse(error.error_stats);
        } catch (e) {
          error.error_stats = null;
        }
      }
      if (error.sensor_data) {
        try {
          error.sensor_data = JSON.parse(error.sensor_data);
        } catch (e) {
          error.sensor_data = null;
        }
      }
    }
    return error;
  }

  /**
   * Отримати помилки пристрою
   */
  static getByDevice(deviceId, options = {}) {
    const db = getDB();
    const {
      severity = null,
      limit = 100,
    } = options;
    
    let query = 'SELECT * FROM errors WHERE device_id = ?';
    const params = [deviceId];
    
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
    
    const errors = db.prepare(query).all(...params);
    
    // Парсити JSON поля
    return errors.map(e => {
      if (e.error_stats) {
        try {
          e.error_stats = JSON.parse(e.error_stats);
        } catch (err) {
          e.error_stats = null;
        }
      }
      if (e.sensor_data) {
        try {
          e.sensor_data = JSON.parse(e.sensor_data);
        } catch (err) {
          e.sensor_data = null;
        }
      }
      return e;
    });
  }

  /**
   * Отримати статистику помилок
   */
  static getStats(deviceId = null) {
    const db = getDB();
    
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info
      FROM errors
    `;
    
    const params = [];
    if (deviceId) {
      query += ' WHERE device_id = ?';
      params.push(deviceId);
    }
    
    return db.prepare(query).get(...params);
  }
}
