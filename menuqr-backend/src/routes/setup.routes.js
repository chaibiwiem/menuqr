const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// GET /api/setup/check — vérifie si la plateforme a déjà un Super Admin
router.get('/check', async (req, res) => {
  try {
    const existing = await User.findOne({ where: { role: 'SUPER_ADMIN' } });
    return res.json({ needed: !existing });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// POST /api/setup/init — crée le premier Super Admin (bloqué si un existe déjà)
router.post('/init', async (req, res) => {
  try {
    const existing = await User.findOne({ where: { role: 'SUPER_ADMIN' } });
    if (existing) {
      return res.status(403).json({
        error: 'ALREADY_SETUP',
        message: 'La plateforme est déjà configurée.',
      });
    }

    const { name, email, username, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nom, email et mot de passe requis' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Mot de passe : 8 caractères min, 1 majuscule, 1 chiffre',
      });
    }

    const taken = await User.findOne({
      where: require('sequelize').Op
        ? { [require('sequelize').Op.or]: [{ email }, ...(username ? [{ username }] : [])] }
        : { email },
    });
    if (taken) {
      return res.status(409).json({ error: 'ALREADY_EXISTS', message: 'Email ou username déjà utilisé' });
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      username: username || null,
      password_hash: hash,
      role: 'SUPER_ADMIN',
      is_active: true,
      is_first_login: false,
    });

    return res.status(201).json({ message: 'Super Admin créé. Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
