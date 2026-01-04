import { runMigrations } from '../src/database/migrations/run-migrations.js';
import { User } from '../src/models/User.js';
import { config } from '../config/config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Створити папку data
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created data directory');
    }
    
    // Запустити міграції
    runMigrations();
    
    // Створити адміністратора якщо вказано в env
    if (config.admin.username && config.admin.password) {
      try {
        const existingUser = User.findByUsername(config.admin.username);
        if (!existingUser) {
          await User.create(
            config.admin.username,
            config.admin.password,
            null,
            'admin'
          );
          console.log(`Created admin user: ${config.admin.username}`);
        } else {
          console.log(`Admin user already exists: ${config.admin.username}`);
        }
      } catch (error) {
        console.error('Error creating admin user:', error);
      }
    }
    
    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
