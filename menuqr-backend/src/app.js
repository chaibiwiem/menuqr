const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible from controllers
app.set('io', io);

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'too_many_requests' },
}));

// Auth route rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: true, message: 'too_many_requests' },
});

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Inject req.io for use in all controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Static uploads — Cross-Origin-Resource-Policy must be cross-origin
// so the React frontend (localhost:5173) can load images served by Express (localhost:3001)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes — public MUST be mounted before authenticated routers (no global verifyToken)
app.use('/api/setup',       require('./routes/setup.routes'));
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api',             require('./routes/public.routes'));    // no auth — before menus/orders
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/dashboard',   require('./routes/dashboard.routes'));
app.use('/api',             require('./routes/menus.routes'));
app.use('/api',             require('./routes/orders.routes'));
app.use('/api/tables',      require('./routes/tables.routes'));
app.use('/api/reservations',  require('./routes/reservations.routes'));
app.use('/api/call-waiter',  require('./routes/callWaiter.routes'));
app.use('/api/staff',        require('./routes/staff.routes'));
app.use('/api/pos',          require('./routes/pos.routes'));
app.use('/api/billing',        require('./routes/billing.routes'));
app.use('/api/analytics',      require('./routes/analytics.routes'));
app.use('/api/notifications',  require('./routes/notifications.routes'));
app.use('/api/settings',       require('./routes/settings.routes'));

// Socket.io rooms & events
io.on('connection', (socket) => {
  socket.on('join:restaurant', (restaurant_id) => {
    socket.join(`restaurant:${restaurant_id}`);
  });

  socket.on('leave:restaurant', (restaurant_id) => {
    socket.leave(`restaurant:${restaurant_id}`);
  });

  socket.on('disconnect', () => {});
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.name, err.message);

  // Sequelize unique constraint (duplicate slug, username, email…)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    const map = { slug: 'slug_taken', username: 'username_taken', email: 'email_taken' };
    return res.status(409).json({
      error: true,
      message: map[field] || `${field}_already_exists`,
      field,
    });
  }

  // Sequelize validation (NOT NULL, format…)
  if (err.name === 'SequelizeValidationError') {
    const first = err.errors?.[0];
    return res.status(422).json({
      error: true,
      message: first?.message || 'validation_error',
      field: first?.path,
    });
  }

  // Sequelize foreign key / DB errors
  if (err.name === 'SequelizeDatabaseError') {
    console.error('[DB]', err.parent?.sqlMessage);
    return res.status(500).json({ error: true, message: 'database_error' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'server_error',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'not_found' });
});

module.exports = { app, httpServer, io };
