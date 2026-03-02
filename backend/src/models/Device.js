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
   * Оновити метадані пристрою (name, location)
   */
  static update(deviceId, data) {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM devices WHERE device_id = ?').get(deviceId);
    if (!existing) {
      return null;
    }

    const updates = [];
    const params = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      params.push(data.location);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      params.push(data.model);
    }
    if (updates.length === 0) {
      return this.findByDeviceId(deviceId);
    }

    params.push(deviceId);
    db.prepare(`
      UPDATE devices SET ${updates.join(', ')} WHERE device_id = ?
    `).run(...params);

    return this.findByDeviceId(deviceId);
  }

  /**
   * Отримати поточні стани для списку пристроїв (оптимізація для GET /devices)
   */
  static getCurrentStatesBatch(deviceIds) {
    if (!deviceIds.length) return {};
    const db = getDB();
    const placeholders = deviceIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT m1.* FROM measurements m1
      INNER JOIN (
        SELECT device_id, MAX(timestamp) as max_ts
        FROM measurements
        WHERE device_id IN (${placeholders})
        GROUP BY device_id
      ) m2 ON m1.device_id = m2.device_id AND m1.timestamp = m2.max_ts
    `).all(...deviceIds);

    const map = {};
    for (const row of rows) {
      try {
        row.data = JSON.parse(row.data);
      } catch (e) {
        row.data = null;
      }
      map[row.device_id] = row;
    }
    return map;
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
