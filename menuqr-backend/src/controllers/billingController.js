const { Subscription, Invoice, Restaurant } = require('../models');
const pdfService = require('../services/pdfService');

const PLAN_FEATURES = {
  FREE: [
    '1 menu digital',
    '2 templates',
    '5 tables max',
    '2 comptes staff',
  ],
  STARTER: [
    'Menus illimités',
    '6 templates',
    '20 tables max',
    '5 comptes staff',
    'Call Waiter',
    'Notifications email',
    'Sous-domaine personnalisé',
  ],
  PRO: [
    'Menus illimités',
    '6 templates',
    'Tables illimitées',
    '15 comptes staff',
    'Call Waiter',
    'Réservations',
    'Notifications SMS',
    'Analytics complets',
    'Export CSV',
    'Sous-domaine personnalisé',
  ],
  PREMIUM: [
    'Menus illimités',
    '6 templates',
    'Tables illimitées',
    'Staff illimité',
    'Call Waiter',
    'Réservations',
    'Notifications SMS',
    'Analytics complets',
    'Export CSV',
    'POS & Caisse',
    'Sous-domaine personnalisé',
  ],
};

// ─── GET /api/billing/plan ────────────────────────────────────────────────────

exports.getCurrentPlan = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;

    const subscription = await Subscription.findOne({ where: { restaurant_id } });
    if (!subscription) {
      return res.status(404).json({ error: true, message: 'subscription_not_found' });
    }

    const features = PLAN_FEATURES[subscription.plan] || [];

    res.json({ data: { subscription, features } });
  } catch (err) { next(err); }
};

// ─── GET /api/billing/invoices ────────────────────────────────────────────────

exports.getInvoices = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const page   = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit  = 20;
    const offset = (page - 1) * limit;

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where: { restaurant_id },
      order: [['issued_at', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: invoices,
      meta: { total: count, page, pages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/billing/invoices/:id/download ───────────────────────────────────

exports.downloadInvoice = async (req, res, next) => {
  try {
    const { restaurant_id } = req.user;
    const { id } = req.params;

    const invoice = await Invoice.findOne({ where: { id, restaurant_id } });
    if (!invoice) return res.status(404).json({ error: true, message: 'invoice_not_found' });

    if (invoice.pdf_url) return res.redirect(invoice.pdf_url);

    const restaurant = await Restaurant.findOne({
      where: { id: restaurant_id },
      attributes: ['name', 'address', 'phone', 'fiscal_matricule', 'fiscal_company', 'fiscal_address'],
    });

    const subscription = invoice.subscription_id
      ? await Subscription.findOne({ where: { id: invoice.subscription_id } })
      : await Subscription.findOne({ where: { restaurant_id }, order: [['created_at', 'DESC']] });

    const buffer = await pdfService.generateInvoice(
      invoice.toJSON(),
      restaurant?.toJSON() || {},
      subscription?.toJSON() || {}
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice.invoice_number || String(id).slice(-8)}.pdf"`);
    res.send(buffer);
  } catch (err) { next(err); }
};
