const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Menu, Category, MenuItem, SupplementGroup, SupplementOption, MenuItemVariant } = require('../models');
const { uploadImage } = require('../config/cloudinary');

// ─── Ownership helpers ────────────────────────────────────────────────────────

async function verifyCategoryOwnership(categoryId, restaurantId) {
  return Category.findByPk(categoryId, {
    include: [{ model: Menu, as: 'menu', where: { restaurant_id: restaurantId }, required: true }],
  });
}

async function verifyItemOwnership(itemId, restaurantId) {
  return MenuItem.findByPk(itemId, {
    include: [{
      model: Category,
      as: 'category',
      required: true,
      include: [{ model: Menu, as: 'menu', where: { restaurant_id: restaurantId }, required: true }],
    }],
  });
}

// ─── Menus ────────────────────────────────────────────────────────────────────

exports.getMenus = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menus = await Menu.findAll({
      where: { restaurant_id },
      include: [{
        model: Category,
        as: 'categories',
        include: [{ model: MenuItem, as: 'items', attributes: ['id', 'is_available', 'is_featured'] }],
        order: [['sort_order', 'ASC']],
      }],
      order: [['created_at', 'ASC']],
    });
    return res.json({ data: menus, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.createMenu = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { name } = req.body;
    if (!name?.trim()) return res.status(422).json({ error: true, message: 'name_required' });
    const menu = await Menu.create({ name: name.trim(), restaurant_id });
    return res.status(201).json({ data: menu, message: 'created' });
  } catch (err) {
    next(err);
  }
};

exports.getMenu = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menu = await Menu.findOne({
      where: { id: req.params.id, restaurant_id },
      include: [{
        model: Category,
        as: 'categories',
        order: [['sort_order', 'ASC']],
        include: [{
          model: MenuItem,
          as: 'items',
          order: [['sort_order', 'ASC']],
          include: [{
            model: SupplementGroup,
            as: 'supplementGroups',
            include: [{ model: SupplementOption, as: 'options' }],
          }],
        }],
      }],
    });
    if (!menu) return res.status(404).json({ error: true, message: 'not_found' });
    return res.json({ data: menu, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.updateMenu = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menu = await Menu.findOne({ where: { id: req.params.id, restaurant_id } });
    if (!menu) return res.status(404).json({ error: true, message: 'not_found' });
    const { name, is_active } = req.body;
    await menu.update({
      name: name !== undefined ? name : menu.name,
      is_active: is_active !== undefined ? is_active : menu.is_active,
    });
    return res.json({ data: menu, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteMenu = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menu = await Menu.findOne({ where: { id: req.params.id, restaurant_id } });
    if (!menu) return res.status(404).json({ error: true, message: 'not_found' });
    await menu.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Categories ───────────────────────────────────────────────────────────────

exports.getCategories = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menu = await Menu.findOne({ where: { id: req.params.menuId, restaurant_id } });
    if (!menu) return res.status(404).json({ error: true, message: 'menu_not_found' });
    const categories = await Category.findAll({
      where: { menu_id: menu.id },
      include: [{
        model: MenuItem,
        as: 'items',
        attributes: [
          'id', 'name_fr', 'name_en', 'name_it', 'name_ar',
          'description_fr', 'description_en', 'description_it', 'description_ar',
          'price', 'price_night', 'price_happy_hour', 'happy_hour_start', 'happy_hour_end',
          'is_available', 'is_featured', 'image_url', 'prep_time_min',
          'disable_at', 'enable_at', 'sort_order',
          'promo_price', 'promo_label', 'promo_start', 'promo_end',
        ],
        order: [['sort_order', 'ASC']],
      }],
      order: [['sort_order', 'ASC']],
    });
    return res.json({ data: categories, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const menu = await Menu.findOne({ where: { id: req.params.menuId, restaurant_id } });
    if (!menu) return res.status(404).json({ error: true, message: 'menu_not_found' });
    const { name_fr, name_en, name_it, name_ar, icon } = req.body;
    if (!name_fr?.trim()) return res.status(422).json({ error: true, message: 'name_fr_required' });
    const count = await Category.count({ where: { menu_id: menu.id } });
    const category = await Category.create({
      menu_id: menu.id, name_fr: name_fr.trim(), name_en, name_it, name_ar, icon, sort_order: count,
    });
    return res.status(201).json({ data: { ...category.toJSON(), items: [] }, message: 'created' });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await verifyCategoryOwnership(req.params.id, restaurant_id);
    if (!category) return res.status(404).json({ error: true, message: 'not_found' });
    const allowed = ['name_fr', 'name_en', 'name_it', 'name_ar', 'icon', 'is_active', 'sort_order'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await category.update(updates);
    return res.json({ data: category, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await verifyCategoryOwnership(req.params.id, restaurant_id);
    if (!category) return res.status(404).json({ error: true, message: 'not_found' });
    await category.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    next(err);
  }
};

exports.reorderCategories = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const restaurant_id = req.user.restaurant_id;
    const { items } = req.body; // [{ id, sort_order }]
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(422).json({ error: true, message: 'invalid_payload' });
    }
    const ids = items.map((i) => i.id);
    const categories = await Category.findAll({
      where: { id: { [Op.in]: ids } },
      include: [{ model: Menu, as: 'menu', where: { restaurant_id }, required: true }],
    });
    const validSet = new Set(categories.map((c) => c.id));
    for (const { id, sort_order } of items) {
      if (validSet.has(id)) {
        await Category.update({ sort_order }, { where: { id }, transaction: t });
      }
    }
    await t.commit();
    return res.json({ data: null, message: 'reordered' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── Menu Items ───────────────────────────────────────────────────────────────

exports.getItems = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await verifyCategoryOwnership(req.params.id, restaurant_id);
    if (!category) return res.status(404).json({ error: true, message: 'not_found' });
    const items = await MenuItem.findAll({
      where: { category_id: category.id },
      include: [
        { model: SupplementGroup, as: 'supplementGroups', include: [{ model: SupplementOption, as: 'options' }] },
        { model: MenuItemVariant, as: 'variants', separate: true, order: [['sort_order', 'ASC']] },
      ],
      order: [['sort_order', 'ASC']],
    });
    return res.json({ data: items, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await verifyCategoryOwnership(req.params.id, restaurant_id);
    if (!category) return res.status(404).json({ error: true, message: 'category_not_found' });
    const {
      name_fr, name_en, name_it, name_ar,
      description_fr, description_en, description_it, description_ar,
      price, price_night, price_happy_hour, happy_hour_start, happy_hour_end,
      is_available, is_featured, prep_time_min, disable_at, enable_at, image_url,
      promo_price, promo_label, promo_start, promo_end,
    } = req.body;
    if (!name_fr?.trim()) return res.status(422).json({ error: true, message: 'name_fr_required' });
    if (price === undefined || price === null) return res.status(422).json({ error: true, message: 'price_required' });
    const count = await MenuItem.count({ where: { category_id: category.id } });
    const item = await MenuItem.create({
      category_id: category.id,
      name_fr: name_fr.trim(), name_en, name_it, name_ar,
      description_fr, description_en, description_it, description_ar,
      price, price_night: price_night || null, price_happy_hour: price_happy_hour || null,
      happy_hour_start: happy_hour_start || null, happy_hour_end: happy_hour_end || null,
      is_available: is_available ?? true,
      is_featured: is_featured ?? false,
      prep_time_min: prep_time_min || null,
      disable_at: disable_at || null, enable_at: enable_at || null,
      image_url: image_url || null,
      promo_price: promo_price || null, promo_label: promo_label || null,
      promo_start: promo_start || null, promo_end: promo_end || null,
      sort_order: count,
    });
    return res.status(201).json({ data: item, message: 'created' });
  } catch (err) {
    next(err);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const full = await MenuItem.findByPk(item.id, {
      include: [
        { model: SupplementGroup, as: 'supplementGroups', include: [{ model: SupplementOption, as: 'options' }] },
        { model: MenuItemVariant, as: 'variants', separate: true, order: [['sort_order', 'ASC']] },
      ],
    });
    return res.json({ data: full, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const allowed = [
      'name_fr', 'name_en', 'name_it', 'name_ar',
      'description_fr', 'description_en', 'description_it', 'description_ar',
      'price', 'price_night', 'price_happy_hour', 'happy_hour_start', 'happy_hour_end',
      'is_available', 'is_featured', 'prep_time_min', 'disable_at', 'enable_at',
      'sort_order', 'category_id', 'image_url',
      'promo_price', 'promo_label', 'promo_start', 'promo_end',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await item.update(updates);
    return res.json({ data: item, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    await item.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleItemAvailability = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    await item.update({ is_available: !item.is_available });
    req.io.to(`restaurant:${restaurant_id}`).emit('menu:item_toggled', {
      item_id: item.id,
      is_available: item.is_available,
    });
    return res.json({ data: { id: item.id, is_available: item.is_available }, message: 'toggled' });
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { ids, is_available } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(422).json({ error: true, message: 'ids_required' });
    }
    const items = await MenuItem.findAll({
      where: { id: { [Op.in]: ids } },
      include: [{
        model: Category,
        as: 'category',
        required: true,
        include: [{ model: Menu, as: 'menu', where: { restaurant_id }, required: true }],
      }],
    });
    const validIds = items.map((i) => i.id);
    if (validIds.length > 0) {
      await MenuItem.update({ is_available }, { where: { id: { [Op.in]: validIds } } });
      req.io.to(`restaurant:${restaurant_id}`).emit('menu:bulk_toggled', { ids: validIds, is_available });
    }
    return res.json({ data: { updated: validIds.length }, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.reorderItems = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const restaurant_id = req.user.restaurant_id;
    const { items } = req.body; // [{ id, sort_order, category_id? }]
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(422).json({ error: true, message: 'invalid_payload' });
    }
    const ids = items.map((i) => i.id);
    const dbItems = await MenuItem.findAll({
      where: { id: { [Op.in]: ids } },
      include: [{
        model: Category,
        as: 'category',
        required: true,
        include: [{ model: Menu, as: 'menu', where: { restaurant_id }, required: true }],
      }],
    });
    const validSet = new Set(dbItems.map((i) => i.id));
    for (const { id, sort_order, category_id } of items) {
      if (validSet.has(id)) {
        const upd = { sort_order };
        if (category_id) upd.category_id = category_id;
        await MenuItem.update(upd, { where: { id }, transaction: t });
      }
    }
    await t.commit();
    return res.json({ data: null, message: 'reordered' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.uploadItemImage = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    if (!req.file) return res.status(422).json({ error: true, message: 'no_file' });
    const result = await uploadImage(req.file, 'menuqr/items', item.id);
    if (!result?.secure_url) return res.status(500).json({ error: true, message: 'upload_failed' });
    await item.update({ image_url: result.secure_url });
    return res.json({ data: { image_url: result.secure_url }, message: 'uploaded' });
  } catch (err) {
    next(err);
  }
};

exports.uploadTempImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(422).json({ error: true, message: 'no_file' });
    const tempId = `temp_${Date.now()}`;
    const result = await uploadImage(req.file, 'menuqr/items', tempId);
    if (!result?.secure_url) return res.status(500).json({ error: true, message: 'upload_failed' });
    return res.json({ data: { image_url: result.secure_url }, message: 'uploaded' });
  } catch (err) {
    next(err);
  }
};

// ─── Supplement Groups ────────────────────────────────────────────────────────

exports.getSupplementGroups = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const groups = await SupplementGroup.findAll({
      where: { menu_item_id: item.id },
      include: [{ model: SupplementOption, as: 'options' }],
    });
    return res.json({ data: groups, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.createSupplementGroup = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const { name_fr, name_en, name_it, name_ar, type, min_select, max_select, is_required } = req.body;
    if (!name_fr?.trim()) return res.status(422).json({ error: true, message: 'name_fr_required' });
    const group = await SupplementGroup.create({
      menu_item_id: item.id,
      name_fr: name_fr.trim(), name_en, name_it, name_ar,
      type: type || 'radio',
      min_select: min_select ?? 0,
      max_select: max_select ?? 1,
      is_required: is_required ?? false,
    });
    return res.status(201).json({ data: { ...group.toJSON(), options: [] }, message: 'created' });
  } catch (err) {
    next(err);
  }
};

exports.updateSupplementGroup = async (req, res, next) => {
  try {
    const group = await SupplementGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: true, message: 'not_found' });
    const allowed = ['name_fr', 'name_en', 'name_it', 'name_ar', 'type', 'min_select', 'max_select', 'is_required'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await group.update(updates);
    return res.json({ data: group, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplementGroup = async (req, res, next) => {
  try {
    const group = await SupplementGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: true, message: 'not_found' });
    await group.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Supplement Options ───────────────────────────────────────────────────────

exports.getSupplementOptions = async (req, res, next) => {
  try {
    const options = await SupplementOption.findAll({ where: { group_id: req.params.id } });
    return res.json({ data: options, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.createSupplementOption = async (req, res, next) => {
  try {
    const group = await SupplementGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: true, message: 'group_not_found' });
    const { name_fr, name_en, name_it, name_ar, extra_price, is_available } = req.body;
    if (!name_fr?.trim()) return res.status(422).json({ error: true, message: 'name_fr_required' });
    const option = await SupplementOption.create({
      group_id: group.id,
      name_fr: name_fr.trim(), name_en, name_it, name_ar,
      extra_price: extra_price ?? 0.000,
      is_available: is_available ?? true,
    });
    return res.status(201).json({ data: option, message: 'created' });
  } catch (err) {
    next(err);
  }
};

exports.updateSupplementOption = async (req, res, next) => {
  try {
    const option = await SupplementOption.findByPk(req.params.id);
    if (!option) return res.status(404).json({ error: true, message: 'not_found' });
    const allowed = ['name_fr', 'name_en', 'name_it', 'name_ar', 'extra_price', 'is_available'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await option.update(updates);
    return res.json({ data: option, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplementOption = async (req, res, next) => {
  try {
    const option = await SupplementOption.findByPk(req.params.id);
    if (!option) return res.status(404).json({ error: true, message: 'not_found' });
    await option.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Item Variants ────────────────────────────────────────────────────────────

exports.getVariants = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const variants = await MenuItemVariant.findAll({
      where: { menu_item_id: item.id },
      order: [['sort_order', 'ASC']],
    });
    return res.json({ data: variants, message: 'ok' });
  } catch (err) { next(err); }
};

exports.createVariant = async (req, res, next) => {
  try {
    const restaurant_id = req.user.restaurant_id;
    const item = await verifyItemOwnership(req.params.id, restaurant_id);
    if (!item) return res.status(404).json({ error: true, message: 'not_found' });
    const { label_fr, label_en, label_it, label_ar, price, is_available } = req.body;
    if (!label_fr?.trim()) return res.status(422).json({ error: true, message: 'label_fr_required' });
    if (price === undefined || price === null) return res.status(422).json({ error: true, message: 'price_required' });
    const count = await MenuItemVariant.count({ where: { menu_item_id: item.id } });
    const variant = await MenuItemVariant.create({
      menu_item_id: item.id,
      label_fr: label_fr.trim(), label_en: label_en || null, label_it: label_it || null, label_ar: label_ar || null,
      price: parseFloat(price) || 0,
      is_available: is_available ?? true,
      sort_order: count,
    });
    return res.status(201).json({ data: variant, message: 'created' });
  } catch (err) { next(err); }
};

exports.updateVariant = async (req, res, next) => {
  try {
    const variant = await MenuItemVariant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ error: true, message: 'not_found' });
    const allowed = ['label_fr', 'label_en', 'label_it', 'label_ar', 'price', 'is_available', 'sort_order'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (updates.label_fr !== undefined) updates.label_fr = String(updates.label_fr).trim();
    await variant.update(updates);
    return res.json({ data: variant, message: 'updated' });
  } catch (err) { next(err); }
};

exports.deleteVariant = async (req, res, next) => {
  try {
    const variant = await MenuItemVariant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ error: true, message: 'not_found' });
    await variant.destroy();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) { next(err); }
};
