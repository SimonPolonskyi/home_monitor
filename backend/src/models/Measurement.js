import { getDB } from '../database/db.js';

export class Measurement {
  /**
   * Створити вимірювання
   */
  static create(deviceId, timestamp, status, dataValid, data) {
    const db = getDB();
    const dataJson = JSON.stringify(data);
    
    const result = db.prepare(`
      INSERT INTO measurements (device_id, timestamp, status, data_valid, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(deviceId, timestamp, status, dataValid ? 1 : 0, dataJson);
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Знайти вимірювання за ID
   */
  static findById(id) {
    const db = getDB();
    const measurement = db.prepare('SELECT * FROM measurements WHERE id = ?').get(id);
    if (measurement) {
      try {
        measurement.data = JSON.parse(measurement.data);
      } catch (e) {
        measurement.data = null;
      }
    }
    return measurement;
  }

  /**
   * Отримати історію вимірювань
   */
  static getHistory(deviceId, options = {}) {
    const db = getDB();
    const {
      from = null,
      to = null,
      limit = 1000,
    } = options;
    
    let query = 'SELECT * FROM measurements WHERE device_id = ?';
    const params = [deviceId];
    
    if (from) {
      query += ' AND timestamp >= ?';
      params.push(from);
    }
    
    if (to) {
      query += ' AND timestamp <= ?';
      params.push(to);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
    
    const measurements = db.prepare(query).all(...params);
    
    // Парсити JSON data
    return measurements.map(m => {
      try {
        m.data = JSON.parse(m.data);
      } catch (e) {
        m.data = null;
      }
      return m;
    });
  }

  /**
   * Отримати статистику за період
   */
  static getStats(deviceId, from, to) {
    const db = getDB();
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as count,
        AVG(CASE WHEN json_extract(data, '$.battery.voltage') IS NOT NULL 
            THEN json_extract(data, '$.battery.voltage') ELSE NULL END) as avg_battery_voltage,
        AVG(CASE WHEN json_extract(data, '$.temperature') IS NOT NULL 
            THEN json_extract(data, '$.temperature') ELSE NULL END) as avg_temperature,
        AVG(CASE WHEN json_extract(data, '$.efficiency') IS NOT NULL 
            THEN json_extract(data, '$.efficiency') ELSE NULL END) as avg_efficiency
      FROM measurements
      WHERE device_id = ? AND timestamp >= ? AND timestamp <= ?
    `).get(deviceId, from, to);
    
    return stats;
  }
}
