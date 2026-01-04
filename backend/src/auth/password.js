import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Хешувати пароль
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Перевірити пароль
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
