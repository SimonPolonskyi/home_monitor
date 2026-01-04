/**
 * Конфігурація типів пристроїв
 * Легко додавати нові типи без зміни структури БД
 */
export const deviceTypes = {
  UPS: {
    name: 'UPS System',
    fields: ['battery', 'output', 'temperature', 'efficiency'],
    statusLevels: ['ok', 'warning', 'error', 'critical'],
    defaultInterval: 30000, // 30 секунд
    handler: 'UPSHandler',
  },
  // Приклад для майбутнього розширення
  // GENERATOR: {
  //   name: 'Generator',
  //   fields: ['fuel_level', 'runtime', 'load'],
  //   statusLevels: ['ok', 'warning', 'error'],
  //   defaultInterval: 60000,
  //   handler: 'GeneratorHandler',
  // },
};

/**
 * Визначення типу пристрою за структурою даних
 */
export function detectDeviceType(data) {
  // Якщо тип явно вказаний
  if (data.device_type && deviceTypes[data.device_type]) {
    return data.device_type;
  }

  // Автоматичне визначення за полями
  if (data.battery && data.output) {
    return 'UPS';
  }

  // За замовчуванням
  return 'UNKNOWN';
}
