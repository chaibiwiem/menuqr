const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const slugify = require('slugify');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User, Restaurant, RestaurantHoraire, Subscription, AdminLog, Invoice, Table, QRScan, Plan } = require('../models');
const { uploadImage } = require('../config/cloudinary');
const emailService = require('../services/emailService');
const pdfService = require('../services/pdfService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uniqueSlug(base) {
  let slug = slugify(base, { lower: true, strict: true });
  let counter = 1;
  while (await Restaurant.findOne({ where: { slug } })) {
    slug = `${slugify(base, { lower: true, strict: true })}-${counter++}`;
  }
  return slug;
}

function calcEndsAt(plan, billingPeriod, startsAt, trialDays) {
  const d = new Date(startsAt || Date.now());
  if (trialDays) {
    d.setDate(d.getDate() + parseInt(trialDays));
  } else if (billingPeriod === 'ANNUAL') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().split('T')[0];
}

// ─── Stats ────────────────────────────────────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const [total, active, planRows, expiredSubs, pendingLogin] = await Promise.all([
      Restaurant.count(),
      Restaurant.count({ where: { is_active: true } }),
      Restaurant.findAll({
        attributes: ['plan', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['plan'],
        raw: true,
      }),
      Subscription.count({ where: { status: { [Op.in]: ['EXPIRED', 'SUSPENDED'] } } }),
      User.count({ where: { is_first_login: true, role: 'OWNER' } }),
    ]);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = await Restaurant.count({
      where: { created_at: { [Op.gte]: thisMonth } },
    });

    // Construire byPlan en objet { FREE: n, STARTER: n, PRO: n, PREMIUM: n }
    const byPlan = { FREE: 0, STARTER: 0, PRO: 0, PREMIUM: 0 };
    planRows.forEach((r) => { byPlan[r.plan] = parseInt(r.count); });

    // Croissance 12 derniers mois (simplifié: total cumulé par mois)
    const growthLast12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (11 - i));
      return { month: d.getMonth() + 1, year: d.getFullYear(), total: 0, new: 0 };
    });

    return res.json({
      data: { total, active, byPlan, newThisMonth, expiredSubs, pendingLogin, growthLast12Months },
      message: 'ok',
    });
  } catch (err) {
    next(err);
  }
};

// ─── List restaurants ─────────────────────────────────────────────────────────

exports.getRestaurants = async (req, res, next) => {
  try {
    const { plan, status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (plan) where.plan = plan;
    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Restaurant.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'username', 'last_login_at', 'is_first_login'] },
        { model: Subscription, as: 'subscription', required: false },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    return res.json({
      data: { restaurants: rows, total: count, totalPages: Math.ceil(count / limit) },
      message: 'ok',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get single restaurant ────────────────────────────────────────────────────

exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: { exclude: ['password_hash', 'two_fa_secret'] } },
        { model: Subscription, as: 'subscription' },
        { model: RestaurantHoraire, as: 'horaires', order: [['day_of_week', 'ASC']] },
        { model: User, as: 'staff', attributes: ['id', 'name', 'role', 'is_active'], where: { role: { [Op.ne]: 'OWNER' } }, required: false },
      ],
    });
    if (!restaurant) return res.status(404).json({ error: true, message: 'not_found' });
    return res.json({ data: restaurant, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

// ─── Create restaurant ────────────────────────────────────────────────────────

exports.createRestaurant = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      // Plan & subscription
      plan, billing_period, trial_enabled, trial_days,
      starts_at, amount, payment_ref, admin_notes,
      // Restaurant info
      name, type, email, phone, address, short_description, template_id,
      // Social
      social_facebook, social_instagram, social_tripadvisor,
      social_google_maps, social_website, social_whatsapp,
      // Fiscal
      fiscal_matricule, fiscal_company, fiscal_address,
      // Horaires (JSON string)
      horaires,
      // Owner
      owner_name, owner_username, owner_email, owner_phone,
      owner_password,
      ui_language,
    } = req.body;

    // Validation des champs requis
    const missing = [];
    if (!name?.trim()) missing.push('name');
    if (!owner_name?.trim()) missing.push('owner_name');
    if (!owner_username?.trim()) missing.push('owner_username');
    if (!owner_email?.trim()) missing.push('owner_email');
    if (missing.length > 0) {
      await t.rollback();
      return res.status(422).json({
        error: true,
        message: 'missing_required_fields',
        fields: missing,
      });
    }

    // Vérif unicité slug et username avant transaction lourde
    const slugToUse = req.body.slug?.trim() || await uniqueSlug(name);
    const [slugExists, usernameExists, emailExists] = await Promise.all([
      Restaurant.findOne({ where: { slug: slugToUse } }),
      User.findOne({ where: { username: owner_username } }),
      User.findOne({ where: { email: owner_email } }),
    ]);
    if (slugExists) {
      await t.rollback();
      return res.status(409).json({ error: true, message: 'slug_taken', field: 'slug' });
    }
    if (usernameExists) {
      await t.rollback();
      return res.status(409).json({ error: true, message: 'username_taken', field: 'owner_username' });
    }
    if (emailExists) {
      await t.rollback();
      return res.status(409).json({ error: true, message: 'email_taken', field: 'owner_email' });
    }

    // 1. Slug : utiliser celui validé
    const slug = slugToUse;

    // 2. Restaurant
    const restaurant = await Restaurant.create({
      name, slug, type, email, phone, address,
      short_description, template_id: template_id || 'classic_theme',
      plan: plan || 'FREE',
      social_facebook, social_instagram, social_tripadvisor,
      social_google_maps, social_website, social_whatsapp,
      fiscal_matricule, fiscal_company, fiscal_address,
      created_by: req.user.id,
      is_active: true,
    }, { transaction: t });

    // 3. Images — Cloudinary si configuré, sinon stockage local
    if (req.files?.logo?.[0]) {
      const result = await uploadImage(req.files.logo[0], `menuqr/${slug}`, 'logo');
      if (result?.secure_url) {
        await restaurant.update({ logo_url: result.secure_url }, { transaction: t });
      }
    }
    if (req.files?.banner?.[0]) {
      const result = await uploadImage(req.files.banner[0], `menuqr/${slug}`, 'banner');
      if (result?.secure_url) {
        await restaurant.update({ banner_url: result.secure_url }, { transaction: t });
      }
    }

    // 4. Horaires
    if (horaires) {
      const h = typeof horaires === 'string' ? JSON.parse(horaires) : horaires;
      await RestaurantHoraire.bulkCreate(
        h.map((day) => ({ ...day, restaurant_id: restaurant.id })),
        { transaction: t }
      );
    }

    // 5. Mot de passe owner — utiliser celui envoyé par le frontend
    const tempPassword = owner_password && owner_password.length >= 6
      ? owner_password
      : crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // 6. User owner
    const owner = await User.create({
      name: owner_name,
      username: owner_username,
      email: owner_email,
      phone: owner_phone,
      password_hash: passwordHash,
      role: 'OWNER',
      restaurant_id: restaurant.id,
      is_first_login: true,
      language: ui_language || 'fr',
      created_by: req.user.id,
    }, { transaction: t });

    // 7. Lier owner au restaurant
    await restaurant.update({ owner_id: owner.id, activated_at: new Date() }, { transaction: t });

    // 8. Subscription
    const trialEndsAt = trial_enabled
      ? new Date(Date.now() + parseInt(trial_days || 14) * 86400000).toISOString().split('T')[0]
      : null;

    const subscription = await Subscription.create({
      restaurant_id: restaurant.id,
      plan: plan || 'FREE',
      billing_period: billing_period || 'MONTHLY',
      status: trial_enabled ? 'TRIAL' : 'ACTIVE',
      starts_at: starts_at || new Date().toISOString().split('T')[0],
      ends_at: calcEndsAt(plan, billing_period, starts_at, trial_enabled ? trial_days : null),
      trial_ends_at: trialEndsAt,
      amount: amount || 0,
      currency: 'DT',
      payment_ref,
      admin_notes,
    }, { transaction: t });

    // 9. Log
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'CREATE_RESTAURANT',
      target_type: 'restaurant',
      target_id: restaurant.id,
      details: { name, plan, owner_email },
    }, { transaction: t });

    await t.commit();

    // 10. Email (hors transaction)
    try {
      await emailService.sendWelcomeOwner({
        to: owner_email,
        name: owner_name,
        username: owner_username,
        tempPassword,
        restaurantName: name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        language: ui_language || 'fr',
      });
    } catch (emailErr) {
      console.error('[EMAIL] sendWelcomeOwner failed:', emailErr.message);
    }

    return res.status(201).json({
      data: {
        restaurant: { id: restaurant.id, name, slug },
        owner: { id: owner.id, username: owner_username, email: owner_email },
        subscription: { id: subscription.id, plan, status: subscription.status },
      },
      message: 'restaurant_created',
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── Update restaurant ────────────────────────────────────────────────────────

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: true, message: 'not_found' });

    const allowed = [
      'name', 'type', 'email', 'phone', 'address', 'short_description', 'template_id',
      'social_facebook', 'social_instagram', 'social_tripadvisor',
      'social_google_maps', 'social_website', 'social_whatsapp',
      'fiscal_matricule', 'fiscal_company', 'fiscal_address', 'plan',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (req.files?.logo?.[0]) {
      const result = await uploadImage(req.files.logo[0], `menuqr/${restaurant.slug}`, 'logo');
      if (result?.secure_url) updates.logo_url = result.secure_url;
    }
    if (req.files?.banner?.[0]) {
      const result = await uploadImage(req.files.banner[0], `menuqr/${restaurant.slug}`, 'banner');
      if (result?.secure_url) updates.banner_url = result.secure_url;
    }

    await restaurant.update(updates);

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'UPDATE_RESTAURANT',
      target_type: 'restaurant',
      target_id: restaurant.id,
      details: updates,
    });

    return res.json({ data: restaurant, message: 'updated' });
  } catch (err) {
    next(err);
  }
};

// ─── Toggle active ────────────────────────────────────────────────────────────

exports.toggleRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: true, message: 'not_found' });
    await restaurant.update({ is_active: !restaurant.is_active });
    await AdminLog.create({
      admin_id: req.user.id,
      action: restaurant.is_active ? 'ACTIVATE_RESTAURANT' : 'DEACTIVATE_RESTAURANT',
      target_type: 'restaurant',
      target_id: restaurant.id,
    });
    return res.json({ data: { is_active: restaurant.is_active }, message: 'toggled' });
  } catch (err) {
    next(err);
  }
};

// ─── Delete restaurant ────────────────────────────────────────────────────────

exports.deleteRestaurant = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) { await t.rollback(); return res.status(404).json({ error: true, message: 'not_found' }); }

    await User.update({ is_active: false }, { where: { restaurant_id: restaurant.id }, transaction: t });
    await AdminLog.create({
      admin_id: req.user.id, action: 'DELETE_RESTAURANT',
      target_type: 'restaurant', target_id: restaurant.id,
      details: { name: restaurant.name },
    }, { transaction: t });
    await restaurant.destroy({ transaction: t });
    await t.commit();
    return res.json({ data: null, message: 'deleted' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── Reset owner password ─────────────────────────────────────────────────────

exports.resetOwnerPassword = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner' }],
    });
    if (!restaurant?.owner) return res.status(404).json({ error: true, message: 'not_found' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 12);
    await restaurant.owner.update({ password_hash: hash, is_first_login: true });

    try {
      await emailService.sendWelcomeOwner({
        to: restaurant.owner.email,
        name: restaurant.owner.name,
        username: restaurant.owner.username,
        tempPassword,
        restaurantName: restaurant.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        language: restaurant.owner.language || 'fr',
      });
    } catch {}

    await AdminLog.create({
      admin_id: req.user.id, action: 'RESET_OWNER_PASSWORD',
      target_type: 'user', target_id: restaurant.owner.id,
    });

    return res.json({ data: null, message: 'password_reset' });
  } catch (err) {
    next(err);
  }
};

// ─── Check username availability ──────────────────────────────────────────────

exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) return res.json({ data: { available: false }, message: 'ok' });
    const exists = await User.findOne({ where: { username } });
    return res.json({ data: { available: !exists }, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

// ─── Check slug availability ──────────────────────────────────────────────────

exports.checkSlug = async (req, res, next) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.json({ data: { available: false }, message: 'ok' });
    const exists = await Restaurant.findOne({ where: { slug } });
    return res.json({ data: { available: !exists }, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING — Abonnements & Factures
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/admin/subscriptions ────────────────────────────────────────────

exports.getSubscriptions = async (req, res, next) => {
  try {
    const { plan, status, search, page = 1 } = req.query;
    const limit  = 25;
    const offset = (Math.max(1, parseInt(page)) - 1) * limit;

    const where = {};
    if (plan)   where.plan   = plan;
    if (status) where.status = status;

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'slug', 'is_active'],
        where: search
          ? { name: { [Op.like]: `%${search}%` } }
          : undefined,
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      }],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ data: rows, meta: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/subscriptions/:id ────────────────────────────────────────

exports.updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan, billing_period, status, starts_at, ends_at, trial_ends_at, amount, payment_ref, admin_notes } = req.body;

    const sub = await Subscription.findByPk(id);
    if (!sub) return res.status(404).json({ error: true, message: 'subscription_not_found' });

    const before = { plan: sub.plan, status: sub.status };

    await sub.update({
      ...(plan           !== undefined && { plan }),
      ...(billing_period !== undefined && { billing_period }),
      ...(status         !== undefined && { status }),
      ...(starts_at      !== undefined && { starts_at }),
      ...(ends_at        !== undefined && { ends_at }),
      ...(trial_ends_at  !== undefined && { trial_ends_at }),
      ...(amount         !== undefined && { amount }),
      ...(payment_ref    !== undefined && { payment_ref }),
      ...(admin_notes    !== undefined && { admin_notes }),
    });

    // Sync plan on Restaurant too if changed
    if (plan && plan !== before.plan) {
      await Restaurant.update({ plan }, { where: { id: sub.restaurant_id } });
    }

    await AdminLog.create({
      admin_id:    req.user.id,
      action:      'UPDATE_SUBSCRIPTION',
      target_type: 'subscription',
      target_id:   id,
      details:     { before, after: { plan: sub.plan, status: sub.status } },
    });

    res.json({ data: sub, message: 'subscription_updated' });
  } catch (err) { next(err); }
};

// ─── GET /api/admin/invoices ──────────────────────────────────────────────────

exports.getAdminInvoices = async (req, res, next) => {
  try {
    const { status, restaurant_id, page = 1 } = req.query;
    const limit  = 25;
    const offset = (Math.max(1, parseInt(page)) - 1) * limit;

    const where = {};
    if (status)        where.status        = status;
    if (restaurant_id) where.restaurant_id = restaurant_id;

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'slug'],
      }],
      order: [['issued_at', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ data: rows, meta: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (err) { next(err); }
};

// ─── POST /api/admin/invoices ─────────────────────────────────────────────────

async function nextInvoiceNumber() {
  const year  = new Date().getFullYear();
  const prefix = `FACTURE-${year}-`;
  const last = await Invoice.findOne({
    where: { invoice_number: { [Op.like]: `${prefix}%` } },
    order: [['invoice_number', 'DESC']],
    attributes: ['invoice_number'],
  });
  const seq = last ? parseInt(last.invoice_number.replace(prefix, '')) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

exports.createInvoice = async (req, res, next) => {
  try {
    const { restaurant_id, subscription_id, amount, status = 'PENDING', issued_at, due_at, currency = 'DT' } = req.body;

    if (!restaurant_id || !amount) {
      return res.status(422).json({ error: true, message: 'restaurant_id et amount requis' });
    }

    const restaurant = await Restaurant.findByPk(restaurant_id, { attributes: ['id', 'name'] });
    if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });

    const invoice_number = await nextInvoiceNumber();

    const invoice = await Invoice.create({
      restaurant_id,
      subscription_id: subscription_id || null,
      invoice_number,
      amount,
      currency,
      status,
      issued_at: issued_at || new Date().toISOString().split('T')[0],
      due_at:    due_at    || null,
    });

    await AdminLog.create({
      admin_id:    req.user.id,
      action:      'CREATE_INVOICE',
      target_type: 'invoice',
      target_id:   invoice.id,
      details:     { invoice_number, amount, restaurant_id },
    });

    res.status(201).json({ data: invoice, message: 'invoice_created' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/invoices/:id ──────────────────────────────────────────────

exports.updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, amount, issued_at, due_at, pdf_url, admin_notes } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ error: true, message: 'invoice_not_found' });

    await invoice.update({
      ...(status    !== undefined && { status }),
      ...(amount    !== undefined && { amount }),
      ...(issued_at !== undefined && { issued_at }),
      ...(due_at    !== undefined && { due_at }),
      ...(pdf_url   !== undefined && { pdf_url }),
    });

    res.json({ data: invoice, message: 'invoice_updated' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/admin/invoices/:id ──────────────────────────────────────────

exports.deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ error: true, message: 'invoice_not_found' });
    await invoice.destroy();
    res.json({ data: null, message: 'invoice_deleted' });
  } catch (err) { next(err); }
};

// ─── GET /api/admin/invoices/:id/download ────────────────────────────────────

exports.downloadAdminInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [{ model: Restaurant, attributes: ['name', 'address', 'phone', 'fiscal_matricule', 'fiscal_company', 'fiscal_address'] }],
    });
    if (!invoice) return res.status(404).json({ error: true, message: 'invoice_not_found' });

    const restaurant = invoice.Restaurant ? invoice.Restaurant.toJSON() : {};

    const subscription = invoice.subscription_id
      ? await Subscription.findByPk(invoice.subscription_id)
      : await Subscription.findOne({ where: { restaurant_id: invoice.restaurant_id }, order: [['created_at', 'DESC']] });

    const buffer = await pdfService.generateInvoice(
      invoice.toJSON(),
      restaurant,
      subscription ? subscription.toJSON() : {}
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice.invoice_number || String(id).slice(-8)}.pdf"`);
    res.send(buffer);
  } catch (err) { next(err); }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = { role: { [Op.ne]: 'SUPER_ADMIN' } };
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name:     { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { email:    { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'two_fa_secret'] },
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'slug', 'plan', 'is_active'],
        required: false,
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    res.json({ data: { users: rows, total: count, totalPages: Math.ceil(count / parseInt(limit)) }, message: 'ok' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/users/:id/toggle ─────────────────────────────────────────

exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: true, message: 'forbidden' });

    await user.update({ is_active: !user.is_active });

    await AdminLog.create({
      admin_id: req.user.id,
      action: user.is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      target_type: 'User',
      target_id: user.id,
      details: { name: user.name, role: user.role },
    });

    res.json({ data: { is_active: user.is_active }, message: user.is_active ? 'user_activated' : 'user_deactivated' });
  } catch (err) { next(err); }
};

// ─── POST /api/admin/users/:id/reset-password ─────────────────────────────────

exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: true, message: 'forbidden' });

    const plain = crypto.randomBytes(5).toString('hex');
    await user.update({ password_hash: await bcrypt.hash(plain, 10), is_first_login: true });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'USER_PASSWORD_RESET',
      target_type: 'User',
      target_id: user.id,
      details: { name: user.name },
    });

    res.json({ data: { temp_password: plain }, message: 'password_reset' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/users/:id/change-password ────────────────────────────────

exports.changeUserPassword = async (req, res, next) => {
  try {
    const { new_password, confirm_password } = req.body;

    if (!new_password || !confirm_password) {
      return res.status(400).json({ error: true, message: 'Nouveau mot de passe requis' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: true, message: 'Les mots de passe ne correspondent pas' });
    }
    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({ error: true, message: 'Minimum 8 caractères, 1 majuscule, 1 chiffre' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });
    if (user.role === 'SUPER_ADMIN' && user.id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'forbidden' });
    }

    await user.update({ password_hash: await bcrypt.hash(new_password, 12), is_first_login: false });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'USER_PASSWORD_CHANGED',
      target_type: 'User',
      target_id: user.id,
      details: { name: user.name, role: user.role },
    });

    res.json({ data: null, message: 'Mot de passe modifié avec succès' });
  } catch (err) { next(err); }
};

// ─── POST /api/admin/super-admins ────────────────────────────────────────────

exports.createSuperAdmin = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nom, email et mot de passe requis' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Mot de passe : 8 caractères min, 1 majuscule, 1 chiffre' });
    }

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, ...(username ? [{ username }] : [])] },
    });
    if (existing) {
      return res.status(409).json({ error: 'ALREADY_EXISTS', message: 'Email ou username déjà utilisé' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      username: username || null,
      password_hash: hash,
      role: 'SUPER_ADMIN',
      is_active: true,
      is_first_login: false,
    });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'CREATE_SUPER_ADMIN',
      target_type: 'User',
      target_id: user.id,
      details: { name, email },
    });

    return res.status(201).json({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: 'Super Admin créé avec succès',
    });
  } catch (err) { next(err); }
};

// ─── GET /api/admin/qr-tables ─────────────────────────────────────────────────

exports.getQRTables = async (req, res, next) => {
  try {
    const { restaurant_id, page = 1, limit = 100 } = req.query;
    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;

    const { count, rows } = await Table.findAndCountAll({
      where,
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name', 'slug'],
          required: true,
        },
      ],
      attributes: ['id', 'number', 'name', 'capacity', 'status', 'qr_url', 'qr_token', 'is_active', 'created_at', 'restaurant_id'],
      order: [['restaurant_id', 'ASC'], ['number', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    // Attach scan counts in a second query (avoid GROUP BY issues with include)
    const tableIds = rows.map((t) => t.id);
    let scanMap = {};
    if (tableIds.length > 0) {
      const scans = await QRScan.findAll({
        where: { table_id: { [Op.in]: tableIds } },
        attributes: ['table_id', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'scan_count']],
        group: ['table_id'],
        raw: true,
      });
      scans.forEach((s) => { scanMap[s.table_id] = parseInt(s.scan_count, 10) || 0; });
    }

    const data = rows.map((t) => ({
      ...t.toJSON(),
      scan_count: scanMap[t.id] || 0,
    }));

    return res.json({ data, total: count, message: 'ok' });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/users/:id/restaurant ────────────────────────────────────
// Fix a user whose restaurant_id is null or wrong

exports.fixUserRestaurant = async (req, res, next) => {
  try {
    const { restaurant_id } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: true, message: 'forbidden' });

    if (restaurant_id) {
      const restaurant = await Restaurant.findByPk(restaurant_id);
      if (!restaurant) return res.status(404).json({ error: true, message: 'restaurant_not_found' });
    }

    await user.update({ restaurant_id: restaurant_id || null });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'USER_RESTAURANT_FIXED',
      target_type: 'User',
      target_id: user.id,
      details: { name: user.name, role: user.role, restaurant_id },
    });

    res.json({ data: { id: user.id, restaurant_id: user.restaurant_id }, message: 'restaurant_fixed' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PROFILE & PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/admin/profile ───────────────────────────────────────────────────

exports.getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'username', 'role', 'created_at', 'last_login_at'],
    });
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });
    res.json({ data: user, message: 'ok' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/profile ───────────────────────────────────────────────────

exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });

    if (!name?.trim()) return res.status(422).json({ error: true, message: 'name_required' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (exists) return res.status(409).json({ error: true, message: 'email_taken' });
    }

    await user.update({ name: name.trim(), email: email?.trim() || user.email });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'UPDATE_ADMIN_PROFILE',
      target_type: 'User',
      target_id: user.id,
      details: { name, email },
    });

    res.json({ data: { id: user.id, name: user.name, email: user.email }, message: 'profile_updated' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/profile/password ─────────────────────────────────────────

exports.updateAdminPassword = async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(422).json({ error: true, message: 'all_fields_required' });
    }
    if (new_password !== confirm_password) {
      return res.status(422).json({ error: true, message: 'passwords_mismatch' });
    }
    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(422).json({ error: true, message: 'password_too_weak' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: true, message: 'user_not_found' });

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: true, message: 'current_password_wrong' });

    await user.update({ password_hash: await bcrypt.hash(new_password, 12) });

    await AdminLog.create({
      admin_id: req.user.id,
      action: 'ADMIN_PASSWORD_CHANGED',
      target_type: 'User',
      target_id: user.id,
    });

    res.json({ data: null, message: 'password_changed' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLANS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/admin/plans ─────────────────────────────────────────────────────

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({ order: [['name', 'ASC']] });

    // If table is empty, seed defaults
    if (plans.length === 0) {
      const defaults = [
        { name: 'FREE',    price_monthly: 0,       price_annual: 0,        max_menus: 1,  max_tables: 5,  max_staff: 2  },
        { name: 'STARTER', price_monthly: 29.000,  price_annual: 290.000,  max_menus: 10, max_tables: 20, max_staff: 5  },
        { name: 'PRO',     price_monthly: 59.000,  price_annual: 590.000,  max_menus: 0,  max_tables: 0,  max_staff: 15 },
        { name: 'PREMIUM', price_monthly: 99.000,  price_annual: 990.000,  max_menus: 0,  max_tables: 0,  max_staff: 0  },
      ];
      const created = await Plan.bulkCreate(defaults);
      return res.json({ data: created, message: 'ok' });
    }

    res.json({ data: plans, message: 'ok' });
  } catch (err) { next(err); }
};

// ─── PUT /api/admin/plans/:name ───────────────────────────────────────────────

exports.updatePlan = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { price_monthly, price_annual, max_menus, max_tables, max_staff } = req.body;

    let plan = await Plan.findOne({ where: { name } });
    if (!plan) {
      plan = await Plan.create({ name, price_monthly: 0, price_annual: 0, max_menus: 0, max_tables: 0, max_staff: 0 });
    }

    await plan.update({
      ...(price_monthly !== undefined && { price_monthly: parseFloat(price_monthly) || 0 }),
      ...(price_annual  !== undefined && { price_annual:  parseFloat(price_annual)  || 0 }),
      ...(max_menus     !== undefined && { max_menus:     parseInt(max_menus)        || 0 }),
      ...(max_tables    !== undefined && { max_tables:    parseInt(max_tables)       || 0 }),
      ...(max_staff     !== undefined && { max_staff:     parseInt(max_staff)        || 0 }),
    });

    await AdminLog.create({
      admin_id:    req.user.id,
      action:      'UPDATE_PLAN',
      target_type: 'plan',
      target_id:   plan.id,
      details:     { name, price_monthly, price_annual },
    });

    res.json({ data: plan, message: 'plan_updated' });
  } catch (err) { next(err); }
};

