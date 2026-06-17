const { Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Table, Reservation, QRScan } = require('../models');

function getRange(from, to) {
  const end   = to   ? new Date(to   + 'T23:59:59') : new Date();
  const start = from ? new Date(from + 'T00:00:00') : new Date(Date.now() - 29 * 86400000);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function prevRange(start, end) {
  const dur = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - dur - 1), end: new Date(start.getTime() - 1) };
}

function delta(curr, prev) {
  if (!prev || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ─── GET /api/analytics/kpis ─────────────────────────────────────────────────

exports.getKPIs = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);
    const { start: ps, end: pe } = prevRange(start, end);

    const query = (s, e) => Order.findOne({
      where: { restaurant_id, status: 'CLOSED', created_at: { [Op.between]: [s, e] } },
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'revenue'],
      ],
      raw: true,
    });

    const [curr, prev, resvCount] = await Promise.all([
      query(start, end),
      query(ps, pe),
      Reservation.count({ where: { restaurant_id, created_at: { [Op.between]: [start, end] } } }),
    ]);

    const revenue = Number(curr?.revenue) || 0;
    const count   = parseInt(curr?.count)  || 0;
    const prevRev = Number(prev?.revenue) || 0;
    const prevCnt = parseInt(prev?.count)  || 0;

    res.json({
      data: {
        revenue,
        orders_count:  count,
        avg_order:     count > 0 ? Math.round((revenue / count) * 1000) / 1000 : 0,
        delta_revenue: delta(revenue, prevRev),
        delta_orders:  delta(count, prevCnt),
        resv_count:    parseInt(resvCount) || 0,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/revenue-chart ────────────────────────────────────────

exports.getRevenueChart = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const rows = await Order.findAll({
      where: { restaurant_id, status: 'CLOSED', created_at: { [Op.between]: [start, end] } },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'revenue'],
        [fn('COUNT', col('id')), 'orders'],
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    res.json({
      data: rows.map((r) => ({
        date:    r.date,
        revenue: Number(r.revenue) || 0,
        orders:  parseInt(r.orders) || 0,
      })),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/top-dishes ───────────────────────────────────────────

exports.getTopDishes = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);
    const limit = Math.min(parseInt(req.query.limit || '10'), 20);

    const orderIds = await Order.findAll({
      where: { restaurant_id, status: 'CLOSED', created_at: { [Op.between]: [start, end] } },
      attributes: ['id'],
      raw: true,
    });

    if (orderIds.length === 0) return res.json({ data: [] });

    const ids = orderIds.map((o) => o.id);

    const rows = await OrderItem.findAll({
      where: { order_id: { [Op.in]: ids } },
      attributes: [
        'name_snapshot',
        [fn('SUM', col('quantity')), 'qty'],
        [fn('SUM', literal('quantity * unit_price')), 'revenue'],
        [fn('AVG', col('unit_price')), 'avg_price'],
      ],
      group: ['name_snapshot'],
      order: [[fn('SUM', col('quantity')), 'DESC']],
      limit,
      raw: true,
    });

    const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);

    res.json({
      data: rows.map((r, i) => ({
        rank:    i + 1,
        name:    r.name_snapshot,
        qty:     parseInt(r.qty) || 0,
        revenue: Number(r.revenue) || 0,
        price:   Number(r.avg_price) || 0,
        share:   totalRevenue > 0 ? Math.round((Number(r.revenue) / totalRevenue) * 100) : 0,
      })),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/orders-by-hour ───────────────────────────────────────

exports.getOrdersByHour = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const rows = await Order.findAll({
      where: { restaurant_id, status: { [Op.ne]: 'CANCELLED' }, created_at: { [Op.between]: [start, end] } },
      attributes: [
        [fn('HOUR', col('created_at')), 'hour'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('HOUR', col('created_at'))],
      order: [[fn('HOUR', col('created_at')), 'ASC']],
      raw: true,
    });

    // Fill all 24h
    const map = {};
    rows.forEach((r) => { map[parseInt(r.hour)] = parseInt(r.count); });
    const data = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: map[h] || 0 }));

    res.json({ data });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/reservations ─────────────────────────────────────────

exports.getReservationStats = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const where = {
      restaurant_id,
      date: {
        [Op.between]: [
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
        ],
      },
    };

    const [byZone, noShow, total] = await Promise.all([
      Reservation.findAll({
        where,
        attributes: ['zone', [fn('COUNT', col('id')), 'count']],
        group: ['zone'],
        raw: true,
      }),
      Reservation.count({ where: { ...where, status: 'NO_SHOW' } }),
      Reservation.count({ where }),
    ]);

    const zoneMap = {};
    byZone.forEach((r) => { zoneMap[r.zone] = parseInt(r.count); });

    res.json({
      data: {
        total,
        no_show:      noShow,
        no_show_rate: total > 0 ? Math.round((noShow / total) * 100) : 0,
        by_zone: {
          SALLE:    zoneMap['SALLE']    || 0,
          TERRASSE: zoneMap['TERRASSE'] || 0,
          ETAGE:    zoneMap['ETAGE']    || 0,
        },
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/reservations-list ────────────────────────────────────

exports.getReservationsList = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);
    const limit = Math.min(parseInt(req.query.limit || '20'), 50);

    const rows = await Reservation.findAll({
      where: {
        restaurant_id,
        reservation_date: {
          [Op.between]: [
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0],
          ],
        },
      },
      attributes: ['id', 'first_name', 'last_name', 'reservation_date',
                   'reservation_time', 'covers', 'zone', 'status', 'table_id'],
      order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']],
      limit,
      raw: true,
    });

    res.json({
      data: rows.map((r) => ({
        id:    r.id,
        name:  `${r.first_name} ${r.last_name}`,
        date:  r.reservation_date,
        time:  r.reservation_time ? r.reservation_time.slice(0, 5) : '',
        covers: r.covers,
        zone:  r.zone,
        status: r.status,
      })),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/by-category ──────────────────────────────────────────

exports.getByCategory = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const orderIds = await Order.findAll({
      where: { restaurant_id, status: 'CLOSED', created_at: { [Op.between]: [start, end] } },
      attributes: ['id'],
      raw: true,
    });

    if (!orderIds.length) return res.json({ data: [] });

    const ids = orderIds.map((o) => o.id);

    const [rows] = await Order.sequelize.query(
      `SELECT c.id AS category_id, c.name_fr AS name,
              SUM(oi.quantity * oi.unit_price) AS revenue,
              SUM(oi.quantity) AS qty
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       JOIN categories c  ON c.id  = mi.category_id
       WHERE oi.order_id IN (:ids)
       GROUP BY c.id, c.name_fr
       ORDER BY revenue DESC`,
      { replacements: { ids }, type: Order.sequelize.QueryTypes.SELECT }
    );

    const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);

    res.json({
      data: rows.map((r) => ({
        name:    r.name || 'Autre',
        revenue: Number(r.revenue) || 0,
        qty:     parseInt(r.qty)   || 0,
        share:   totalRevenue > 0 ? Math.round((Number(r.revenue) / totalRevenue) * 100) : 0,
      })),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/staff ─────────────────────────────────────────────────

exports.getStaffPerformance = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const [rows] = await Order.sequelize.query(
      `SELECT o.staff_id,
              u.name  AS staff_name,
              u.role  AS staff_role,
              COUNT(o.id)               AS orders_count,
              COALESCE(SUM(o.total), 0) AS revenue
       FROM orders o
       LEFT JOIN users u ON u.id = o.staff_id
       WHERE o.restaurant_id = :restaurant_id
         AND o.status = 'CLOSED'
         AND o.created_at BETWEEN :start AND :end
       GROUP BY o.staff_id, u.name, u.role
       ORDER BY revenue DESC`,
      {
        replacements: { restaurant_id, start, end },
        type: Order.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      data: rows.map((r) => ({
        staff_id:     r.staff_id || null,
        name:         r.staff_name || 'En ligne (QR)',
        role:         r.staff_role || '—',
        orders_count: parseInt(r.orders_count) || 0,
        revenue:      Number(r.revenue) || 0,
      })),
    });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/payments ─────────────────────────────────────────────

exports.getPaymentStats = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const rows = await Order.findAll({
      where: {
        restaurant_id,
        status: 'CLOSED',
        created_at: { [Op.between]: [start, end] },
      },
      attributes: [
        'payment_method',
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'total'],
      ],
      group: ['payment_method'],
      raw: true,
    });

    const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);

    const METHOD_LABEL = { CASH: 'Espèces', CARD: 'Carte bancaire', OTHER: 'Autre', PENDING: 'En attente' };
    const METHOD_COLOR = { CASH: '#F97316', CARD: '#22d3ee', OTHER: '#d1d5db', PENDING: '#fbbf24' };
    const KNOWN = ['CASH', 'CARD', 'OTHER', 'PENDING'];

    const data = rows.map((r) => {
      const method = KNOWN.includes(r.payment_method) ? r.payment_method : 'OTHER';
      const total  = Number(r.total) || 0;
      return {
        method,
        label:   METHOD_LABEL[method] ?? method,
        color:   METHOD_COLOR[method] ?? '#d1d5db',
        count:   parseInt(r.count) || 0,
        total,
        pct: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    res.json({ data, grandTotal });
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/export/csv ───────────────────────────────────────────

exports.exportCSV = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { start, end } = getRange(req.query.from, req.query.to);

    const orders = await Order.findAll({
      where: { restaurant_id, status: 'CLOSED', created_at: { [Op.between]: [start, end] } },
      include: [
        { model: Table,     as: 'table', attributes: ['name', 'number'], required: false },
        { model: OrderItem, as: 'items', attributes: ['name_snapshot', 'quantity', 'unit_price'], required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    const BOM    = '﻿';
    const header = 'Date,Heure,Table,Articles,Total DT\n';
    const rows   = orders.map((o) => {
      const d = new Date(o.created_at);
      const date  = d.toLocaleDateString('fr-FR');
      const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const table = o.table?.name || o.table?.number || '';
      const items = (o.items || []).map((i) => `${i.quantity}x${i.name_snapshot}`).join(' | ');
      return [date, heure, table, `"${items}"`, Number(o.total).toFixed(3)].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(BOM + header + rows);
  } catch (err) { next(err); }
};
