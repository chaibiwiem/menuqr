const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const minutesLeft = resetTime
      ? Math.ceil((resetTime - Date.now()) / 60000)
      : 15;
    return res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      message: `Trop de tentatives. Réessayez dans ${minutesLeft} minute(s).`,
    });
  },
  skip: (req) => req.method === 'OPTIONS',
});

module.exports = { authLimiter };
