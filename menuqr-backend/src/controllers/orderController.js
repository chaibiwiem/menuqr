const { Op } = require('sequelize');
const {
  Order, OrderItem, OrderItemSupplement, OrderStatusLog,
  Table, Room, MenuItem, User, Payment,
} = require('../models');
const printerService = require('../services/printerService');

// ─── Valid status transitions ──────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PREPARING', 'CANCELLED'],
  PREPARING:  ['READY', 'CANCELLED'],
  READY:      ['SERVED'],
  SERVED:     [], // closure happens exclusively via /pos/payments (creates Payment + sets CLOSED)
  CLOSED:     [],
  CANCELLED:  [],
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { restaurant_id } = req.user;
    const {
      status, table_id, room_id, staff_id, payment_method,
      from, to, page = 1, limit = 200,
    } = req.query;

    const where = { restaurant_id };
    if (status)         where.status    = { [Op.in]: status.split(',').map((s) => s.trim()) };
    if (table_id)       where.table_id  = table_id;
    if (staff_id)       where.staff_id  = staff_id;
    if (payment_method) {
      const methods = payment_method.split(',').map((m) => m.trim());
      if (methods.includes('PENDING')) {
        // "Non payé" = payment_method IS NULL or PENDING
        where[Op.or] = [
          { payment_method: null },
          { payment_method: { [Op.in]: methods } },
        ];
      } else {
        where.payment_method = { [Op.in]: methods };
      }
    }
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to)   where.created_at[Op.lte] = new Date(to + 'T23:59:59');
    }

    const tableInclude = {
      model: Table,
      as: 'table',
      attributes: ['id', 'name', 'number', 'room_id'],
      required: !!room_id,
      include: [{ model: Room, as: 'room', attributes: ['id', 'name', 'zone'] }],
    };
    if (room_id) tableInclude.where = { room_id };

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        tableInclude,
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: OrderItemSupplement, as: 'supplements', attributes: ['id', 'option_name_snapshot', 'extra_price'] }],
        },
        { model: User, as: 'staff', attributes: ['id', 'name', 'role'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    res.json({ data: rows, total: count });
  } catch (error) {
    console.error('[getOrders]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, restaurant_id },
      include: [
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: OrderItemSupplement, as: 'supplements' },
          ],
        },
        {
          model: OrderStatusLog,
          as: 'statusLogs',
          include: [{ model: User, as: 'changedBy', attributes: ['id', 'name'] }],
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });
    }

    res.json({ data: order, message: 'OK' });
  } catch (error) {
    console.error('[getOrderById]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─── POST /api/orders (création manuelle dashboard) ───────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { restaurant_id, id: staff_id } = req.user;
    const { table_id, items = [], notes } = req.body;

    if (!items.length) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'La commande doit contenir au moins un article' });
    }

    let total = 0;
    const itemsData = items.map((item) => {
      const itemTotal = (Number(item.unit_price) + (item.supplements || []).reduce((s, sup) => s + Number(sup.extra_price || 0), 0)) * item.quantity;
      total += itemTotal;
      return item;
    });

    const order = await Order.create({
      restaurant_id,
      table_id: table_id || null,
      staff_id,
      total: parseFloat(total.toFixed(3)),
      notes,
    });

    for (const item of itemsData) {
      const orderItem = await OrderItem.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        name_snapshot: item.name_snapshot,
        notes: item.notes || null,
      });

      if (item.supplements && item.supplements.length > 0) {
        await OrderItemSupplement.bulkCreate(
          item.supplements.map((s) => ({
            order_item_id: orderItem.id,
            supplement_option_id: s.supplement_option_id || null,
            option_name_snapshot: s.option_name_snapshot,
            extra_price: s.extra_price || 0,
          }))
        );
      }
    }

    // Update table status
    if (table_id) {
      await Table.update({ status: 'OCCUPEE' }, { where: { id: table_id, restaurant_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', { tableId: table_id, newStatus: 'OCCUPEE' });
    }

    // Log initial status
    await OrderStatusLog.create({
      order_id: order.id,
      old_status: null,
      new_status: 'PENDING',
      changed_by: staff_id,
    });

    const fullOrder = await Order.findOne({
      where: { id: order.id },
      include: [
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
        { model: OrderItem, as: 'items', include: [{ model: OrderItemSupplement, as: 'supplements' }] },
      ],
    });

    req.io.to(`restaurant:${restaurant_id}`).emit('order:new', {
      order_id:    order.id,
      table_name:  fullOrder.table?.name   || null,
      table_number: fullOrder.table?.number || null,
      total:       order.total,
      items_count: itemsData.length,
      created_at:  order.created_at,
    });

    res.status(201).json({ data: fullOrder, message: 'Commande créée' });
  } catch (error) {
    console.error('[createOrder]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─── PUT /api/orders/:id/status ───────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { restaurant_id, id: user_id } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Statut requis' });
    }

    const order = await Order.findOne({ where: { id, restaurant_id } });
    if (!order) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });
    }

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(422).json({
        error: 'INVALID_TRANSITION',
        message: `Transition ${order.status} → ${status} non autorisée`,
      });
    }

    const oldStatus = order.status;
    await order.update({ status });

    await OrderStatusLog.create({
      order_id: order.id,
      old_status: oldStatus,
      new_status: status,
      changed_by: user_id,
    });

    // If served → prompt cashier
    if (status === 'SERVED' && order.table_id) {
      await Table.update({ status: 'EN_ATTENTE' }, { where: { id: order.table_id, restaurant_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', { tableId: order.table_id, newStatus: 'EN_ATTENTE' });
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('order:status_changed', {
      orderId: id,
      newStatus: status,
      updatedAt: new Date().toISOString(),
    });

    res.json({ data: { id, status }, message: 'Statut mis à jour' });
  } catch (error) {
    console.error('[updateOrderStatus]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─── PUT /api/orders/:id/cancel ───────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const { restaurant_id, id: user_id } = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ where: { id, restaurant_id } });
    if (!order) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });
    }

    if (['CLOSED', 'CANCELLED'].includes(order.status)) {
      return res.status(422).json({ error: 'INVALID_STATE', message: 'Cette commande ne peut pas être annulée' });
    }

    const oldStatus = order.status;
    await order.update({ status: 'CANCELLED', notes: reason ? `${order.notes || ''} [Annulée: ${reason}]`.trim() : order.notes });

    await OrderStatusLog.create({
      order_id: order.id,
      old_status: oldStatus,
      new_status: 'CANCELLED',
      changed_by: user_id,
    });

    // Free the table if no other active orders
    if (order.table_id) {
      const activeOrders = await Order.count({
        where: {
          table_id: order.table_id,
          restaurant_id,
          status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
          id: { [Op.ne]: order.id },
        },
      });
      if (activeOrders === 0) {
        await Table.update({ status: 'LIBRE' }, { where: { id: order.table_id, restaurant_id } });
        req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', { tableId: order.table_id, newStatus: 'LIBRE' });
      }
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('order:cancelled', { orderId: id, reason });

    res.json({ data: { id, status: 'CANCELLED' }, message: 'Commande annulée' });
  } catch (error) {
    console.error('[cancelOrder]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─── POST /api/orders/:id/print ───────────────────────────────────────────────
exports.printOrder = async (req, res) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, restaurant_id },
      include: [
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
        { model: OrderItem, as: 'items', include: [{ model: OrderItemSupplement, as: 'supplements' }] },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });
    }

    await printerService.printOrder(order, { restaurant_id });

    res.json({ data: null, message: 'Ticket envoyé à l\'imprimante' });
  } catch (error) {
    console.error('[printOrder]', error);
    // Printer errors should not crash — return user-friendly message
    res.status(500).json({ error: 'PRINTER_ERROR', message: error.message || 'Imprimante non disponible' });
  }
};
