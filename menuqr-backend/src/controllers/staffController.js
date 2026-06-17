const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');

const STAFF_ROLES = ['MANAGER', 'STAFF', 'CASHIER'];

// ─── GET /api/staff ───────────────────────────────────────────────────────────
exports.getStaff = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const members = await User.findAll({
      where: { restaurant_id, role: STAFF_ROLES },
      attributes: ['id', 'name', 'username', 'email', 'role', 'is_active', 'is_first_login', 'last_login_at', 'created_at'],
      order: [['role', 'ASC'], ['name', 'ASC']],
    });
    res.json({ data: members });
  } catch (err) { next(err); }
};

// ─── POST /api/staff ──────────────────────────────────────────────────────────
exports.createStaff = async (req, res, next) => {
  try {
    const { restaurant_id, id: created_by } = req.user;
    const { name, username, email, role, phone } = req.body;

    if (!restaurant_id) {
      return res.status(422).json({ error: 'NO_RESTAURANT', message: 'Votre compte n\'est pas lié à un restaurant.' });
    }
    if (!name?.trim() || !username?.trim() || !email?.trim() || !role) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Champs requis manquants' });
    }
    if (!STAFF_ROLES.includes(role)) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Rôle invalide' });
    }

    // Check for duplicate email or username
    const existing = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: email.trim().toLowerCase() },
          { username: username.trim().toLowerCase() },
        ],
      },
    });
    if (existing) {
      const field = existing.email === email.trim().toLowerCase() ? 'email' : "nom d'utilisateur";
      return res.status(422).json({
        error: 'DUPLICATE_USER',
        message: `Cet ${field} est déjà utilisé. Choisissez-en un autre.`,
      });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 12);

    const member = await User.create({
      restaurant_id,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password_hash: hashed,
      role,
      phone: phone?.trim() || null,
      is_active: true,
      is_first_login: true,
      created_by,
    });


    res.status(201).json({
      data: {
        id: member.id,
        name: member.name,
        username: member.username,
        email: member.email,
        role: member.role,
        is_active: member.is_active,
        temp_password: tempPassword,
      },
    });
  } catch (err) { next(err); }
};

// ─── PUT /api/staff/:id ───────────────────────────────────────────────────────
exports.updateStaff = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;
    const { name, role, phone, is_active } = req.body;

    const member = await User.findOne({ where: { id, restaurant_id, role: STAFF_ROLES } });
    if (!member) return res.status(404).json({ error: 'NOT_FOUND', message: 'Membre introuvable' });

    if (role && !STAFF_ROLES.includes(role)) {
      return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Rôle invalide' });
    }

    await member.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(role !== undefined && { role }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(is_active !== undefined && { is_active }),
    });

    res.json({
      data: {
        id: member.id,
        name: member.name,
        username: member.username,
        email: member.email,
        role: member.role,
        is_active: member.is_active,
      },
    });
  } catch (err) { next(err); }
};

// ─── POST /api/staff/:id/reset-password ──────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const member = await User.findOne({ where: { id, restaurant_id, role: STAFF_ROLES } });
    if (!member) return res.status(404).json({ error: 'NOT_FOUND', message: 'Membre introuvable' });

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 12);

    await member.update({ password_hash: hashed, is_first_login: true });


    res.json({ data: { temp_password: tempPassword }, message: 'Mot de passe réinitialisé' });
  } catch (err) { next(err); }
};

// ─── DELETE /api/staff/:id ────────────────────────────────────────────────────
exports.deleteStaff = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const member = await User.findOne({ where: { id, restaurant_id, role: STAFF_ROLES } });
    if (!member) return res.status(404).json({ error: 'NOT_FOUND', message: 'Membre introuvable' });

    await member.update({ is_active: false });
    res.json({ data: null, message: 'Membre désactivé' });
  } catch (err) { next(err); }
};
