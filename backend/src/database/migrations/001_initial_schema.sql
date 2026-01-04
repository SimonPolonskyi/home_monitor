-- Створення таблиці users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'viewer' CHECK(role IN ('admin', 'viewer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Створення таблиці devices
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT UNIQUE NOT NULL,
  device_type TEXT DEFAULT 'UNKNOWN',
  name TEXT,
  location TEXT,
  model TEXT,
  firmware_version TEXT,
  config TEXT, -- JSON
  last_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці measurements
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ok', 'warning', 'error', 'critical')),
  data_valid BOOLEAN DEFAULT 1,
  data TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Створення таблиці errors
CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('critical', 'error', 'warning', 'info')),
  category TEXT NOT NULL CHECK(category IN ('sensor', 'storage', 'network', 'system', 'display')),
  message TEXT NOT NULL,
  error_stats TEXT, -- JSON
  sensor_data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Створення таблиці warnings
CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Індекси для продуктивності
CREATE INDEX IF NOT EXISTS idx_measurements_device_id ON measurements(device_id);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_errors_device_id ON errors(device_id);
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON errors(severity);
CREATE INDEX IF NOT EXISTS idx_warnings_device_id ON warnings(device_id);
CREATE INDEX IF NOT EXISTS idx_warnings_timestamp ON warnings(timestamp);
