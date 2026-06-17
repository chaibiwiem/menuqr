const { Restaurant, RestaurantHoraire } = require('../models');
const { uploadImage } = require('../config/cloudinary');

// ─── GET /api/settings ────────────────────────────────────────────────────────

exports.getSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const restaurant = await Restaurant.findOne({
      where: { id: restaurant_id },
      include: [{ model: RestaurantHoraire, as: 'horaires' }],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });
    res.json({ data: restaurant });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings ────────────────────────────────────────────────────────

exports.updateSettings = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const restaurant = await Restaurant.findOne({ where: { id: restaurant_id } });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const ALLOWED = [
      'name', 'email', 'phone', 'address', 'short_description', 'template_id',
      'social_facebook', 'social_instagram', 'social_tripadvisor',
      'social_google_maps', 'social_website', 'social_whatsapp',
      'custom_colors', 'custom_font', 'menu_languages',
    ];

    const updates = {};
    ALLOWED.forEach((f) => {
      if (req.body[f] !== undefined) {
        // JSON fields: keep as-is (null or object/array)
        if (f === 'custom_colors' || f === 'menu_languages') {
          updates[f] = req.body[f] ?? null;
        } else {
          updates[f] = req.body[f] || null;
        }
      }
    });

    await restaurant.update(updates);
    res.json({ data: restaurant, message: 'settings_updated' });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings/images ─────────────────────────────────────────────────

exports.updateImages = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const restaurant = await Restaurant.findOne({ where: { id: restaurant_id } });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const updates = {};
    if (req.files?.logo?.[0]) {
      const result = await uploadImage(req.files.logo[0], `menuqr/${restaurant.slug}`, 'logo');
      if (result?.secure_url) updates.logo_url = result.secure_url;
    }
    if (req.files?.banner?.[0]) {
      const result = await uploadImage(req.files.banner[0], `menuqr/${restaurant.slug}`, 'banner');
      if (result?.secure_url) updates.banner_url = result.secure_url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(422).json({ error: true, message: 'no_image_provided' });
    }

    await restaurant.update(updates);
    res.json({ data: restaurant, message: 'images_updated' });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings/horaires ───────────────────────────────────────────────

exports.updateHoraires = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { horaires } = req.body;

    if (!Array.isArray(horaires)) {
      return res.status(422).json({ error: true, message: 'horaires must be an array' });
    }

    await RestaurantHoraire.destroy({ where: { restaurant_id } });
    if (horaires.length > 0) {
      await RestaurantHoraire.bulkCreate(
        horaires.map((h) => ({ ...h, restaurant_id }))
      );
    }

    const updated = await RestaurantHoraire.findAll({ where: { restaurant_id }, order: [['day_of_week', 'ASC']] });
    res.json({ data: updated, message: 'horaires_updated' });
  } catch (err) { next(err); }
};
