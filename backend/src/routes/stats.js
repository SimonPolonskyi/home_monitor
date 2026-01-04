import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Device } from '../models/Device.js';
import { Measurement } from '../models/Measurement.js';
import { Error } from '../models/Error.js';
import { getDB } from '../database/db.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/stats
 * Загальна статистика
 */
router.get('/', (req, res) => {
  try {
    const db = getDB();
    
    // Статистика пристроїв
    const deviceStats = db.prepare(`
      SELECT 
        COUNT(*) as total_devices,
        COUNT(DISTINCT device_type) as device_types,
        COUNT(CASE WHEN last_seen > datetime('now', '-1 hour') THEN 1 END) as active_devices
      FROM devices
    `).get();
    
    // Статистика вимірювань
    const measurementStats = db.prepare(`
      SELECT 
        COUNT(*) as total_measurements,
        COUNT(DISTINCT device_id) as devices_with_data,
        MIN(timestamp) as first_measurement,
        MAX(timestamp) as last_measurement
      FROM measurements
    `).get();
    
    // Статистика помилок
    const errorStats = Error.getStats();
    
    // Статистика за статусами
    const statusStats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM measurements
      GROUP BY status
    `).all();
    
    // Статистика по пристроях
    const devices = Device.findAll();
    const devicesStats = devices.map(device => {
      const currentState = Device.getCurrentState(device.device_id);
      const deviceErrors = Error.getStats(device.device_id);
      
      return {
        device_id: device.device_id,
        name: device.name,
        type: device.device_type,
        last_seen: device.last_seen,
        current_status: currentState?.status || 'unknown',
        error_count: deviceErrors?.total || 0,
      };
    });
    
    res.json({
      success: true,
      stats: {
        devices: deviceStats,
        measurements: measurementStats,
        errors: errorStats,
        statuses: statusStats,
        devices_detail: devicesStats,
      },
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;
