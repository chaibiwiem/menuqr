# MenuQR — Stack Technique Complète

## Vue d'ensemble

Projet: Plateforme SaaS multi-tenant de menus digitaux QR Code pour restaurants
Société: Hannibal Advanced Solutions — www.hannibaladvanced.com
Version: 5.0 — 2026

Architecture: 2 projets séparés — Frontend React (SPA) + Backend Node.js (API REST)
Communication: HTTP REST + WebSocket (Socket.io)

---

## Frontend — menuqr-frontend/

### Core
- Runtime:     React 18.x
- Build tool:  Vite 5.x (HMR, build ultra-rapide)
- Routing:     React Router v6 (SPA, routes protégées)
- Language:    JavaScript ES6+ — PAS de TypeScript

### UI & Style
- CSS:         Tailwind CSS (utility-first, purge auto)
- Composants:  shadcn/ui (Radix UI + Tailwind, accessibles)
- Icônes:      Lucide React
- DnD:         @dnd-kit/core + @dnd-kit/sortable (drag & drop)
- Graphiques:  Recharts (LineChart, BarChart, PieChart, AreaChart)

### State & Data
- State global:  Zustand 4.x (stores légers, pas de boilerplate)
- Server state:  TanStack Query 5.x (cache, refetch, mutations, loading)
- Formulaires:   React Hook Form + Zod (validation schema)
- HTTP client:   Axios (instance configurée, intercepteurs JWT)

### Internationalisation
- Librairie:  i18next + react-i18next
- Détection:  i18next-browser-languagedetector
- Chargement: i18next-http-backend (fichiers JSON dynamiques)
- Langues:    fr (défaut) | en | it | ar
- RTL:        automatique si langue = ar (document.dir = 'rtl')
- Fichiers:   /public/locales/{fr,en,it,ar}/translation.json

### Temps réel
- Librairie:  socket.io-client 4.x
- Hook:       useSocket(restaurantId) — rooms par restaurant_id
- Events:     order:new, order:status_changed, call_waiter:new, table:status_changed

### Utilitaires
- Dates:      date-fns
- Notifications: react-hot-toast
- QR preview: qrcode (client-side display)
- PDF viewer: react-pdf (affichage factures)

### Dev port
http://localhost:5173

---

## Backend — menuqr-backend/

### Core
- Runtime:    Node.js 20 LTS
- Framework:  Express.js 4.x
- Language:   JavaScript ES6+ (CommonJS — require/module.exports)
- Process:    PM2 (production — clustering, auto-restart, logs)

### Base de données
- SGBD:       MySQL 8.x
- ORM:        Sequelize 6.x
  - Dialecte:   mysql2
  - Migrations: sequelize-cli
  - Seeds:      données de démo
- Dev local:  XAMPP (Apache + MySQL + phpMyAdmin)
  - Host:       localhost
  - Port:       3306
  - DB:         menuqr_db
  - User:       root (dev) / menuqr_user (prod)

### Authentification
- JWT:        jsonwebtoken (access token 8h, remember_me 30j)
- Hash MDP:   bcryptjs (rounds: 12)
- 2FA:        otplib (TOTP — Google Authenticator)
- Sessions:   stateless JWT — pas de session serveur
- Rate limit: express-rate-limit (5 tentatives/15min par IP)

### Temps réel
- Librairie:  socket.io 4.x (intégré dans le même process Express)
- Rooms:      'restaurant:' + restaurant_id (isolation multi-tenant)
- Events émis:
  - order:new               → nouvelle commande
  - order:status_changed    → changement statut commande
  - table:status_changed    → changement statut table
  - call_waiter:new         → appel serveur
  - menu:item_toggled       → plat activé/désactivé

### Upload & Images
- Multer:      gestion upload fichiers (mémoire ou disque)
- Cloudinary:  CDN images (resize auto, WebP, logo, bannière)
  - Logo:      400x400px max
  - Bannière:  1200x400px max

### Email
- Nodemailer:  envoi SMTP direct
- Resend:      API email transactionnel (templates HTML)
- Templates:   welcome-owner, reset-password, reservation-confirm, reminder

### QR Code
- qrcode:      génération PNG/SVG/PDF côté serveur
- sharp:       traitement image (insertion logo au centre du QR)
- URL format:  https://[slug].menuqr.tn/table/[qr_token]

### Impression
- node-thermal-printer:  ESC/POS (USB / LAN / Bluetooth)
- Formats tickets:       commande, pré-addition, reçu paiement

### PDF
- PDFKit:      génération PDF (factures, rapports, tickets)
- Puppeteer:   capture HTML → PDF (rapports analytics)

### Cron Jobs
- node-cron:   tâches planifiées
  - Rappels réservations J-1 à 10h00
  - Rappels réservations H-2 (toutes les heures)
  - Alertes abonnements expirés (quotidien à 8h00)

### SMS / WhatsApp (optionnel — plan Pro+)
- Twilio:      SMS et WhatsApp API

### Sécurité
- helmet:         headers HTTP sécurisés
- cors:           origines autorisées (FRONTEND_URL uniquement)
- express-validator: validation inputs
- Sanitisation:   DOMPurify côté client, escape côté serveur

### Dev port
http://localhost:3001

---

## Variables d'environnement — .env

```
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=menuqr_db

# Auth
JWT_SECRET=votre_secret_jwt_minimum_32_chars
JWT_EXPIRES_IN=8h
JWT_REMEMBER_EXPIRES_IN=30d

# App
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
RESEND_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Twilio (optionnel)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# URLs
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
APP_URL=https://menuqr.tn
```

---

## Architecture des dossiers

### menuqr-frontend/src/
```
api/           → axios.js + fonctions par module (auth.js, menus.js, orders.js...)
assets/        → images, icônes statiques
components/
  ui/          → shadcn/ui + composants custom
  layout/      → DashboardLayout, AdminLayout, ClientLayout
  auth/        → LoginForm, ForgotPassword, ChangePassword
  dashboard/   → StatsCards, OrdersWidget, FloorPlanWidget...
  admin/       → RestaurantWizard, PlanSelector, QRManager...
  menu/        → CategoryList (DnD), MenuItemCard, MenuItemForm...
  client/      → MenuHeader, CategoryNav, DishCard, CartDrawer...
  orders/      → OrderKanban, OrderCard, OrderDetail...
  reservations/→ ReservationForm, ReservationCalendar, SlotPicker...
  tables/      → FloorPlan, TableBadge, QRCodeGenerator...
  pos/         → TableSelector, OrderSummary, PaymentModal...
  shared/      → LanguageSwitcher, CurrencyDisplay, PlanBadge...
hooks/         → useAuth, useSocket, useCart, usePlanGuard
i18n/          → index.js (config i18next)
pages/
  auth/        → LoginPage, ForgotPasswordPage, ResetPasswordPage...
  dashboard/   → DashboardPage, MenuPage, TablesPage, OrdersPage...
  admin/       → AdminDashboardPage, RestaurantsPage, QRManagerPage...
  client/      → ClientMenuPage, ReservationFormPage, OrderTrackerPage
store/         → authStore.js, cartStore.js, uiStore.js (Zustand)
styles/        → globals.css (Tailwind + templates CSS + RTL)
utils/         → currency.js (formatDT), slugify.js, dateHelpers.js
App.jsx        → Router principal + ProtectedRoute
main.jsx       → Entry point + i18n init + QueryClient
```

### menuqr-backend/src/
```
config/
  database.js  → Sequelize singleton MySQL
  cloudinary.js→ config upload
  socket.js    → config Socket.io rooms
controllers/   → authController, restaurantController, menuController,
                 orderController, reservationController, tableController,
                 posController, analyticsController, adminController
middleware/
  auth.js      → verifyToken (JWT) + checkRole(roles[])
  planGuard.js → checkPlanFeature(feature, restaurant_id)
  tenantGuard.js→ vérif restaurant_id du token vs ressource
  rateLimiter.js→ express-rate-limit config
  upload.js    → Multer config (mémoire + Cloudinary)
models/
  index.js     → associations Sequelize + sync
  User.js, Restaurant.js, Room.js, Table.js
  Menu.js, Category.js, MenuItem.js
  SupplementGroup.js, SupplementOption.js
  Order.js, OrderItem.js, OrderItemSupplement.js, OrderStatusLog.js
  Reservation.js, ReservationSettings.js
  Payment.js, ServiceClose.js
  Subscription.js, Invoice.js, Plan.js
  CallWaiter.js, Notification.js, NotificationSettings.js
  QRScan.js, AdminLog.js
routes/        → auth.routes, restaurants.routes, menus.routes,
                 orders.routes, reservations.routes, tables.routes,
                 pos.routes, analytics.routes, admin.routes, public.routes
services/
  emailService.js   → Nodemailer + Resend + templates
  qrcodeService.js  → génération QR + logo sharp
  printerService.js → ESC/POS node-thermal-printer
  pdfService.js     → PDFKit factures + Puppeteer rapports
  socketService.js  → émetteurs Socket.io centralisés
jobs/
  cron.js      → node-cron (rappels réservations, alertes abonnements)
utils/
  currency.js  → formatDT(amount, lang) côté serveur
  slugify.js   → génération slug unique depuis nom restaurant
  tokenGenerator.js → génération tokens sécurisés
app.js         → Express + Socket.io + routes + middleware
server.js      → entry point (port 3001)
```

---

## Base de données MySQL — Tables principales

```
users                   id, username, email, password_hash, name, phone, role,
                        restaurant_id, is_active, is_first_login, language,
                        created_by, login_attempts, locked_until

restaurants             id, owner_id, name, slug, type, email, phone, address,
                        logo_url, banner_url, short_description, template_id,
                        plan, is_active, social_*, created_by

restaurant_horaires     id, restaurant_id, day_of_week(0-6), open_time, close_time, is_closed

rooms                   id, restaurant_id, name, capacity, menu_id

tables                  id, room_id, restaurant_id, number, name, capacity,
                        status(ENUM), qr_token, qr_url, position_x, position_y

menus                   id, restaurant_id, name, is_active

categories              id, menu_id, name_fr, name_en, name_it, name_ar, sort_order, is_active

menu_items              id, category_id, name_fr/en/it/ar, description_fr/en/it/ar,
                        price DECIMAL(10,3), price_night, image_url, is_available, is_featured

supplement_groups       id, menu_item_id, name_fr/en/it/ar, type(radio/checkbox),
                        min_select, max_select, is_required

supplement_options      id, group_id, name_fr/en/it/ar, extra_price DECIMAL(10,3), is_available

orders                  id, restaurant_id, table_id, status(ENUM), total DECIMAL(10,3),
                        payment_method(CASH/CARD/PENDING)

order_items             id, order_id, menu_item_id, quantity, unit_price DECIMAL(10,3),
                        name_snapshot

reservations            id, restaurant_id, table_id, first_name, last_name, email, phone,
                        date, time_slot, covers, zone(SALLE/TERRASSE/ETAGE),
                        notes, status(ENUM), cancel_token

reservation_settings    id, restaurant_id, zones_enabled JSON, capacity_salle,
                        capacity_terrasse, capacity_etage, open_slots JSON,
                        min_hours_before, auto_confirm, is_active

payments                id, order_id, method(CASH/CARD), amount DECIMAL(10,3),
                        change_given DECIMAL(10,3), discount_amount

subscriptions           id, restaurant_id, plan(ENUM), billing_period, status(ENUM),
                        starts_at, ends_at, amount DECIMAL(10,3), currency, payment_ref

call_waiters            id, restaurant_id, table_id, type(WAITER/CHECK/OTHER),
                        message, status(PENDING/DONE), created_at

notifications           id, restaurant_id, user_id, type, channel, title, body, is_read

admin_logs              id, admin_id, action, target_type, target_id, details, created_at
```

---

## Déploiement Production

### Serveur
- VPS Linux (Ubuntu 22.04 LTS minimum)
- RAM: 2 Go minimum, 4 Go recommandé
- CPU: 2 vCPU minimum
- Stockage: 20 Go SSD minimum

### Process manager
- PM2 (Node.js) — clustering, auto-restart, logs centralisés
- pm2 start server.js --name menuqr-api -i max
- pm2 startup / pm2 save

### Reverse proxy
- Nginx — SSL termination + reverse proxy → Express
- Certbot — SSL Let's Encrypt (renouvellement automatique)
- Frontend React: servir le build /dist comme fichiers statiques

### Base de données
- MySQL 8 dédié (pas XAMPP en production)
- Utilisateur dédié menuqr_user avec droits limités
- Backup automatique quotidien (mysqldump + cron)

### Monitoring
- Sentry — tracking erreurs frontend + backend
- PM2 monitoring — uptime, CPU, RAM
- Uptime Robot — alertes disponibilité (ping toutes les 5 min)

---

## Packages — Installation complète

### Frontend
```bash
npm create vite@latest menuqr-frontend -- --template react
cd menuqr-frontend
npm install react-router-dom@6
npm install @tanstack/react-query axios zustand
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
npm install react-hook-form @hookform/resolvers zod
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install recharts date-fns
npm install socket.io-client
npm install react-hot-toast lucide-react
npm install qrcode
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
```

### Backend
```bash
mkdir menuqr-backend && cd menuqr-backend
npm init -y
npm install express sequelize mysql2 dotenv
npm install jsonwebtoken bcryptjs
npm install socket.io cors helmet
npm install multer cloudinary
npm install nodemailer
npm install qrcode sharp
npm install node-thermal-printer pdfkit
npm install node-cron express-rate-limit
npm install slugify uuid otplib
npm install -D nodemon
```

---

## Commandes utiles

```bash
# Dev
cd menuqr-frontend && npm run dev    # port 5173
cd menuqr-backend  && npm run dev    # port 3001 (nodemon)

# MySQL XAMPP
# Start XAMPP → Apache + MySQL
# phpMyAdmin: http://localhost/phpmyadmin
# Créer DB: menuqr_db (utf8mb4_unicode_ci)

# Build production
cd menuqr-frontend && npm run build  # génère dist/
pm2 start server.js --name menuqr-api

# Sequelize
npx sequelize-cli db:migrate         # appliquer migrations
npx sequelize-cli db:seed:all        # données de démo
npx sequelize-cli db:migrate:undo    # annuler dernière migration

# Logs PM2
pm2 logs menuqr-api
pm2 monit
```
