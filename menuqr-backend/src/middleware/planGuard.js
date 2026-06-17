const { Subscription } = require('../models');

const PLAN_FEATURES = {
  analytics:      ['PRO', 'PREMIUM'],
  reservations:   ['PRO', 'PREMIUM'],
  pos_caisse:     ['PREMIUM'],
  call_waiter:    ['STARTER', 'PRO', 'PREMIUM'],
  export_csv:     ['PRO', 'PREMIUM'],
  staff_manage:   ['STARTER', 'PRO', 'PREMIUM'],
};

function planGuard(feature) {
  const allowed = PLAN_FEATURES[feature] || [];
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: true, message: 'unauthorized' });
    if (req.user.role === 'SUPER_ADMIN') return next();

    const sub = await Subscription.findOne({
      where: { restaurant_id: req.user.restaurant_id },
    });

    if (!sub || !['ACTIVE', 'TRIAL'].includes(sub.status)) {
      return res.status(402).json({ error: true, message: 'subscription_expired' });
    }

    // STAFF and CASHIER bypass plan-tier check — they work with what the restaurant has paid for.
    // Plan-tier enforcement is an OWNER/MANAGER decision; operational workers must not be blocked.
    if (['STAFF', 'CASHIER'].includes(req.user.role)) {
      req.subscription = sub;
      return next();
    }

    if (!allowed.includes(sub.plan)) {
      return res.status(403).json({
        error: true,
        message: 'plan_upgrade_required',
        required_plans: allowed,
        current_plan: sub.plan,
      });
    }

    req.subscription = sub;
    next();
  };
}

module.exports = { planGuard, PLAN_FEATURES };
