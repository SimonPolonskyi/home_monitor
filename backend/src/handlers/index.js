import { UPSHandler } from './UPSHandler.js';
import { DefaultHandler } from './DefaultHandler.js';
import { detectDeviceType } from '../../config/device-types.js';

/**
 * Роутер для вибору правильного handler за типом пристрою
 */
export function getHandler(deviceType) {
  const handlers = {
    'UPS': UPSHandler,
    'UNKNOWN': DefaultHandler,
  };
  
  return handlers[deviceType] || DefaultHandler;
}

/**
 * Обробити дані від пристрою
 */
export function processDeviceData(data) {
  const deviceType = detectDeviceType(data);
  const Handler = getHandler(deviceType);
  
  // Якщо це помилка
  if (data.type === 'error') {
    if (Handler.processError) {
      return {
        type: 'error',
        handler: Handler,
        data: Handler.processError(data),
      };
    }
  }
  
  // Звичайні дані
  return {
    type: 'measurement',
    deviceType,
    handler: Handler,
    data: Handler.process(data),
  };
}
