/**
 * Нормалізація timestamp для JavaScript Date
 * ESP32/Arduino часто відправляють Unix timestamp в СЕКУНДАХ,
 * а JavaScript Date очікує МІЛІСЕКУНДИ
 */
const MS_THRESHOLD = 1e12; // ~2001-09-09 в ms

export function toMilliseconds(timestamp) {
  if (timestamp == null) return null;
  const ts = Number(timestamp);
  if (ts < MS_THRESHOLD) {
    return ts * 1000; // секунди -> мілісекунди
  }
  return ts;
}

export function toDate(timestamp) {
  const ms = toMilliseconds(timestamp);
  return ms != null ? new Date(ms) : null;
}
