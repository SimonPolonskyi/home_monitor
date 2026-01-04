import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Device } from '../models/Device.js';
import { Measurement } from '../models/Measurement.js';
import { Error } from '../models/Error.js';
import { getDB } from '../database/db.js';

const router = express.Router();

// Всі routes потребують аутентифікації
router.use(requireAuth);

/**
 * GET /api/devices
 * Список всіх пристроїв
 */
router.get('/', (req, res) => {
  try {
    const { type } = req.query;
    const devices = Device.findAll(type || null);
    
    // Додати поточний стан для кожного пристрою
    const devicesWithState = devices.map(device => {
      const currentState = Device.getCurrentState(device.device_id);
      return {
        ...device,
        current_state: currentState,
      };
    });
    
    res.json({
      success: true,
      devices: devicesWithState,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch devices',
    });
  }
});

/**
 * GET /api/devices/:device_id
 * Детальна інформація про пристрій
 */
router.get('/:device_id', (req, res) => {
  try {
    const { device_id } = req.params;
    const device = Device.findByDeviceId(device_id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    
    res.json({
      success: true,
      device,
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device',
    });
  }
});

/**
 * GET /api/devices/:device_id/current
 * Поточний стан пристрою
 */
router.get('/:device_id/current', (req, res) => {
  try {
    const { device_id } = req.params;
    const currentState = Device.getCurrentState(device_id);
    
    if (!currentState) {
      return res.status(404).json({
        success: false,
        error: 'No data available for this device',
      });
    }
    
    res.json({
      success: true,
      data: currentState,
    });
  } catch (error) {
    console.error('Error fetching current state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current state',
    });
  }
});

/**
 * GET /api/devices/:device_id/history
 * Історія вимірювань
 */
router.get('/:device_id/history', (req, res) => {
  try {
    const { device_id } = req.params;
    const { from, to, limit = 1000 } = req.query;
    
    const options = {
      from: from ? parseInt(from) : null,
      to: to ? parseInt(to) : null,
      limit: parseInt(limit),
    };
    
    const history = Measurement.getHistory(device_id, options);
    
    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
    });
  }
});

/**
 * GET /api/devices/:device_id/errors
 * Список помилок пристрою
 */
router.get('/:device_id/errors', (req, res) => {
  try {
    const { device_id } = req.params;
    const { severity, limit = 100 } = req.query;
    
    const options = {
      severity: severity || null,
      limit: parseInt(limit),
    };
    
    const errors = Error.getByDevice(device_id, options);
    
    res.json({
      success: true,
      count: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch errors',
    });
  }
});

/**
 * GET /api/devices/:device_id/warnings
 * Список попереджень пристрою
 */
router.get('/:device_id/warnings', (req, res) => {
  try {
    const { device_id } = req.params;
    const { resolved, limit = 100 } = req.query;
    
    const db = getDB();
    let query = 'SELECT * FROM warnings WHERE device_id = ?';
    const params = [device_id];
    
    if (resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(resolved === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const warnings = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      count: warnings.length,
      warnings,
    });
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch warnings',
    });
  }
});

export default router;
