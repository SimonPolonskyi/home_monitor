import { User } from '../src/models/User.js';
import { getDB } from '../src/database/db.js';

// Парсити аргументи командного рядка
const args = process.argv.slice(2);
let username = null;
let password = null;
let role = 'viewer';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--username' || args[i] === '-u') {
    username = args[i + 1];
    i++;
  } else if (args[i] === '--password' || args[i] === '-p') {
    password = args[i + 1];
    i++;
  } else if (args[i] === '--role' || args[i] === '-r') {
    role = args[i + 1];
    i++;
  }
}

async function createUser() {
  try {
    if (!username || !password) {
      console.error('Usage: node create-user.js --username <username> --password <password> [--role admin|viewer]');
      process.exit(1);
    }
    
    // Перевірити чи існує користувач
    const existing = User.findByUsername(username);
    if (existing) {
      console.error(`User ${username} already exists`);
      process.exit(1);
    }
    
    // Створити користувача
    const user = await User.create(username, password, null, role);
    console.log(`User created successfully:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  ID: ${user.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createUser();
