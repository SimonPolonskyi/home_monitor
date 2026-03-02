const WEAK_SECRETS = [
  'change-this-secret',
  'change-this-secret-key',
  'change-this-api-key',
  'your-secret-key-change-this',
  'your-device-api-key-change-this',
  'dev-secret-key',
  'dev-api-key',
];

/**
 * Перевірка безпечних налаштувань для production
 * Завершує процес з помилкою якщо виявлено небезпечні значення
 */
export function validateProductionConfig(config) {
  if (config.server.env !== 'production') {
    return;
  }

  const errors = [];

  if (WEAK_SECRETS.includes(config.session.secret)) {
    errors.push('SESSION_SECRET: використовується небезпечне значення за замовчуванням. Встановіть унікальний SESSION_SECRET в .env');
  }

  if (WEAK_SECRETS.includes(config.api.deviceApiKey)) {
    errors.push('DEVICE_API_KEY: використовується небезпечне значення за замовчуванням. Встановіть унікальний DEVICE_API_KEY в .env');
  }

  if (config.session.secret.length < 32) {
    errors.push('SESSION_SECRET: рекомендується мінімум 32 символи для production');
  }

  if (errors.length > 0) {
    console.error('\n=== ПОМИЛКА КОНФІГУРАЦІЇ PRODUCTION ===');
    errors.forEach((e) => console.error('  -', e));
    console.error('\nВстановіть безпечні значення в .env файлі та перезапустіть сервер.\n');
    process.exit(1);
  }
}
