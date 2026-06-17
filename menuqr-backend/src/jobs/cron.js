const cron = require('node-cron');
const { Op } = require('sequelize');
const { Reservation, ReservationSettings, Restaurant } = require('../models');
const { sendReservationReminderJ1 } = require('../services/emailService');

// Rappels J-1 tous les jours à 10h00
cron.schedule('0 10 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const reservations = await Reservation.findAll({
      where: { reservation_date: dateStr, status: 'CONFIRMEE', reminder_sent: 0 },
    });

    for (const r of reservations) {
      const settings = await ReservationSettings.findOne({ where: { restaurant_id: r.restaurant_id } });

      if (settings?.reminder_j1_enabled && r.email &&
          (settings.reminder_j1_channel === 'EMAIL' || settings.reminder_j1_channel === 'BOTH')) {
        const resto = await Restaurant.findByPk(r.restaurant_id, { attributes: ['name'] });
        if (resto) {
          await sendReservationReminderJ1({
            reservation: r,
            restaurantName: resto.name,
            lang: 'fr',
          }).catch((err) => console.error(`[CRON] J-1 email failed for #${r.id}:`, err.message));
        }
      } else {
        console.log(`[CRON] Rappel J-1 pour réservation ${r.id} — ${r.first_name} ${r.last_name} (pas d'email)`);
      }

      await r.update({ reminder_sent: 1, status: 'RAPPEL_ENVOYE' });
    }

    console.log(`[CRON] J-1 rappels traités: ${reservations.length}`);
  } catch (err) {
    console.error('[CRON] Erreur rappels J-1:', err.message);
  }
});

// Rappels H-2 toutes les heures (SMS/WhatsApp — non implémenté)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const dateStr = in2h.toISOString().split('T')[0];
    const timeStr = in2h.toTimeString().slice(0, 5);

    const reservations = await Reservation.findAll({
      where: {
        reservation_date: dateStr,
        reservation_time: { [Op.between]: [timeStr + ':00', timeStr + ':59'] },
        status: { [Op.in]: ['CONFIRMEE', 'RAPPEL_ENVOYE'] },
        reminder_sent: { [Op.lt]: 2 },
      },
    });

    for (const r of reservations) {
      const settings = await ReservationSettings.findOne({ where: { restaurant_id: r.restaurant_id } });
      if (settings?.reminder_h2_enabled) {
        console.log(`[CRON] Rappel H-2 pour réservation ${r.id} (SMS/WhatsApp non implémenté)`);
      }
      await r.update({ reminder_sent: 2 });
    }
  } catch (err) {
    console.error('[CRON] Erreur rappels H-2:', err.message);
  }
});

console.log('[CRON] Jobs planifiés: rappels J-1 (10h) + H-2 (toutes les heures)');
