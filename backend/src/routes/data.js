import express from 'express';
import { validateApiKey } from '../middleware/apiKey.js';
import { validateJSON, validateDeviceData } from '../middleware/validation.js';
import { processDeviceData } from '../handlers/index.js';
import { Device } from '../models/Device.js';
import { Measurement } from '../models/Measurement.js';
import { Error } from '../models/Error.js';
import { detectDeviceType } from '../../config/device-types.js';
import { getDB } from '../database/db.js';

const router = express.Router();

/**
 * POST /api/data
 * Прийом даних від пристроїв (UPS)
 */
router.post(
  '/',
  validateApiKey,
  validateJSON,
  validateDeviceData,
  async (req, res) => {
    try {
      const rawData = req.body;
      
      // Обробити дані через handler
      const processed = processDeviceData(rawData);
      
      // Визначити тип пристрою
      const deviceType = processed.deviceType || detectDeviceType(rawData);
      
      // Створити або оновити пристрій
      const device = Device.upsert(rawData.device_id, deviceType);
      
      // Якщо це помилка
      if (processed.type === 'error') {
        const errorData = processed.data;
        await Error.create(
          errorData.device_id,
          errorData.timestamp,
          errorData.severity,
          errorData.category,
          errorData.message,
          errorData.error_stats,
          errorData.sensor_data
        );
        
        return res.status(200).json({
          success: true,
          message: 'Error data received',
        });
      }
      
      // Звичайні дані (measurement)
      const measurementData = processed.data;
      
      // Зберегти вимірювання
      await Measurement.create(
        measurementData.device_id,
        measurementData.timestamp,
        measurementData.status,
        measurementData.data_valid,
        measurementData.data
      );
      
      // Зберегти попередження якщо є
      if (rawData.warnings && Array.isArray(rawData.warnings)) {
        const db = getDB();
        for (const warning of rawData.warnings) {
          db.prepare(`
            INSERT INTO warnings (device_id, timestamp, message)
            VALUES (?, ?, ?)
          `).run(rawData.device_id, rawData.timestamp, warning);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Data received',
        device_id: rawData.device_id,
      });
      
    } catch (error) {
      console.error('Error processing device data:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Invalid data format',
      });
    }
  }
);

export default router;
