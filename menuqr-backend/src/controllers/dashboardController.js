const { Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Table, Room, QRScan, Reservation, MenuItem } = require('../models');

function todayRange() {
  const todayStr = new Date().toISOString().split('T')[0];
  const today    = new Date(todayStr + 'T00:00:00.000Z');
  const tomorrow = new Date(today.getTime() + 86_400_000);
  return { today, tomorrow, todayStr };
}

function yesterdayRange() {
  const todayStr     = new Date().toISOString().split('T')[0];
  const todayMidnight = new Date(todayStr + 'T00:00:00.000Z');
  const yesterday    = new Date(todayMidnight.getTime() - 86_400_000);
  const endOfYesterday = todayMidnight;
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  return { yesterday, endOfYesterday, yesterdayStr };
}

function calcTrend(current, previous) {
  if (!previous || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const { today, tomorrow, todayStr } = todayRange();
    const { yesterday, endOfYesterday, yesterdayStr } = yesterdayRange();

    const [
      ordersToday, ordersPending, revenueResult, reservationsToday, scansToday,
      tablesOccupied, tablesAvailable, tablesAllCount,
      ordersInProgress,
      ordersYesterday, revenueYesterday, reservationsYesterday, scansYesterday,
    ] = await Promise.all([
      Order.count({ where: { restaurant_id: restaurantId, created_at: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
      Order.count({ where: { restaurant_id: restaurantId, status: 'PENDING' } }),
      Order.sum('total', { where: { restaurant_id: restaurantId, created_at: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
      Reservation.count({ where: { restaurant_id: restaurantId, reservation_date: todayStr } }),
      QRScan.count({ where: { restaurant_id: restaurantId, scanned_at: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
      Table.count({ where: { restaurant_id: restaurantId, is_active: true, status: 'OCCUPEE' } }),
      Table.count({ where: { restaurant_id: restaurantId, is_active: true, status: 'LIBRE' } }),
      Table.count({ where: { restaurant_id: restaurantId, is_active: true } }),
      Order.count({ where: { restaurant_id: restaurantId, status: { [Op.in]: ['CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } } }),
      Order.count({ where: { restaurant_id: restaurantId, created_at: { [Op.gte]: yesterday, [Op.lt]: endOfYesterday } } }),
      Order.sum('total', { where: { restaurant_id: restaurantId, created_at: { [Op.gte]: yesterday, [Op.lt]: endOfYesterday } } }),
      Reservation.count({ where: { restaurant_id: restaurantId, reservation_date: yesterdayStr } }),
      QRScan.count({ where: { restaurant_id: restaurantId, scanned_at: { [Op.gte]: yesterday, [Op.lt]: endOfYesterday } } }),
    ]);

    const revToday = parseFloat(revenueResult) || 0;
    const revYest  = parseFloat(revenueYesterday) || 0;
    const bookedPct = tablesAllCount > 0 ? Math.round((tablesOccupied / tablesAllCount) * 100) : 0;

    return res.json({
      data: {
        ordersToday,
        ordersPending,
        ordersInProgress,
        revenueToday: revToday,
        reservationsToday,
        scansToday,
        tablesOccupied,
        tablesAvailable,
        tablesAllCount,
        bookedPct,
        trends: {
          ordersToday:       calcTrend(ordersToday, ordersYesterday),
          revenueToday:      calcTrend(revToday, revYest),
          reservationsToday: calcTrend(reservationsToday, reservationsYesterday),
          scansToday:        calcTrend(scansToday, scansYesterday),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/orders-live ──────────────────────────────────────────

exports.getOrdersLive = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

    const [byStatus, recent] = await Promise.all([
      Order.findAll({
        where: { restaurant_id: restaurantId, status: { [Op.in]: activeStatuses } },
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Order.findAll({
        where: { restaurant_id: restaurantId, status: { [Op.in]: activeStatuses } },
        include: [{ model: Table, attributes: ['name', 'number'] }],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
    ]);

    const statusMap = {};
    byStatus.forEach((r) => { statusMap[r.status] = parseInt(r.count, 10); });
    const total = activeStatuses.reduce((acc, s) => acc + (statusMap[s] || 0), 0);

    return res.json({ data: { byStatus: statusMap, total, recent } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/tables-status ────────────────────────────────────────

exports.getTablesStatus = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;

    const tables = await Table.findAll({
      where: { restaurant_id: restaurantId, is_active: true },
      attributes: ['id', 'number', 'name', 'capacity', 'status'],
      include: [{ model: Room, attributes: ['name', 'zone'] }],
      order: [['number', 'ASC']],
    });

    const byStatus = tables.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({ data: { tables, byStatus, total: tables.length } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/top-dishes ───────────────────────────────────────────

exports.getTopDishes = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const period = req.query.period === 'week' ? 'week' : 'day';

    let start, end;
    if (period === 'week') {
      const nowStr = new Date().toISOString().split('T')[0];
      const now    = new Date(nowStr + 'T00:00:00.000Z');
      const diff   = now.getUTCDay() === 0 ? -6 : 1 - now.getUTCDay();
      start = new Date(now.getTime() + diff * 86_400_000);
      end   = new Date(start.getTime() + 7 * 86_400_000);
    } else {
      const { today, tomorrow } = todayRange();
      start = today;
      end = tomorrow;
    }

    const rows = await OrderItem.findAll({
      attributes: [
        'menu_item_id',
        'name_snapshot',
        [fn('MIN', col('OrderItem.unit_price')), 'unitPrice'],
        [fn('SUM', col('OrderItem.quantity')), 'totalQty'],
        [fn('SUM', literal('`OrderItem`.`quantity` * `OrderItem`.`unit_price`')), 'totalRevenue'],
      ],
      include: [{
        model: Order,
        attributes: [],
        where: { restaurant_id: restaurantId, created_at: { [Op.gte]: start, [Op.lt]: end } },
        required: true,
      }],
      group: ['OrderItem.menu_item_id', 'OrderItem.name_snapshot'],
      order: [[fn('SUM', col('OrderItem.quantity')), 'DESC']],
      limit: 5,
      raw: true,
    });

    // Fetch images separately to avoid GROUP BY issues
    const itemIds = rows.map((r) => r.menu_item_id).filter(Boolean);
    const menuItems = itemIds.length
      ? await MenuItem.findAll({ where: { id: itemIds }, attributes: ['id', 'image_url'], raw: true })
      : [];
    const imageMap = {};
    menuItems.forEach((m) => { imageMap[m.id] = m.image_url; });

    return res.json({
      data: rows.map((d) => ({
        name:      d.name_snapshot,
        qty:       parseInt(d.totalQty, 10) || 0,
        revenue:   parseFloat(d.totalRevenue) || 0,
        unitPrice: parseFloat(d.unitPrice) || 0,
        imageUrl:  imageMap[d.menu_item_id] || null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/qr-scans ─────────────────────────────────────────────

exports.getQRScans = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const period = req.query.period || 'day';

    // Compute date range (UTC-safe)
    let start, groupBy, labelFn;
    const nowStr  = new Date().toISOString().split('T')[0];
    const nowDate = new Date(nowStr + 'T00:00:00.000Z');

    if (period === 'week') {
      const diff = nowDate.getUTCDay() === 0 ? -6 : 1 - nowDate.getUTCDay();
      start  = new Date(nowDate.getTime() + diff * 86_400_000);
      groupBy = fn('DAYOFWEEK', col('scanned_at'));
    } else if (period === 'month') {
      const [y, m] = nowStr.split('-').map(Number);
      start  = new Date(Date.UTC(y, m - 1, 1));
      groupBy = fn('DAY', col('scanned_at'));
    } else {
      const { today } = todayRange();
      start = today;
      groupBy = fn('HOUR', col('scanned_at'));
    }

    const whereScans = { restaurant_id: restaurantId, scanned_at: { [Op.gte]: start } };

    // True total + by-table top 5 + chart — all in parallel
    const [totalCount, byTableRows, chartRows] = await Promise.all([
      QRScan.count({ where: whereScans }),

      QRScan.findAll({
        attributes: ['table_id', [fn('COUNT', col('QRScan.id')), 'scans']],
        include: [{
          model: Table,
          attributes: ['name', 'number'],
          where: { restaurant_id: restaurantId },
          required: true,
        }],
        where: whereScans,
        group: ['table_id', 'Table.id', 'Table.name', 'Table.number'],
        order: [[fn('COUNT', col('QRScan.id')), 'DESC']],
        limit: 5,
        raw: true,
        nest: true,
      }),

      QRScan.findAll({
        attributes: [
          [groupBy, 'unit'],
          [fn('COUNT', col('QRScan.id')), 'scans'],
        ],
        where: whereScans,
        group: [groupBy],
        order: [[groupBy, 'ASC']],
        raw: true,
      }),
    ]);

    const total = totalCount;

    // Build chart data
    let chart = [];
    if (period === 'week') {
      const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const DOW_ORDER = [2, 3, 4, 5, 6, 7, 1];
      const map = {};
      chartRows.forEach((r) => { map[r.unit] = parseInt(r.scans, 10) || 0; });
      chart = DOW_ORDER.map((dow, i) => ({ label: DAY_NAMES[i], scans: map[dow] || 0 }));
    } else if (period === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const map = {};
      chartRows.forEach((r) => { map[r.unit] = parseInt(r.scans, 10) || 0; });
      chart = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), scans: map[i + 1] || 0 }));
    } else {
      const map = {};
      chartRows.forEach((r) => { map[r.unit] = parseInt(r.scans, 10) || 0; });
      chart = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}h`, scans: map[h] || 0 }));
    }

    return res.json({
      data: {
        total,
        chart,
        byTable: byTableRows.map((r) => ({
          tableId:   r.table_id,
          tableName: r.Table?.name || `T${r.Table?.number}`,
          scans:     parseInt(r.scans, 10),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/revenue-chart ────────────────────────────────────────

exports.getRevenueChart = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant_id;
    const period = req.query.period === 'month' ? 'month' : 'week';

    // Week boundaries (Mon → Sun) — UTC-safe
    const nowStr     = new Date().toISOString().split('T')[0];
    const nowMidnight = new Date(nowStr + 'T00:00:00.000Z');
    const diffToMon  = nowMidnight.getUTCDay() === 0 ? -6 : 1 - nowMidnight.getUTCDay();

    const thisMonday = new Date(nowMidnight.getTime() + diffToMon * 86_400_000);
    const nextMonday = new Date(thisMonday.getTime() + 7 * 86_400_000);
    const lastMonday = new Date(thisMonday.getTime() - 7 * 86_400_000);

    if (period === 'week') {
      const [thisRows, lastRows] = await Promise.all([
        Order.findAll({
          where: { restaurant_id: restaurantId, created_at: { [Op.gte]: thisMonday, [Op.lt]: nextMonday } },
          attributes: [
            [fn('DAYOFWEEK', col('created_at')), 'dow'],
            [fn('SUM', col('total')), 'revenue'],
            [fn('COUNT', col('id')), 'orders'],
          ],
          group: [fn('DAYOFWEEK', col('created_at'))],
          raw: true,
        }),
        Order.findAll({
          where: { restaurant_id: restaurantId, created_at: { [Op.gte]: lastMonday, [Op.lt]: thisMonday } },
          attributes: [
            [fn('DAYOFWEEK', col('created_at')), 'dow'],
            [fn('SUM', col('total')), 'revenue'],
            [fn('COUNT', col('id')), 'orders'],
          ],
          group: [fn('DAYOFWEEK', col('created_at'))],
          raw: true,
        }),
      ]);

      // DAYOFWEEK: 1=Sun 2=Mon … 7=Sat → display Mon–Sun
      const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const DOW_ORDER = [2, 3, 4, 5, 6, 7, 1];

      const mapThis = {}, mapLast = {};
      thisRows.forEach((r) => { mapThis[r.dow] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) || 0 }; });
      lastRows.forEach((r) => { mapLast[r.dow] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) || 0 }; });

      return res.json({
        data: DOW_ORDER.map((dow, i) => ({
          day:             DAY_NAMES[i],
          thisWeek:        mapThis[dow]?.revenue || 0,
          lastWeek:        mapLast[dow]?.revenue || 0,
          ordersThisWeek:  mapThis[dow]?.orders  || 0,
          ordersLastWeek:  mapLast[dow]?.orders  || 0,
        })),
      });
    }

    // Month: daily totals for current month vs same days last month (UTC-safe)
    const [y, m] = nowStr.split('-').map(Number);
    const monthStart     = new Date(Date.UTC(y, m - 1, 1));
    const nextMonthStart = new Date(Date.UTC(y, m, 1));
    const lastMonthStart = new Date(Date.UTC(y, m - 2, 1));

    const [thisMonthRows, lastMonthRows] = await Promise.all([
      Order.findAll({
        where: { restaurant_id: restaurantId, created_at: { [Op.gte]: monthStart, [Op.lt]: nextMonthStart } },
        attributes: [
          [fn('DAY', col('created_at')), 'day'],
          [fn('SUM', col('total')), 'revenue'],
          [fn('COUNT', col('id')), 'orders'],
        ],
        group: [fn('DAY', col('created_at'))],
        raw: true,
      }),
      Order.findAll({
        where: { restaurant_id: restaurantId, created_at: { [Op.gte]: lastMonthStart, [Op.lt]: monthStart } },
        attributes: [
          [fn('DAY', col('created_at')), 'day'],
          [fn('SUM', col('total')), 'revenue'],
          [fn('COUNT', col('id')), 'orders'],
        ],
        group: [fn('DAY', col('created_at'))],
        raw: true,
      }),
    ]);

    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const mapThisM = {}, mapLastM = {};
    thisMonthRows.forEach((r) => { mapThisM[r.day] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) || 0 }; });
    lastMonthRows.forEach((r) => { mapLastM[r.day] = { revenue: parseFloat(r.revenue) || 0, orders: parseInt(r.orders, 10) || 0 }; });

    return res.json({
      data: Array.from({ length: daysInMonth }, (_, i) => ({
        day:            String(i + 1),
        thisWeek:       mapThisM[i + 1]?.revenue || 0,
        lastWeek:       mapLastM[i + 1]?.revenue || 0,
        ordersThisWeek: mapThisM[i + 1]?.orders  || 0,
        ordersLastWeek: mapLastM[i + 1]?.orders  || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};
