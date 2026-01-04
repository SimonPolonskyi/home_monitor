import { getDB } from '../database/db.js';

export class Device {
  /**
   * Створити або оновити пристрій
   */
  static upsert(deviceId, deviceType, data = {}) {
    const db = getDB();
    
    // Перевірити чи існує
    const existing = db.prepare('SELECT * FROM devices WHERE device_id = ?').get(deviceId);
    
    if (existing) {
      // Оновити
      db.prepare(`
        UPDATE devices 
        SET device_type = ?, name = ?, location = ?, model = ?, 
            firmware_version = ?, config = ?, last_seen = CURRENT_TIMESTAMP
        WHERE device_id = ?
      `).run(
        deviceType,
        data.name || existing.name,
        data.location || existing.location,
        data.model || existing.model,
        data.firmware_version || existing.firmware_version,
        data.config ? JSON.stringify(data.config) : existing.config,
        deviceId
      );
      return this.findByDeviceId(deviceId);
    } else {
      // Створити новий
      const result = db.prepare(`
        INSERT INTO devices (device_id, device_type, name, location, model, firmware_version, config, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        deviceId,
        deviceType,
        data.name || null,
        data.location || null,
        data.model || null,
        data.firmware_version || null,
        data.config ? JSON.stringify(data.config) : null
      );
      return this.findByDeviceId(deviceId);
    }
  }

  /**
   * Знайти пристрій за device_id
   */
  static findByDeviceId(deviceId) {
    const db = getDB();
    const device = db.prepare('SELECT * FROM devices WHERE device_id = ?').get(deviceId);
    if (device && device.config) {
      try {
        device.config = JSON.parse(device.config);
      } catch (e) {
        device.config = null;
      }
    }
    return device;
  }

  /**
   * Отримати всі пристрої
   */
  static findAll(type = null) {
    const db = getDB();
    let query = 'SELECT * FROM devices';
    const params = [];
    
    if (type) {
      query += ' WHERE device_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY last_seen DESC';
    
    const devices = db.prepare(query).all(...params);
    
    // Парсити JSON config
    return devices.map(device => {
      if (device.config) {
        try {
          device.config = JSON.parse(device.config);
        } catch (e) {
          device.config = null;
        }
      }
      return device;
    });
  }

  /**
   * Отримати поточний стан пристрою (останні дані)
   */
  static getCurrentState(deviceId) {
    const db = getDB();
    const measurement = db.prepare(`
      SELECT * FROM measurements 
      WHERE device_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get(deviceId);
    
    if (measurement) {
      try {
        measurement.data = JSON.parse(measurement.data);
      } catch (e) {
        measurement.data = null;
      }
    }
    
    return measurement;
  }
}
