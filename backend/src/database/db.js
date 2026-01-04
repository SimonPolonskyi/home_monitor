import Database from 'better-sqlite3';
import { config } from '../../config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Отримати підключення до БД
 */
export function getDB() {
  if (!db) {
    const dbPath = path.resolve(__dirname, '../../', config.database.path);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Покращена продуктивність
    db.pragma('foreign_keys = ON'); // Включити foreign keys
  }
  return db;
}

/**
 * Закрити підключення до БД
 */
export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Виконати міграцію
 */
export function runMigration(sql) {
  const database = getDB();
  database.exec(sql);
}
