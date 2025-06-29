import rateLimit from '@/lib/rate-limit';

// Create a rate limiter that allows 5 requests per minute per IP
export const loginLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max number of unique tokens
});

export const LOGIN_RATE_LIMIT = 5; // 5 login attempts per minute