import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runMigration } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Запустити всі міграції
 */
export function runMigrations() {
  const migrationsDir = __dirname;
  const files = ['001_initial_schema.sql'];
  
  console.log('Running database migrations...');
  
  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');
    console.log(`Running migration: ${file}`);
    runMigration(sql);
  }
  
  console.log('Migrations completed!');
}
