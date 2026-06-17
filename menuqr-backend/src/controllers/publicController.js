const { Op } = require('sequelize');
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');
const {
  Restaurant, RestaurantHoraire, Menu, Category, MenuItem, SupplementGroup, SupplementOption, MenuItemVariant,
  Table, Order, OrderItem, OrderItemSupplement, QRScan, CallWaiter,
  Reservation, ReservationSettings,
} = require('../models');
const notificationService = require('../services/notificationService');
const { sendReservationConfirmation } = require('../services/emailService');

const DEFAULT_RESERVATION_SETTINGS = {
  is_active:            true,
  zones_enabled:        ['SALLE', 'TERRASSE', 'ETAGE'],
  open_slots:           [{ start: '11:00', end: '23:00' }],
  service_duration_min: 90,
  min_hours_before:     1,
  max_days_ahead:       30,
  capacity_salle:       50,
  capacity_terrasse:    30,
  capacity_etage:       20,
};

// ─── Restaurant info ──────────────────────────────────────────────────────────

exports.getRestaurantInfo = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: [
        'id', 'name', 'slug', 'type', 'email', 'phone', 'address',
        'logo_url', 'banner_url', 'short_description', 'template_id',
        'custom_colors', 'custom_font',
        'social_facebook', 'social_instagram', 'social_whatsapp', 'social_website',
      ],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const reservSettings = await ReservationSettings.findOne({
      where: { restaurant_id: restaurant.id },
      attributes: ['is_active'],
    });

    res.json({ data: { ...restaurant.toJSON(), reservations_active: reservSettings ? !!(reservSettings.is_active) : true } });
  } catch (err) { next(err); }
};

// ─── Verify table by QR token ─────────────────────────────────────────────────

exports.verifyTable = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: ['id', 'name'],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const table = await Table.findOne({
      where: { qr_token: req.params.qr_token, restaurant_id: restaurant.id, is_active: true },
      attributes: ['id', 'name', 'number', 'capacity', 'status'],
    });
    if (!table) return res.status(404).json({ error: true, message: 'table_not_found' });

    // Record QR scan
    await QRScan.create({
      table_id: table.id,
      restaurant_id: restaurant.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
    });

    res.json({ data: { table, restaurant } });
  } catch (err) { next(err); }
};

// ─── Get public menu ──────────────────────────────────────────────────────────

exports.getMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: [
        'id', 'name', 'slug', 'logo_url', 'banner_url', 'template_id', 'short_description',
        'phone', 'address',
        'social_facebook', 'social_instagram', 'social_whatsapp',
        'social_website', 'social_tripadvisor', 'social_google_maps',
        'custom_colors', 'custom_font', 'menu_languages',
      ],
      include: [{
        model: RestaurantHoraire,
        as: 'horaires',
        attributes: ['day_of_week', 'open_time', 'close_time', 'is_closed'],
      }],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const menus = await Menu.findAll({
      where: { restaurant_id: restaurant.id, is_active: true },
      attributes: ['id', 'name'],
      include: [{
        model: Category,
        as: 'categories',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name_fr', 'name_en', 'name_it', 'name_ar', 'icon', 'sort_order'],
        order: [['sort_order', 'ASC']],
        include: [{
          model: MenuItem,
          as: 'items',
          where: { is_available: true },
          required: false,
          attributes: [
            'id', 'name_fr', 'name_en', 'name_it', 'name_ar',
            'description_fr', 'description_en', 'description_it', 'description_ar',
            'price', 'price_night', 'price_happy_hour',
            'happy_hour_start', 'happy_hour_end',
            'image_url', 'is_available', 'is_featured', 'prep_time_min', 'sort_order',
            'promo_price', 'promo_label', 'promo_start', 'promo_end',
          ],
          order: [['sort_order', 'ASC']],
          include: [{
            model: SupplementGroup,
            as: 'supplementGroups',
            attributes: ['id', 'name_fr', 'name_en', 'name_it', 'name_ar', 'type', 'min_select', 'max_select', 'is_required'],
            include: [{
              model: SupplementOption,
              as: 'options',
              where: { is_available: true },
              required: false,
              attributes: ['id', 'name_fr', 'name_en', 'name_it', 'name_ar', 'extra_price'],
            }],
          }],
        }],
      }],
      order: [['name', 'ASC']],
    });

    // Convert to plain JS before attaching variants (avoids Sequelize serialization issues)
    const plainMenus = JSON.parse(JSON.stringify(menus));
    const allItems = plainMenus.flatMap((m) => (m.categories || []).flatMap((c) => c.items || []));

    if (allItems.length > 0) {
      const itemIds = allItems.map((i) => i.id);
      const variantRows = await MenuItemVariant.findAll({
        where: { menu_item_id: { [Op.in]: itemIds }, is_available: true },
        attributes: ['id', 'menu_item_id', 'label_fr', 'label_en', 'label_it', 'label_ar', 'price', 'sort_order'],
        order: [['sort_order', 'ASC']],
        raw: true,
      });
      const byItem = {};
      variantRows.forEach((v) => {
        if (!byItem[v.menu_item_id]) byItem[v.menu_item_id] = [];
        byItem[v.menu_item_id].push(v);
      });
      allItems.forEach((item) => {
        item.variants = byItem[item.id] || [];
      });
    }

    const reservSettings = await ReservationSettings.findOne({
      where: { restaurant_id: restaurant.id },
      attributes: ['is_active'],
    });

    const restaurantData = {
      ...restaurant.toJSON(),
      reservations_active: reservSettings ? !!(reservSettings.is_active) : true,
    };

    res.json({ data: { restaurant: restaurantData, menus: plainMenus } });
  } catch (err) { next(err); }
};

// ─── Create order ─────────────────────────────────────────────────────────────

exports.createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: ['id'],
      transaction: t,
    });
    if (!restaurant) {
      await t.rollback();
      return res.status(404).json({ error: true, message: 'restaurant_not_found' });
    }

    const { table_id, items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(422).json({ error: true, message: 'order_empty' });
    }

    // Fetch all requested menu items to get prices
    const itemIds = items.map((i) => i.menu_item_id).filter(Boolean);
    const menuItems = await MenuItem.findAll({
      where: { id: { [Op.in]: itemIds } },
      attributes: ['id', 'name_fr', 'price', 'is_available'],
      transaction: t,
    });
    const itemMap = Object.fromEntries(menuItems.map((mi) => [mi.id, mi]));

    // Fetch variants referenced in the order
    const variantIds = items.map((i) => i.variant_id).filter(Boolean);
    const variantMap = {};
    if (variantIds.length > 0) {
      const dbVariants = await MenuItemVariant.findAll({
        where: { id: { [Op.in]: variantIds } },
        attributes: ['id', 'menu_item_id', 'label_fr', 'price'],
        transaction: t,
      });
      dbVariants.forEach((v) => { variantMap[v.id] = v; });
    }

    // Calculate total
    let total = 0;
    for (const line of items) {
      const mi = itemMap[line.menu_item_id];
      if (!mi || !mi.is_available) {
        await t.rollback();
        return res.status(422).json({ error: true, message: 'item_unavailable', item_id: line.menu_item_id });
      }
      const variant = line.variant_id ? variantMap[line.variant_id] : null;
      const unitPrice = variant ? parseFloat(variant.price) : parseFloat(mi.price);
      const lineBase = unitPrice * line.quantity;
      const suppExtra = (line.supplements || []).reduce((acc, s) => acc + (parseFloat(s.extra_price) || 0) * line.quantity, 0);
      total += lineBase + suppExtra;
    }
    total = Math.round(total * 1000) / 1000;

    const order = await Order.create({
      restaurant_id: restaurant.id,
      table_id: table_id || null,
      total,
      notes: notes || null,
      status: 'PENDING',
    }, { transaction: t });

    for (const line of items) {
      const mi = itemMap[line.menu_item_id];
      const variant = line.variant_id ? variantMap[line.variant_id] : null;
      const unitPrice = variant ? parseFloat(variant.price) : parseFloat(mi.price);
      const nameSnapshot = variant ? `${mi.name_fr} (${variant.label_fr})` : mi.name_fr;
      const orderItem = await OrderItem.create({
        order_id: order.id,
        menu_item_id: line.menu_item_id,
        quantity: line.quantity,
        unit_price: unitPrice,
        name_snapshot: nameSnapshot,
        notes: line.notes || null,
      }, { transaction: t });

      if (line.supplements && line.supplements.length > 0) {
        for (const supp of line.supplements) {
          await OrderItemSupplement.create({
            order_item_id: orderItem.id,
            supplement_option_id: supp.option_id || null,
            option_name_snapshot: supp.name || '',
            extra_price: parseFloat(supp.extra_price) || 0,
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    // Mark table as occupied
    if (table_id) {
      await Table.update({ status: 'OCCUPEE' }, { where: { id: table_id } });
    }

    // Fetch table name for notification
    const tableInfo = table_id
      ? await Table.findByPk(table_id, { attributes: ['name', 'number'] })
      : null;
    const tableLabel = tableInfo ? `Table ${tableInfo.name || tableInfo.number}` : 'Commande en ligne';

    // Emit to restaurant room
    req.io.to(`restaurant:${restaurant.id}`).emit('order:new', {
      order_id:    order.id,
      table_id,
      table_name:  tableInfo?.name || null,
      table_number: tableInfo?.number || null,
      total:       order.total,
      status:      order.status,
      items_count: items.length,
    });

    // Persist notification in DB + emit notification:new
    notificationService.create(req.io, {
      restaurant_id: restaurant.id,
      type:          'NEW_ORDER',
      title:         'Nouvelle commande',
      body:          `${tableLabel} — ${items.length} article(s)`,
      reference_id:  order.id,
    });

    res.status(201).json({ data: { id: order.id, status: order.status, total: order.total } });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── Track order ──────────────────────────────────────────────────────────────

exports.trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      attributes: ['id', 'restaurant_id', 'status', 'total', 'notes', 'created_at'],
      include: [{
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'name_snapshot', 'quantity', 'unit_price', 'notes'],
        include: [{
          model: OrderItemSupplement,
          as: 'supplements',
          attributes: ['option_name_snapshot', 'extra_price'],
        }],
      }],
    });
    if (!order) return res.status(404).json({ error: true, message: 'order_not_found' });
    res.json({ data: order });
  } catch (err) { next(err); }
};

// ─── Call waiter ──────────────────────────────────────────────────────────────

exports.createCallWaiter = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: ['id'],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const { table_id, type, message } = req.body;

    // Check for existing PENDING call on this table
    const existing = await CallWaiter.findOne({
      where: { table_id, restaurant_id: restaurant.id, status: 'PENDING' },
    });
    if (existing) {
      return res.status(409).json({ error: true, message: 'call_already_pending' });
    }

    const call = await CallWaiter.create({
      restaurant_id: restaurant.id,
      table_id,
      type: type || 'WAITER',
      message: message || null,
      status: 'PENDING',
    });

    // Get table name for the event
    const table = await Table.findByPk(table_id, { attributes: ['name', 'number'] });

    // Mark table as EN_ATTENTE
    await Table.update({ status: 'EN_ATTENTE' }, { where: { id: table_id } });

    const TYPE_LABELS = { WAITER: 'Appel serveur', CHECK: 'Demande addition', OTHER: 'Autre' };

    req.io.to(`restaurant:${restaurant.id}`).emit('call_waiter:new', {
      id:           call.id,
      table_id,
      table_name:   table?.name   || null,
      table_number: table?.number || null,
      type:         call.type,
      message:      call.message,
      created_at:   call.created_at,
    });

    req.io.to(`restaurant:${restaurant.id}`).emit('table:status_changed', {
      table_id,
      new_status: 'EN_ATTENTE',
    });

    // Persist notification in DB + emit notification:new
    notificationService.create(req.io, {
      restaurant_id: restaurant.id,
      type:          'CALL_WAITER',
      title:         TYPE_LABELS[call.type] || 'Appel serveur',
      body:          `Table ${table?.name || table?.number || ''} — ${TYPE_LABELS[call.type] || call.type}`,
      reference_id:  call.id,
    });

    res.status(201).json({ data: { id: call.id }, message: 'call_sent' });
  } catch (err) { next(err); }
};

// ─── Reservation slots ────────────────────────────────────────────────────────

exports.getReservationSlots = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: ['id'],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const rawSettings = await ReservationSettings.findOne({ where: { restaurant_id: restaurant.id } });
    const settings = rawSettings ?? DEFAULT_RESERVATION_SETTINGS;
    if (!settings.is_active) return res.json({ data: [] });

    const { date, zone } = req.query;
    if (!date || !zone) return res.json({ data: [] });

    const zonesEnabled = settings.zones_enabled || ['SALLE', 'TERRASSE', 'ETAGE'];
    if (!zonesEnabled.includes(zone)) return res.json({ data: [] });

    // Validate date range
    const now = new Date();
    const requestedDate = new Date(date + 'T00:00:00');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (settings.max_days_ahead || 30));
    if (requestedDate > maxDate) return res.json({ data: [] });

    // Generate slots from open_slots ranges (30min step)
    const openSlots = settings.open_slots || [];
    const allSlots = [];
    for (const range of openSlots) {
      const [sh, sm] = range.start.split(':').map(Number);
      const [eh, em] = range.end.split(':').map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      while (cur + (settings.service_duration_min || 90) <= end) {
        const h = String(Math.floor(cur / 60)).padStart(2, '0');
        const m = String(cur % 60).padStart(2, '0');
        allSlots.push(`${h}:${m}`);
        cur += 30;
      }
    }

    // Filter slots by min_hours_before when date is today
    const isToday = date === now.toISOString().split('T')[0];
    const minHoursBefore = settings.min_hours_before || 2;
    const filteredSlots = isToday
      ? allSlots.filter((time) => {
          const [h, m] = time.split(':').map(Number);
          const slotMs = new Date(date + 'T' + time + ':00').getTime();
          return slotMs - now.getTime() >= minHoursBefore * 60 * 60 * 1000;
        })
      : allSlots;

    // Count existing reservations per slot for this date + zone
    const existing = await Reservation.findAll({
      where: {
        restaurant_id: restaurant.id,
        reservation_date: date,
        zone,
        status: { [Op.in]: ['EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE', 'ARRIVEE'] },
      },
      attributes: ['reservation_time'],
    });

    const countBySlot = {};
    for (const r of existing) {
      const t = r.reservation_time?.slice(0, 5);
      countBySlot[t] = (countBySlot[t] || 0) + 1;
    }

    const capacityMap = {
      SALLE: settings.capacity_salle || 50,
      TERRASSE: settings.capacity_terrasse || 30,
      ETAGE: settings.capacity_etage || 20,
    };
    const capacity = capacityMap[zone] || 50;

    const result = filteredSlots.map((time) => ({
      time,
      available: Math.max(0, capacity - (countBySlot[time] || 0)),
      is_full: (countBySlot[time] || 0) >= capacity,
    }));

    res.json({ data: result });
  } catch (err) { next(err); }
};

// ─── Create reservation (public) ──────────────────────────────────────────────

exports.createReservation = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { slug: req.params.slug, is_active: true },
      attributes: ['id', 'name', 'plan'],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const rawSettings = await ReservationSettings.findOne({ where: { restaurant_id: restaurant.id } });
    const settings = rawSettings ?? DEFAULT_RESERVATION_SETTINGS;
    if (!settings.is_active) {
      return res.status(403).json({ error: true, message: 'reservations_not_configured' });
    }

    const {
      first_name, last_name, email, phone,
      reservation_date, reservation_time,
      covers, zone, notes,
    } = req.body;

    if (!first_name?.trim() || !last_name?.trim() || !phone?.trim() || !reservation_date || !reservation_time || !zone) {
      return res.status(422).json({ error: true, message: 'missing_required_fields' });
    }
    if (!covers || parseInt(covers, 10) < 1 || parseInt(covers, 10) > 50) {
      return res.status(422).json({ error: true, message: 'invalid_covers' });
    }

    // Check zone enabled
    const zonesEnabled = settings.zones_enabled || ['SALLE', 'TERRASSE', 'ETAGE'];
    if (!zonesEnabled.includes(zone)) {
      return res.status(422).json({ error: true, message: 'zone_not_available' });
    }

    // Check max_days_ahead
    const now = new Date();
    const reqDate = new Date(reservation_date + 'T00:00:00');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (settings.max_days_ahead || 30));
    if (reqDate > maxDate) {
      return res.status(422).json({ error: true, message: 'date_too_far' });
    }

    // Check min_hours_before
    const isToday = reservation_date === now.toISOString().split('T')[0];
    if (isToday) {
      const slotMs = new Date(reservation_date + 'T' + reservation_time).getTime();
      if (slotMs - now.getTime() < (settings.min_hours_before || 2) * 60 * 60 * 1000) {
        return res.status(422).json({ error: true, message: 'too_late_to_book' });
      }
    }

    // Race-condition check: verify slot still available
    const slotCount = await Reservation.count({
      where: {
        restaurant_id: restaurant.id,
        reservation_date,
        reservation_time,
        zone,
        status: { [Op.in]: ['EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE', 'ARRIVEE'] },
      },
    });
    const capacityMap = {
      SALLE: settings.capacity_salle || 50,
      TERRASSE: settings.capacity_terrasse || 30,
      ETAGE: settings.capacity_etage || 20,
    };
    if (slotCount >= capacityMap[zone]) {
      return res.status(409).json({ error: true, message: 'slot_full' });
    }

    // Generate cancel token
    const cancelToken = jwt.sign(
      { purpose: 'cancel', restaurant_id: restaurant.id },
      process.env.JWT_SECRET,
      { expiresIn: '48h' }
    );

    const status = settings.auto_confirm ? 'CONFIRMEE' : 'EN_ATTENTE';

    const reservation = await Reservation.create({
      restaurant_id: restaurant.id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      reservation_date,
      reservation_time,
      covers: parseInt(covers, 10),
      zone,
      notes: notes?.trim() || null,
      status,
      cancel_token: cancelToken,
      confirmed_at: status === 'CONFIRMEE' ? new Date() : null,
    });

    req.io.to(`restaurant:${restaurant.id}`).emit('reservation:new', {
      id: reservation.id,
      first_name: reservation.first_name,
      last_name: reservation.last_name,
      covers: reservation.covers,
      reservation_date,
      reservation_time,
      zone: reservation.zone,
      status,
    });

    if (reservation.email) {
      sendReservationConfirmation({
        reservation,
        restaurantName: restaurant.name,
        lang: 'fr',
      }).catch((err) => console.error('[EMAIL] Reservation confirmation failed:', err.message));
    }

    res.status(201).json({ data: { id: reservation.id, status }, message: 'reservation_created' });
  } catch (err) { next(err); }
};

// ─── Cancel via token (public) ────────────────────────────────────────────────

exports.cancelViaToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: true, message: 'missing_token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: true, message: 'invalid_or_expired_token' });
    }

    if (payload.purpose !== 'cancel') {
      return res.status(400).json({ error: true, message: 'invalid_token_purpose' });
    }

    const reservation = await Reservation.findOne({ where: { cancel_token: token } });
    if (!reservation) return res.status(404).json({ error: true, message: 'reservation_not_found' });

    if (!['EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE'].includes(reservation.status)) {
      return res.status(409).json({ error: true, message: 'cannot_cancel_in_current_status' });
    }

    await reservation.update({ status: 'ANNULEE_CLIENT', cancel_token: null });

    // Free assigned table
    if (reservation.table_id) {
      await Table.update({ status: 'LIBRE' }, { where: { id: reservation.table_id } });
    }

    res.json({ data: { id: reservation.id }, message: 'reservation_cancelled' });
  } catch (err) { next(err); }
};
