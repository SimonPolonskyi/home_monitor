import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    path: process.env.DB_PATH || './data/ups_monitor.db',
    // PostgreSQL налаштування (для майбутнього)
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 години
  },
  api: {
    deviceApiKey: process.env.DEVICE_API_KEY || 'change-this-api-key',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
};
