const { Op } = require('sequelize');
const {
  Order, OrderItem, OrderItemSupplement,
  Table, Room, Payment, ServiceClose, Restaurant,
  Menu, Category, MenuItem, SupplementGroup, SupplementOption, MenuItemVariant,
  User,
} = require('../models');
const pdfService = require('../services/pdfService');
const printerService = require('../services/printerService');

// ─── GET /api/pos/menu ────────────────────────────────────────────────────────
// Returns active menus → categories → available items + supplements for POS order creation

exports.getMenuForPOS = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;

    const menus = await Menu.findAll({
      where: { restaurant_id, is_active: true },
      include: [{
        model: Category,
        as: 'categories',
        where: { is_active: true },
        required: false,
        include: [{
          model: MenuItem,
          as: 'items',
          where: { is_available: true },
          required: false,
          include: [
            {
              model: SupplementGroup,
              as: 'supplementGroups',
              required: false,
              include: [{
                model: SupplementOption,
                as: 'options',
                where: { is_available: true },
                required: false,
              }],
            },
            {
              model: MenuItemVariant,
              as: 'variants',
              required: false,
            },
          ],
        }],
      }],
      order: [
        ['id', 'ASC'],
        [{ model: Category, as: 'categories' }, 'sort_order', 'ASC'],
      ],
    });

    res.json({ data: menus });
  } catch (err) { next(err); }
};

// ─── GET /api/pos/tables — ALL active tables (LIBRE + OCCUPEE + EN_ATTENTE) ──

exports.getAllTables = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;

    const tables = await Table.findAll({
      where: { restaurant_id, is_active: true },
      include: [
        { model: Room, as: 'room', attributes: ['id', 'name', 'zone'], required: false },
        {
          model: Order,
          as: 'orders',
          where: { status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } },
          attributes: ['id', 'total', 'status', 'created_at'],
          required: false,
        },
      ],
      order: [['number', 'ASC']],
    });

    res.json({ data: tables });
  } catch (err) { next(err); }
};

// ─── GET /api/pos/active-tables ───────────────────────────────────────────────

exports.getActiveTables = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;

    const tables = await Table.findAll({
      where: {
        restaurant_id,
        is_active: true,
        status: { [Op.in]: ['OCCUPEE', 'EN_ATTENTE'] },
      },
      include: [
        { model: Room, as: 'room', attributes: ['id', 'name', 'zone'], required: false },
        {
          model: Order,
          as: 'orders',
          where: { status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] } },
          attributes: ['id', 'total', 'status', 'created_at'],
          required: false,
        },
      ],
      order: [['number', 'ASC']],
    });

    res.json({ data: tables });
  } catch (err) { next(err); }
};

// ─── GET /api/pos/orders/:tableId ─────────────────────────────────────────────

exports.getTableOrder = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { tableId } = req.params;

    const table = await Table.findOne({ where: { id: tableId, restaurant_id } });
    if (!table) return res.status(404).json({ error: 'NOT_FOUND', message: 'Table introuvable' });

    const order = await Order.findOne({
      where: {
        table_id: tableId,
        restaurant_id,
        status: { [Op.in]: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: OrderItemSupplement, as: 'supplements' }],
      }],
      order: [['created_at', 'DESC']],
    });

    res.json({ data: order || null });
  } catch (err) { next(err); }
};

// ─── POST /api/pos/payments ───────────────────────────────────────────────────

exports.processPayment = async (req, res, next) => {
  try {
    const { restaurant_id, id: userId } = req.user;
    const { order_id, method, amount_received, discount_amount = 0, discount_type = null } = req.body;

    if (!order_id || !method || !['CASH', 'CARD'].includes(method)) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'order_id et method (CASH/CARD) requis' });
    }

    const order = await Order.findOne({
      where: { id: order_id, restaurant_id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: OrderItemSupplement, as: 'supplements' }] },
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });

    let finalTotal = Number(order.total);
    if (Number(discount_amount) > 0) {
      if (discount_type === 'PERCENT') {
        finalTotal = finalTotal * (1 - Number(discount_amount) / 100);
      } else {
        finalTotal = Math.max(0, finalTotal - Number(discount_amount));
      }
      finalTotal = Math.round(finalTotal * 1000) / 1000;
    }

    let change_given = 0;
    if (method === 'CASH') {
      const received = Number(amount_received) || 0;
      if (received < finalTotal) {
        return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Montant reçu insuffisant' });
      }
      change_given = Math.round((received - finalTotal) * 1000) / 1000;
    }

    const payment = await Payment.create({
      order_id,
      method,
      amount: finalTotal,
      change_given,
      discount_amount: Number(discount_amount) || 0,
      discount_type: discount_type || null,
      processed_by: userId,
      processed_at: new Date(),
    });

    await order.update({ status: 'CLOSED', payment_method: method });

    if (order.table_id) {
      await Table.update({ status: 'LIBRE' }, { where: { id: order.table_id, restaurant_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
        tableId: order.table_id,
        newStatus: 'LIBRE',
      });
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('order:status_changed', {
      orderId: order_id,
      newStatus: 'CLOSED',
    });

    res.status(201).json({
      data: { payment, order: { id: order.id, status: 'CLOSED' } },
      message: 'Paiement validé',
    });
  } catch (err) { next(err); }
};

// ─── POST /api/pos/print/pre-check/:orderId ────────────────────────────────────

exports.printPreCheck = async (req, res, next) => {
  try {
    const { restaurant_id, id: userId } = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, restaurant_id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: OrderItemSupplement, as: 'supplements' }] },
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });

    const restaurant = await Restaurant.findOne({
      where: { id: restaurant_id },
      attributes: ['name', 'address', 'phone'],
    });

    const currentUser = await User.findByPk(userId, { attributes: ['name', 'role'] });

    const fakePayment = {
      method: 'CASH', amount: order.total, change_given: 0,
      discount_amount: 0, processed_at: new Date(),
      processedBy: currentUser ? { name: currentUser.name, role: currentUser.role } : null,
    };

    // Send to network thermal printer if configured — non-blocking, PDF stays the fallback
    try {
      await printerService.printReceipt(fakePayment, order.toJSON(), restaurant?.toJSON() || {});
    } catch (printErr) {
      console.error('[printPreCheck] impression thermique echouee:', printErr.message);
    }

    const buffer = await pdfService.generateReceipt(fakePayment, order.toJSON(), restaurant?.toJSON() || {});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="pre-check-${String(orderId).slice(-6)}.pdf"`);
    res.send(buffer);
  } catch (err) { next(err); }
};

// ─── POST /api/pos/print/receipt/:paymentId ────────────────────────────────────

exports.printReceipt = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [{ model: User, as: 'processedBy', attributes: ['name', 'role'] }],
    });
    if (!payment) return res.status(404).json({ error: 'NOT_FOUND', message: 'Paiement introuvable' });

    const order = await Order.findOne({
      where: { id: payment.order_id, restaurant_id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: OrderItemSupplement, as: 'supplements' }] },
        { model: Table, as: 'table', attributes: ['id', 'name', 'number'] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable' });

    const restaurant = await Restaurant.findOne({
      where: { id: restaurant_id },
      attributes: ['name', 'address', 'phone'],
    });

    // Send to network thermal printer if configured — non-blocking, PDF stays the fallback
    try {
      await printerService.printReceipt(payment.toJSON(), order.toJSON(), restaurant?.toJSON() || {});
    } catch (printErr) {
      console.error('[printReceipt] impression thermique echouee:', printErr.message);
    }

    const buffer = await pdfService.generateReceipt(payment.toJSON(), order.toJSON(), restaurant?.toJSON() || {});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${String(paymentId).slice(-6)}.pdf"`);
    res.send(buffer);
  } catch (err) { next(err); }
};

// ─── GET /api/pos/service-close ───────────────────────────────────────────────

exports.getServiceCloses = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const closes = await ServiceClose.findAll({
      where: { restaurant_id },
      order: [['created_at', 'DESC']],
      limit: 30,
    });
    res.json({ data: closes });
  } catch (err) { next(err); }
};

// ─── POST /api/pos/service-close ──────────────────────────────────────────────

exports.closeService = async (req, res, next) => {
  try {
    const { restaurant_id, id: userId } = req.user;
    const { notes } = req.body;

    const today = new Date().toISOString().split('T')[0];

    // Closed orders today for this restaurant
    const closedOrders = await Order.findAll({
      where: {
        restaurant_id,
        status: 'CLOSED',
        updated_at: { [Op.gte]: new Date(today) },
      },
      attributes: ['id'],
    });

    const orderIds = closedOrders.map((o) => o.id);

    let total_cash = 0;
    let total_card = 0;

    if (orderIds.length > 0) {
      const payments = await Payment.findAll({
        where: { order_id: { [Op.in]: orderIds } },
      });
      payments.forEach((p) => {
        if (p.method === 'CASH') total_cash += Number(p.amount);
        else if (p.method === 'CARD') total_card += Number(p.amount);
      });
    }

    total_cash    = Math.round(total_cash    * 1000) / 1000;
    total_card    = Math.round(total_card    * 1000) / 1000;
    const total_revenue = Math.round((total_cash + total_card) * 1000) / 1000;

    const serviceClose = await ServiceClose.create({
      restaurant_id,
      date: today,
      total_cash,
      total_card,
      total_orders: orderIds.length,
      total_revenue,
      notes: notes?.trim() || null,
      closed_by: userId,
      created_at: new Date(),
    });

    res.status(201).json({ data: serviceClose, message: 'Service clôturé' });
  } catch (err) { next(err); }
};

// ─── GET /api/pos/service-close/:id/report ────────────────────────────────────

exports.getServiceReport = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const serviceClose = await ServiceClose.findOne({ where: { id, restaurant_id } });
    if (!serviceClose) return res.status(404).json({ error: 'NOT_FOUND', message: 'Rapport introuvable' });

    const restaurant = await Restaurant.findOne({
      where: { id: restaurant_id },
      attributes: ['name', 'address', 'phone'],
    });

    const buffer = await pdfService.generateServiceReport(serviceClose.toJSON(), restaurant?.toJSON() || {});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="service-${serviceClose.date}.pdf"`);
    res.send(buffer);
  } catch (err) { next(err); }
};
