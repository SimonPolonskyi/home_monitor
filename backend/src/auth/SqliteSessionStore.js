import session from 'express-session';
import { getDB } from '../database/db.js';

/**
 * SQLite session store для express-session
 * Зберігає сесії в БД - не втрачаються при перезапуску
 * Розширює Store (надає createSession, EventEmitter)
 */
export class SqliteSessionStore extends session.Store {
  constructor() {
    super();
  }

  get(sid, callback) {
    try {
      const db = getDB();
      const row = db.prepare(
        'SELECT session FROM sessions WHERE sid = ? AND expires > ?'
      ).get(sid, Date.now());
      
      if (row) {
        callback(null, JSON.parse(row.session));
      } else {
        callback();
      }
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sess, callback) {
    try {
      const db = getDB();
      const expires = sess.cookie?.expires
        ? (sess.cookie.expires instanceof Date ? sess.cookie.expires.getTime() : Date.now() + sess.cookie.maxAge)
        : Date.now() + 86400000; // 24 години за замовчуванням
      
      const sessionStr = JSON.stringify(sess);
      
      db.prepare(`
        INSERT INTO sessions (sid, expires, session)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          expires = excluded.expires,
          session = excluded.session
      `).run(sid, expires, sessionStr);
      
      callback();
    } catch (err) {
      callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      const db = getDB();
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback();
    } catch (err) {
      callback(err);
    }
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }

  /**
   * Видалити прострочені сесії (для періодичного очищення)
   */
  static prune() {
    try {
      const db = getDB();
      const result = db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
      return result.changes;
    } catch (err) {
      console.error('Session prune error:', err);
      return 0;
    }
  }
}
