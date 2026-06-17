const jwt = require('jsonwebtoken');
const { User } = require('../models');

const RESTAURANT_ROLES = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'];

// Paths where a valid token is enough — restaurant_id not required
const SKIP_RESTAURANT_PATHS = ['/change-password', '/me'];

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide' });
  }

  req.user = decoded;

  try {
    // Non-super-admin roles MUST have a restaurant_id — but skip for self-service paths
    const skipRestaurantCheck = SKIP_RESTAURANT_PATHS.some((p) => req.path.endsWith(p));
    if (!skipRestaurantCheck && RESTAURANT_ROLES.includes(req.user.role) && !req.user.restaurant_id) {
      // JWT may be stale (issued before restaurant was assigned) — fallback to DB lookup
      const freshUser = await User.findByPk(req.user.id, { attributes: ['restaurant_id'] });
      if (freshUser?.restaurant_id) {
        req.user.restaurant_id = freshUser.restaurant_id;
      } else {
        return res.status(403).json({
          error: 'NO_RESTAURANT',
          message: 'Compte non lié à un restaurant. Contactez votre administrateur.',
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

const checkRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Accès refusé' });
  }
  next();
};

module.exports = { verifyToken, checkRole };
