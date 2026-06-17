const { Op } = require('sequelize');
const { Reservation, ReservationSettings, Table, Room, Restaurant } = require('../models');
const { sendReservationStatusUpdate } = require('../services/emailService');

const ACTIVE_STATUSES = ['EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE', 'ARRIVEE'];
const TERMINAL_STATUSES = ['TERMINEE', 'ANNULEE', 'ANNULEE_CLIENT', 'ANNULEE_RESTAURANT', 'NO_SHOW'];
const VALID_STATUSES = [
  'EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE', 'ARRIVEE', 'TERMINEE',
  'ANNULEE', 'ANNULEE_CLIENT', 'ANNULEE_RESTAURANT', 'NO_SHOW',
];

// ─── GET /api/reservations ────────────────────────────────────────────────────

exports.getReservations = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { date, date_from, date_to, status, zone, search, page = 1, limit = 500 } = req.query;

    const where = { restaurant_id };
    if (date) {
      where.reservation_date = date;
    } else if (date_from && date_to) {
      where.reservation_date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      where.reservation_date = { [Op.gte]: date_from };
    }
    if (status) where.status = status;
    if (zone) where.zone = zone;
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: reservations, count } = await Reservation.findAndCountAll({
      where,
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'name', 'number'],
        required: false,
      }],
      order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ data: reservations, total: count, page: parseInt(page) });
  } catch (err) { next(err); }
};

// ─── GET /api/reservations/today ──────────────────────────────────────────────

exports.getTodayReservations = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const today = new Date().toISOString().split('T')[0];

    const reservations = await Reservation.findAll({
      where: { restaurant_id, reservation_date: today },
      include: [{ model: Table, as: 'table', attributes: ['id', 'name', 'number'], required: false }],
      order: [['reservation_time', 'ASC']],
    });

    res.json({ data: reservations });
  } catch (err) { next(err); }
};

// ─── PUT /api/reservations/:id/status ─────────────────────────────────────────

exports.updateStatus = async (req, res, next) => {
  try {
    const { restaurant_id, role } = req.user;
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Statut invalide' });
    }

    // STAFF/CASHIER: confirmer, arrivée, no-show, clôture (terminée) — pas d'annulation
    if (['STAFF', 'CASHIER'].includes(role) && !['CONFIRMEE', 'ARRIVEE', 'NO_SHOW', 'TERMINEE'].includes(status)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Accès refusé' });
    }

    const reservation = await Reservation.findOne({ where: { id, restaurant_id } });
    if (!reservation) return res.status(404).json({ error: 'NOT_FOUND', message: 'Réservation introuvable' });

    const updates = { status };
    if (reason) updates.cancel_reason = reason;
    if (status === 'CONFIRMEE' && !reservation.confirmed_at) updates.confirmed_at = new Date();

    await reservation.update(updates);

    // Table integration
    if (reservation.table_id) {
      if (status === 'ARRIVEE') {
        await Table.update({ status: 'OCCUPEE' }, { where: { id: reservation.table_id, restaurant_id } });
        req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
          tableId: reservation.table_id,
          newStatus: 'OCCUPEE',
        });
      } else if (TERMINAL_STATUSES.includes(status)) {
        await Table.update({ status: 'LIBRE' }, { where: { id: reservation.table_id, restaurant_id } });
        req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
          tableId: reservation.table_id,
          newStatus: 'LIBRE',
        });
      }
    }

    req.io.to(`restaurant:${restaurant_id}`).emit('reservation:status_changed', { id, status });

    if (reservation.email && ['CONFIRMEE', 'ANNULEE', 'ANNULEE_RESTAURANT', 'REFUSEE'].includes(status)) {
      Restaurant.findByPk(restaurant_id, { attributes: ['name'] }).then((resto) => {
        if (resto) {
          sendReservationStatusUpdate({
            reservation: { ...reservation.toJSON(), status },
            restaurantName: resto.name,
            lang: 'fr',
          }).catch((err) => console.error('[EMAIL] Status update email failed:', err.message));
        }
      });
    }

    res.json({ data: { id, status } });
  } catch (err) { next(err); }
};

// ─── PUT /api/reservations/:id/assign-table ───────────────────────────────────

exports.assignTable = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { table_id } = req.body;

    const reservation = await Reservation.findOne({ where: { id, restaurant_id } });
    if (!reservation) return res.status(404).json({ error: 'NOT_FOUND', message: 'Réservation introuvable' });

    // Free previous table if different
    if (reservation.table_id && reservation.table_id !== table_id) {
      await Table.update({ status: 'LIBRE' }, { where: { id: reservation.table_id, restaurant_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
        tableId: reservation.table_id,
        newStatus: 'LIBRE',
      });
    }

    await reservation.update({ table_id: table_id || null });

    if (table_id) {
      await Table.update({ status: 'RESERVEE' }, { where: { id: table_id, restaurant_id } });
      req.io.to(`restaurant:${restaurant_id}`).emit('table:status_changed', {
        tableId: table_id,
        newStatus: 'RESERVEE',
      });
    }

    res.json({ data: { id, table_id: table_id || null }, message: 'Table assignée' });
  } catch (err) { next(err); }
};

// ─── GET /api/reservations/tables ─────────────────────────────────────────────

exports.getAvailableTables = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const tables = await Table.findAll({
      where: { restaurant_id, is_active: true, status: { [Op.in]: ['LIBRE', 'RESERVEE'] } },
      include: [{ model: Room, as: 'room', attributes: ['id', 'name', 'zone'], required: false }],
      attributes: ['id', 'name', 'number', 'capacity', 'status'],
      order: [['number', 'ASC']],
    });
    res.json({ data: tables });
  } catch (err) { next(err); }
};

// ─── GET /api/reservations/settings ──────────────────────────────────────────

exports.getSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    let settings = await ReservationSettings.findOne({ where: { restaurant_id } });
    if (!settings) {
      settings = await ReservationSettings.create({ restaurant_id });
    }
    res.json({ data: settings });
  } catch (err) { next(err); }
};

// ─── PUT /api/reservations/settings ──────────────────────────────────────────

exports.updateSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    let settings = await ReservationSettings.findOne({ where: { restaurant_id } });
    if (!settings) {
      settings = await ReservationSettings.create({ restaurant_id, ...req.body });
    } else {
      await settings.update(req.body);
    }
    res.json({ data: settings, message: 'Paramètres mis à jour' });
  } catch (err) { next(err); }
};

// ─── PUT /api/reservations/:id ───────────────────────────────────────────────

exports.updateReservation = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const {
      first_name, last_name, email, phone,
      reservation_date, reservation_time,
      covers, zone, notes,
    } = req.body;

    const reservation = await Reservation.findOne({ where: { id, restaurant_id } });
    if (!reservation) return res.status(404).json({ error: 'NOT_FOUND', message: 'Réservation introuvable' });

    await reservation.update({
      ...(first_name       && { first_name: first_name.trim() }),
      ...(last_name        && { last_name: last_name.trim() }),
      ...(phone            && { phone: phone.trim() }),
      email:               email?.trim() || null,
      ...(reservation_date && { reservation_date }),
      ...(reservation_time && { reservation_time }),
      ...(covers           && { covers: parseInt(covers) }),
      ...(zone             && { zone }),
      notes:               notes?.trim() || null,
    });

    res.json({ data: reservation, message: 'Réservation mise à jour' });
  } catch (err) { next(err); }
};

// ─── POST /api/reservations ───────────────────────────────────────────────────

exports.createReservation = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const {
      first_name, last_name, email, phone,
      reservation_date, reservation_time,
      covers, zone, notes,
    } = req.body;

    if (!first_name || !last_name || !phone || !reservation_date || !reservation_time || !covers || !zone) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Champs requis manquants' });
    }

    const settings = await ReservationSettings.findOne({ where: { restaurant_id } });
    const auto_confirm = settings?.auto_confirm;

    const reservation = await Reservation.create({
      restaurant_id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      reservation_date,
      reservation_time,
      covers: parseInt(covers),
      zone,
      notes: notes?.trim() || null,
      status: auto_confirm ? 'CONFIRMEE' : 'EN_ATTENTE',
      confirmed_at: auto_confirm ? new Date() : null,
    });

    req.io.to(`restaurant:${restaurant_id}`).emit('reservation:new', { id: reservation.id });

    res.status(201).json({ data: reservation, message: 'Réservation créée' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/reservations/:id ─────────────────────────────────────────────

exports.deleteReservation = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const reservation = await Reservation.findOne({ where: { id, restaurant_id } });
    if (!reservation) return res.status(404).json({ error: 'NOT_FOUND', message: 'Réservation introuvable' });

    // Free assigned table
    if (reservation.table_id) {
      await Table.update({ status: 'LIBRE' }, { where: { id: reservation.table_id, restaurant_id } });
    }

    await reservation.destroy();
    res.json({ data: null, message: 'Réservation supprimée' });
  } catch (err) { next(err); }
};
