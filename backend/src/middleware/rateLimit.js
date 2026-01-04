import rateLimit from 'express-rate-limit';

/**
 * Rate limiting для API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100, // максимум 100 запитів
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Rate limiting для логіну (захист від brute-force)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 5, // максимум 5 спроб
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});
