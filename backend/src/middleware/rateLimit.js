import rateLimit from 'express-rate-limit';

/**
 * Rate limiting для API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 300, // максимум 300 запитів (polling ~4 req/30с ≈ 120 за 15 хв на пристрій)
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
