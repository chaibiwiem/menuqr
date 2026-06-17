const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { CallWaiter, Table, Order } = require('../models');

// ─── GET /api/call-waiter ─────────────────────────────────────────────────────

exports.getCallWaiters = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { status, type, table_id, date_from, date_to } = req.query;

    const where = { restaurant_id };
    if (status) where.status = status;
    if (type) where.type = type;
    if (table_id) where.table_id = table_id;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from + 'T00:00:00');
      if (date_to) where.created_at[Op.lte] = new Date(date_to + 'T23:59:59');
    }

    const calls = await CallWaiter.findAll({
      where,
      include: [{ model: Table, as: 'table', attributes: ['id', 'name', 'number'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ data: calls });
  } catch (err) { next(err); }
};

// ─── PUT /api/call-waiter/:id/resolve ────────────────────────────────────────

exports.resolveCallWaiter = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const call = await CallWaiter.findOne({ where: { id, restaurant_id } });
    if (!call) return res.status(404).json({ error: true, message: 'call_not_found' });

    await call.update({ status: 'DONE', resolved_at: new Date(), resolved_by: req.user.id });

    if (call.table_id) {
      const activeOrders = await Order.count({
        where: {
          table_id: call.table_id,
          restaurant_id,
          status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
        },
      });
      const newStatus = activeOrders > 0 ? 'OCCUPEE' : 'LIBRE';
      await Table.update({ status: newStatus }, { where: { id: call.table_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
        tableId: call.table_id, newStatus,
      });
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('call_waiter:resolved', { id });
    res.json({ data: null, message: 'call_resolved' });
  } catch (err) {
    console.error('[resolveCallWaiter]', err.name, err.message, err.parent?.sqlMessage);
    next(err);
  }
};

// ─── GET /api/call-waiter/stats ───────────────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayWhere = {
      restaurant_id,
      created_at: { [Op.between]: [todayStart, todayEnd] },
    };

    const [byType, resolvedToday, pendingCount] = await Promise.all([
      CallWaiter.findAll({
        where: todayWhere,
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['type'],
        raw: true,
      }),
      CallWaiter.findAll({
        where: { ...todayWhere, status: 'DONE', resolved_at: { [Op.not]: null } },
        attributes: ['created_at', 'resolved_at'],
        raw: true,
      }),
      CallWaiter.count({ where: { restaurant_id, status: 'PENDING' } }),
    ]);

    const avgResolutionSeconds = resolvedToday.length > 0
      ? Math.round(
          resolvedToday.reduce((sum, c) => {
            return sum + (new Date(c.resolved_at) - new Date(c.created_at)) / 1000;
          }, 0) / resolvedToday.length
        )
      : null;

    const todayTotal = byType.reduce((s, r) => s + parseInt(r.count, 10), 0);

    res.json({
      data: {
        today_total: todayTotal,
        pending_count: pendingCount,
        avg_resolution_seconds: avgResolutionSeconds,
        by_type: byType.reduce((acc, r) => ({ ...acc, [r.type]: parseInt(r.count, 10) }), {}),
      },
    });
  } catch (err) { next(err); }
};
