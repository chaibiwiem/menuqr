const { randomUUID } = require('crypto');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Room, Table, Order, OrderItem, CallWaiter, Restaurant } = require('../models');
const archiver = require('archiver');
const { generateQRCode, exportQRBatch } = require('../services/qrcodeService');

const TABLE_STATUSES = ['LIBRE', 'OCCUPEE', 'RESERVEE', 'EN_ATTENTE', 'DESACTIVEE'];

// ─── Rooms ────────────────────────────────────────────────────────────────────

exports.getRooms = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const rooms = await Room.findAll({
      where: { restaurant_id },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
      include: [{ model: Table, as: 'tables', order: [['number', 'ASC']] }],
    });
    res.json({ data: rooms });
  } catch (err) { next(err); }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { name, zone, capacity } = req.body;
    if (!name?.trim()) return res.status(422).json({ error: true, message: 'name_required' });

    const room = await Room.create({
      restaurant_id,
      name: name.trim(),
      zone: zone || 'SALLE',
      capacity: parseInt(capacity, 10) || 0,
    });
    res.status(201).json({ data: room });
  } catch (err) { next(err); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { name, zone, capacity } = req.body;

    const room = await Room.findOne({ where: { id, restaurant_id } });
    if (!room) return res.status(404).json({ error: true, message: 'room_not_found' });

    await room.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(zone !== undefined && { zone }),
      ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
    });
    res.json({ data: room });
  } catch (err) { next(err); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const room = await Room.findOne({ where: { id, restaurant_id } });
    if (!room) return res.status(404).json({ error: true, message: 'room_not_found' });

    const tableCount = await Table.count({ where: { room_id: id } });
    if (tableCount > 0) {
      return res.status(409).json({ error: true, message: 'room_has_tables' });
    }

    await room.destroy();
    res.json({ data: null, message: 'room_deleted' });
  } catch (err) { next(err); }
};

// ─── Tables ───────────────────────────────────────────────────────────────────

exports.getTables = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const tables = await Table.findAll({
      where: { restaurant_id },
      include: [{ model: Room, as: 'room', attributes: ['id', 'name', 'zone'] }],
      order: [['number', 'ASC'], ['name', 'ASC']],
    });
    res.json({ data: tables });
  } catch (err) { next(err); }
};

exports.createTable = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { name, number, capacity, room_id } = req.body;

    if (!name?.trim()) {
      return res.status(422).json({ error: true, message: 'name_required' });
    }

    if (number) {
      const existing = await Table.findOne({ where: { restaurant_id, number: parseInt(number, 10) } });
      if (existing) {
        return res.status(409).json({ error: true, message: 'number_already_used' });
      }
    }

    if (room_id) {
      const room = await Room.findOne({ where: { id: room_id, restaurant_id } });
      if (!room) return res.status(404).json({ error: true, message: 'room_not_found' });
    }

    const table = await Table.create({
      restaurant_id,
      room_id: room_id || null,
      name: name.trim(),
      number: number ? parseInt(number, 10) : null,
      capacity: parseInt(capacity, 10) || 2,
      status: 'LIBRE',
      is_active: true,
    });

    // Generate QR code async — don't block the response
    const restaurant = await Restaurant.findByPk(restaurant_id, { attributes: ['id', 'slug', 'logo_url'] });
    if (restaurant) {
      generateQRCode(table, restaurant).catch((err) =>
        console.error('[QR] Generation failed for table', table.id, err.message)
      );
    }

    res.status(201).json({ data: table });
  } catch (err) { next(err); }
};

exports.updateTable = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { name, number, capacity, room_id, is_active } = req.body;

    const table = await Table.findOne({ where: { id, restaurant_id } });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    if (number !== undefined && parseInt(number, 10) !== table.number) {
      const dup = await Table.findOne({
        where: { restaurant_id, number: parseInt(number, 10), id: { [Op.ne]: id } },
      });
      if (dup) return res.status(409).json({ error: true, message: 'number_already_used' });
    }

    if (room_id !== undefined && room_id !== null) {
      const room = await Room.findOne({ where: { id: room_id, restaurant_id } });
      if (!room) return res.status(404).json({ error: true, message: 'room_not_found' });
    }

    await table.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(number !== undefined && { number: number ? parseInt(number, 10) : null }),
      ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
      ...(room_id !== undefined && { room_id: room_id || null }),
      ...(is_active !== undefined && { is_active }),
    });

    res.json({ data: table });
  } catch (err) { next(err); }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const table = await Table.findOne({ where: { id, restaurant_id } });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    const activeOrders = await Order.count({
      where: {
        table_id: id,
        restaurant_id,
        status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
      },
    });
    if (activeOrders > 0) {
      return res.status(409).json({ error: true, message: 'table_has_active_orders' });
    }

    await table.destroy();
    res.json({ data: null, message: 'table_deleted' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/tables/:id/position ──────────────────────────────────────────

exports.updatePosition = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { position_x, position_y } = req.body;

    const table = await Table.findOne({ where: { id, restaurant_id } });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    await table.update({
      position_x: parseInt(position_x, 10) || 0,
      position_y: parseInt(position_y, 10) || 0,
    });

    res.json({ data: { id, position_x: table.position_x, position_y: table.position_y } });
  } catch (err) { next(err); }
};

// ─── PUT /api/tables/:id/status ───────────────────────────────────────────────

exports.updateStatus = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!TABLE_STATUSES.includes(status)) {
      return res.status(422).json({ error: true, message: 'invalid_status' });
    }

    const table = await Table.findOne({ where: { id, restaurant_id } });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    await table.update({ status });
    req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', { tableId: id, newStatus: status });

    res.json({ data: { id, status } });
  } catch (err) { next(err); }
};

// ─── POST /api/tables/:id/regenerate-qr ──────────────────────────────────────

exports.regenerateQR = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const table = await Table.findOne({ where: { id, restaurant_id } });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    const qr_token = randomUUID();
    await table.update({ qr_token, qr_url: null });

    const restaurant = await Restaurant.findByPk(restaurant_id, { attributes: ['id', 'slug', 'logo_url'] });
    let qr_url = null;
    if (restaurant) {
      qr_url = await generateQRCode(table, restaurant).catch(() => null);
    }

    res.json({ data: { id, qr_token, qr_url } });
  } catch (err) { next(err); }
};

// ─── POST /api/tables/merge ───────────────────────────────────────────────────

exports.mergeTables = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurant_id } = req.user;
    const { source_table_id, target_table_id } = req.body;

    if (source_table_id === target_table_id) {
      await t.rollback();
      return res.status(422).json({ error: true, message: 'same_table' });
    }

    const [source, target] = await Promise.all([
      Table.findOne({ where: { id: source_table_id, restaurant_id }, transaction: t }),
      Table.findOne({ where: { id: target_table_id, restaurant_id }, transaction: t }),
    ]);

    if (!source || !target) {
      await t.rollback();
      return res.status(404).json({ error: true, message: 'table_not_found' });
    }

    // Move active orders from source to target
    await Order.update(
      { table_id: target_table_id },
      {
        where: {
          table_id: source_table_id,
          restaurant_id,
          status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
        },
        transaction: t,
      }
    );

    // Free source table
    await source.update({ status: 'LIBRE' }, { transaction: t });

    await t.commit();

    req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
      tableId: source_table_id,
      newStatus: 'LIBRE',
    });

    res.json({ data: { merged: true }, message: 'tables_merged' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── POST /api/tables/:id/transfer ───────────────────────────────────────────

exports.transferOrder = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id: source_table_id } = req.params;
    const { order_id, target_table_id } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, table_id: source_table_id, restaurant_id },
    });
    if (!order) return res.status(404).json({ error: true, message: 'order_not_found' });

    const target = await Table.findOne({ where: { id: target_table_id, restaurant_id } });
    if (!target) return res.status(404).json({ error: true, message: 'table_not_found' });

    await order.update({ table_id: target_table_id });
    await target.update({ status: 'OCCUPEE' });

    // Check if source still has active orders
    const remaining = await Order.count({
      where: {
        table_id: source_table_id,
        restaurant_id,
        status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
      },
    });
    if (remaining === 0) {
      const sourceTable = await Table.findByPk(source_table_id);
      if (sourceTable) await sourceTable.update({ status: 'LIBRE' });
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
      tableId: target_table_id,
      newStatus: 'OCCUPEE',
    });

    res.json({ data: { transferred: true }, message: 'order_transferred' });
  } catch (err) { next(err); }
};

// ─── GET /api/tables/calls ────────────────────────────────────────────────────

exports.getTableCalls = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const calls = await CallWaiter.findAll({
      where: { restaurant_id, status: 'PENDING' },
      include: [{ model: Table, as: 'table', attributes: ['id', 'name', 'number'] }],
      order: [['created_at', 'ASC']],
    });
    res.json({ data: calls });
  } catch (err) { next(err); }
};

// ─── PUT /api/tables/calls/:callId/resolve ────────────────────────────────────

exports.resolveCall = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { callId } = req.params;

    const call = await CallWaiter.findOne({ where: { id: callId, restaurant_id } });
    if (!call) return res.status(404).json({ error: true, message: 'call_not_found' });

    await call.update({ status: 'DONE', resolved_at: new Date(), resolved_by: req.user.id });

    // Reset table to OCCUPEE if it has active orders, else LIBRE
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
        tableId: call.table_id,
        newStatus,
      });
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('call_waiter:resolved', { id: callId });

    res.json({ data: null, message: 'call_resolved' });
  } catch (err) { next(err); }
};

// ─── GET /api/tables/:id ──────────────────────────────────────────────────────

exports.getTableById = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const table = await Table.findOne({
      where: { id, restaurant_id },
      include: [
        { model: Room, as: 'room', attributes: ['id', 'name', 'zone'] },
        {
          model: Order,
          as: 'orders',
          where: { status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } },
          required: false,
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{ model: OrderItem, as: 'items', attributes: ['id', 'name_snapshot', 'quantity', 'unit_price'] }],
        },
      ],
    });

    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    res.json({ data: table });
  } catch (err) { next(err); }
};

// ─── GET /api/tables/export-qr ───────────────────────────────────────────────

exports.exportQRCodes = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { room_id } = req.query;

    const where = { restaurant_id, is_active: true };
    if (room_id) where.room_id = room_id;

    const [tables, restaurant] = await Promise.all([
      Table.findAll({
        where,
        include: [{ model: Room, as: 'room', attributes: ['name'] }],
        order: [['name', 'ASC']],
      }),
      Restaurant.findByPk(restaurant_id, { attributes: ['id', 'slug', 'name'] }),
    ]);

    if (!tables.length) {
      return res.status(404).json({ error: true, message: 'no_tables' });
    }

    const files = await exportQRBatch(tables, restaurant);

    const zipName = room_id
      ? `qr-${restaurant.slug}-salle.zip`
      : `qr-${restaurant.slug}-toutes.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => next(err));
    archive.pipe(res);

    for (const { buffer, name } of files) {
      archive.append(buffer, { name });
    }

    await archive.finalize();
  } catch (err) { next(err); }
};
