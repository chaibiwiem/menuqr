const { Notification, NotificationSettings } = require('../models');

// ─── GET /api/notifications ───────────────────────────────────────────────────

exports.getNotifications = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const unreadOnly = req.query.unread === 'true';

    const where = { restaurant_id };
    if (unreadOnly) where.is_read = false;

    const notifications = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 30,
    });

    const unreadCount = await Notification.count({ where: { restaurant_id, is_read: false } });

    res.json({ data: notifications, meta: { unread: unreadCount } });
  } catch (err) { next(err); }
};

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────

exports.markAsRead = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, restaurant_id } }
    );
    res.json({ data: null, message: 'notification_read' });
  } catch (err) { next(err); }
};

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────

exports.markAllRead = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    await Notification.update({ is_read: true }, { where: { restaurant_id, is_read: false } });
    res.json({ data: null, message: 'all_read' });
  } catch (err) { next(err); }
};

// ─── GET /api/notifications/settings ─────────────────────────────────────────

exports.getSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    let settings = await NotificationSettings.findOne({ where: { restaurant_id } });
    if (!settings) {
      settings = await NotificationSettings.create({ restaurant_id });
    }
    res.json({ data: settings });
  } catch (err) { next(err); }
};

// ─── PUT /api/notifications/settings ─────────────────────────────────────────

exports.updateSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const allowed = ['sound_new_order', 'sound_call_waiter', 'sound_reservation', 'email_new_order', 'email_reservation', 'email_call_waiter'];

    let settings = await NotificationSettings.findOne({ where: { restaurant_id } });
    if (!settings) settings = await NotificationSettings.create({ restaurant_id });

    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await settings.update(updates);

    res.json({ data: settings, message: 'settings_updated' });
  } catch (err) { next(err); }
};
