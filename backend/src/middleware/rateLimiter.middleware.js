const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // generous for normal app usage (dashboard fires several calls)
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // never rate-limit Render health checks
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reports submitted. Please try again in 1 hour.' },
});

module.exports = { globalLimiter, authLimiter, reportLimiter };
