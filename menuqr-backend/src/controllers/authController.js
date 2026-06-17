const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Restaurant } = require('../models');
const emailService = require('../services/emailService');

exports.login = async (req, res) => {
  try {
    const { identifier, password, remember_me } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Identifiant et mot de passe requis',
      });
    }

    const user = await User.findOne({
      where: {
        [Op.and]: [
          { [Op.or]: [{ email: identifier }, { username: identifier }] },
          { is_active: true },
        ],
      },
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['slug', 'name'], required: false }],
    });

    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Identifiants invalides',
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Identifiants invalides',
      });
    }

    await user.update({ last_login_at: new Date() });

    const expiresIn = remember_me
      ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
      : process.env.JWT_EXPIRES_IN || '30d';

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        restaurant_id: user.restaurant_id,
        is_first_login: user.is_first_login,
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    return res.json({
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          restaurant_id: user.restaurant_id,
          restaurant_slug: user.restaurant?.slug || null,
          restaurant_name: user.restaurant?.name || null,
          is_first_login: user.is_first_login,
          language: user.language,
        },
      },
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('[authController.login]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const NEUTRAL = { message: 'Si un compte existe avec cet identifiant, vous recevrez un email.' };

  try {
    const { identifier } = req.body;
    if (!identifier) return res.json(NEUTRAL);

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
        is_active: true,
      },
    });

    if (user) {
      const resetToken = jwt.sign(
        { id: user.id, purpose: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      await emailService.sendPasswordReset(user.email, user.name, resetToken, user.language);
    }

    return res.json(NEUTRAL);
  } catch (error) {
    console.error('[authController.forgotPassword]', error);
    return res.json(NEUTRAL);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Tous les champs sont requis',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Lien invalide ou expiré',
      });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Lien invalide ou expiré',
      });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'PASSWORD_MISMATCH',
        message: 'Les mots de passe ne correspondent pas',
      });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Compte introuvable' });
    }

    const hash = await bcrypt.hash(password, 12);
    await user.update({ password_hash: hash, is_first_login: false });

    return res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('[authController.resetPassword]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!new_password || !confirm_password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Nouveau mot de passe requis',
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Compte introuvable' });
    }

    // On first login, skip current password check (staff don't know their temp password)
    if (!user.is_first_login) {
      if (!current_password) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Mot de passe actuel requis',
        });
      }
      const isValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Mot de passe actuel incorrect',
        });
      }
    }

    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre',
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        error: 'PASSWORD_MISMATCH',
        message: 'Les mots de passe ne correspondent pas',
      });
    }

    const hash = await bcrypt.hash(new_password, 12);
    await user.update({ password_hash: hash, is_first_login: false });

    return res.json({ message: 'Mot de passe changé. Bienvenue !' });
  } catch (error) {
    console.error('[authController.changePassword]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'two_fa_secret', 'login_attempts', 'locked_until'] },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'slug', 'name', 'logo_url'],
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Compte introuvable' });
    }

    return res.json({ data: user, message: 'OK' });
  } catch (error) {
    console.error('[authController.me]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};
