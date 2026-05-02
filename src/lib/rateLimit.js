import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: 'Rate limit exceeded', message },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests');
export const aiLimiter = createRateLimiter(15 * 60 * 1000, 20, 'AI rate limit reached');
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many auth attempts');
