const { Notification } = require('../models');

exports.create = async (io, { restaurant_id, type, title, body = null, reference_id = null }) => {
  try {
    const notif = await Notification.create({ restaurant_id, type, title, body, reference_id });
    if (io) {
      io.to(`restaurant:${restaurant_id}`).emit('notification:new', {
        id:           notif.id,
        type,
        title,
        body,
        reference_id,
        is_read:      false,
        created_at:   notif.created_at,
      });
    }
    return notif;
  } catch (err) {
    console.error('[notificationService]', err.message);
  }
};
