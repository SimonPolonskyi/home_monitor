/**
 * Скрипт для видалення старих даних
 * Запуск: node scripts/cleanup-old-data.js [days]
 * За замовчуванням видаляє measurements старші 90 днів
 */
import { getDB } from '../src/database/db.js';

const DEFAULT_DAYS = 90;

async function cleanup() {
  const days = parseInt(process.argv[2]) || DEFAULT_DAYS;
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

  try {
    const db = getDB();

    // Видалити старі measurements
    const measurementsResult = db.prepare(
      'DELETE FROM measurements WHERE timestamp < ?'
    ).run(cutoffMs);

    // Видалити старі errors
    const errorsResult = db.prepare(
      'DELETE FROM errors WHERE timestamp < ?'
    ).run(cutoffMs);

    // Видалити старі warnings
    const warningsResult = db.prepare(
      'DELETE FROM warnings WHERE timestamp < ?'
    ).run(cutoffMs);

    console.log(`Cleanup completed (data older than ${days} days):`);
    console.log(`  Measurements deleted: ${measurementsResult.changes}`);
    console.log(`  Errors deleted: ${errorsResult.changes}`);
    console.log(`  Warnings deleted: ${warningsResult.changes}`);

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
