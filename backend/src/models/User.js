import { getDB } from '../database/db.js';
import { hashPassword, verifyPassword } from '../auth/password.js';

export class User {
  /**
   * Створити користувача
   */
  static async create(username, password, email = null, role = 'viewer') {
    const db = getDB();
    const passwordHash = await hashPassword(password);
    
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, email, role)
      VALUES (?, ?, ?, ?)
    `).run(username, passwordHash, email, role);
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Знайти користувача за ID
   */
  static findById(id) {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (user) {
      delete user.password_hash; // Не повертаємо хеш
    }
    return user;
  }

  /**
   * Знайти користувача за username
   */
  static findByUsername(username) {
    const db = getDB();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  /**
   * Перевірити пароль
   */
  static async verifyUser(username, password) {
    const user = this.findByUsername(username);
    if (!user) {
      return null;
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return null;
    }
    
    // Оновити last_login
    const db = getDB();
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
      .run(user.id);
    
    // Повернути користувача без пароля
    delete user.password_hash;
    return user;
  }

  /**
   * Отримати всіх користувачів
   */
  static findAll() {
    const db = getDB();
    const users = db.prepare('SELECT id, username, email, role, created_at, last_login FROM users').all();
    return users;
  }
}
