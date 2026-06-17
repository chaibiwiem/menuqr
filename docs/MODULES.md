# MenuQR — Modules du Projet

14 modules organisés en 8 phases de développement.
Stack: React 18 + Vite | Node.js + Express | MySQL + Sequelize
Devise: Dinar Tunisien (DT) — formatDT() obligatoire sur tous les montants
Langues: FR | EN | IT | AR + RTL automatique pour l'arabe

---

## Vue d'ensemble — 8 Phases

| Phase | Modules | Durée estimée | Pack |
|---|---|---|---|
| P0 | Setup global | 3 jours | Tous |
| P1 | Auth + Super Admin + Création restaurant | 5 jours | Tous |
| P2 | Menu builder + Interface client QR | 7 jours | Tous |
| P3 | Commandes temps réel + Tables + Call Waiter | 6 jours | Pro+ |
| P4 | Réservations (Salle / Terrasse / Étage) | 5 jours | Pro+ |
| P5 | POS & Caisse + Abonnements SaaS | 4 jours | Premium |
| P6 | Analytics + Notifications + Super Admin avancé | 5 jours | Pro+ / Interne |
| P7 | Tests + Déploiement VPS + Nginx | 4 jours | Tous |

---

## PHASE P0 — Setup Global

### Objectif
Initialiser les deux projets React et Node.js, configurer MySQL, créer les fichiers
CLAUDE.md et docs/, établir les conventions, créer le fichier formatDT().

### Tâches
- Créer menuqr-frontend/ avec Vite + React 18 + Tailwind + shadcn/ui
- Créer menuqr-backend/ avec Node.js + Express + Sequelize
- Créer la base de données menuqr_db dans XAMPP / phpMyAdmin
- Configurer i18next avec les 4 langues FR / EN / IT / AR
- Créer src/utils/currency.js → formatDT(amount, lang)
- Créer src/api/axios.js → instance Axios avec intercepteurs JWT
- Créer le fichier .env avec toutes les variables
- Créer CLAUDE.md à la racine du projet
- Créer docs/ avec STACK.md, MODULES.md, CONVENTIONS.md, PROMPTS.md

### Livrables
```
menuqr/
├── CLAUDE.md
├── docs/
│   ├── STACK.md
│   ├── MODULES.md
│   ├── CONVENTIONS.md
│   └── PROMPTS.md
├── menuqr-frontend/
│   ├── CLAUDE.md
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── i18n/index.js
│   │   ├── utils/currency.js
│   │   └── App.jsx
│   └── public/locales/{fr,en,it,ar}/translation.json
└── menuqr-backend/
    ├── CLAUDE.md
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   └── config/database.js
    └── .env
```

---

## PHASE P1 — Module 1 : Auth

### Objectif
Système d'authentification complet. Connexion via email ou username uniquement.
Aucun OAuth. Comptes créés exclusivement par le Super Admin ou l'Owner.

### Règles absolues
- AUCUN OAuth Google / Facebook / GitHub
- AUCUNE page d'inscription publique
- AUCUN lien "Créer un compte" visible
- Connexion uniquement : email OU username + mot de passe
- is_first_login = true → changement de mot de passe forcé à la 1ère connexion

### Pages frontend
- /login              → champ "Email ou Username" + mot de passe, lien oublié
- /forgot-password    → saisie email ou username
- /reset-password     → nouveau mot de passe (token JWT 1h)
- /change-password    → forcé si is_first_login = true

### Routes backend
```
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
PUT  /api/auth/change-password     (verifyToken requis)
GET  /api/auth/me                  (verifyToken requis)
```

### Modèle MySQL — users
```
id              UUID PK
username        VARCHAR(30) UNIQUE
email           VARCHAR(191) UNIQUE
password_hash   VARCHAR(255)         bcrypt rounds 12
name            VARCHAR(100)
phone           VARCHAR(30)
role            ENUM(SUPER_ADMIN, OWNER, MANAGER, STAFF, CASHIER)
restaurant_id   UUID FK nullable     null pour SUPER_ADMIN
is_active       BOOLEAN default true
is_first_login  BOOLEAN default true
language        ENUM(fr,en,it,ar) default fr
two_fa_secret   VARCHAR(255) nullable
two_fa_enabled  BOOLEAN default false
created_by      UUID FK nullable
login_attempts  INT default 0
locked_until    DATETIME nullable
last_login_at   DATETIME nullable
created_at      DATETIME
updated_at      DATETIME
```

### Middleware auth.js
```
verifyToken          → vérifie JWT, injecte req.user
checkRole(...roles)  → vérifie req.user.role
```

### Livrables
```
frontend/src/pages/auth/
  LoginPage.jsx
  ForgotPasswordPage.jsx
  ResetPasswordPage.jsx
  ChangePasswordPage.jsx
frontend/src/store/authStore.js
backend/src/controllers/authController.js
backend/src/routes/auth.routes.js
backend/src/middleware/auth.js
backend/src/models/User.js
backend/src/services/emailService.js  (reset password template)
public/locales/{fr,en,it,ar}/translation.json  (section auth)
```

---

## PHASE P1 — Module 2 : Super Admin + Création Restaurant

### Objectif
Le Super Admin est le seul acteur pouvant créer un restaurant et son compte Owner.
Cette action est déclenchée après validation du paiement du plan par le client.

### Workflow création
1. Client souscrit à un plan (hors plateforme)
2. Super Admin ouvre /admin/restaurants/new
3. Remplit le wizard 4 étapes
4. Système crée restaurant + compte Owner en transaction
5. Email automatique au Owner avec identifiants + URL login
6. Owner se connecte → changement MDP forcé (is_first_login)

### Wizard 4 étapes

**Étape 1 — Plan & Abonnement**
- plan : FREE / STARTER / PRO / PREMIUM
- billing_period : Mensuel / Annuel
- trial_enabled : toggle + trial_days
- start_date : date picker
- amount_paid : montant DT payé
- payment_ref : référence virement / chèque
- admin_notes : notes internes SA

**Étape 2 — Informations Restaurant**
- name, type, email, phone, address
- horaires : picker 7 jours (heure ouv/ferm, toggle Fermé)
- logo : upload PNG/JPG/SVG max 2Mo + crop intégré
- banner : upload JPG/WebP 1200x400px
- short_description : max 160 chars
- template_id : galerie 6 templates + preview smartphone live
- slug : auto-généré depuis name, éditable, unicité vérifiée

**Étape 3 — Réseaux sociaux (optionnel)**
- social_facebook, social_instagram, social_tripadvisor
- social_google_maps, social_website, social_whatsapp

**Étape 4 — Compte Owner**
- owner_name, owner_username (unicité vérifiée live)
- owner_email, owner_phone
- password_mode : Auto-généré (recommandé) / Manuel
- ui_language : fr / en / it / ar

### Routes backend
```
POST   /api/admin/restaurants
GET    /api/admin/restaurants           ?plan=&status=&search=&page=
GET    /api/admin/restaurants/:id
PUT    /api/admin/restaurants/:id
PUT    /api/admin/restaurants/:id/toggle
DELETE /api/admin/restaurants/:id
POST   /api/admin/restaurants/:id/reset-password
GET    /api/admin/check-username?username=
GET    /api/admin/stats
```

### Modèles MySQL

**restaurants**
```
id                  UUID PK
owner_id            UUID FK users
name                VARCHAR(80)
slug                VARCHAR(100) UNIQUE
type                ENUM(Restaurant,Café,Bar,Hôtel,Fast-food,Autre)
email               VARCHAR(191)
phone               VARCHAR(30)
address             TEXT
logo_url            VARCHAR(500)
banner_url          VARCHAR(500)
short_description   VARCHAR(160)
template_id         ENUM(aurora_glass,bento_menu,classic_theme,dark_sleek,editorial_menu,modern_theme)
plan                ENUM(FREE,STARTER,PRO,PREMIUM)
is_active           BOOLEAN default true
social_facebook     VARCHAR(500)
social_instagram    VARCHAR(500)
social_tripadvisor  VARCHAR(500)
social_google_maps  VARCHAR(500)
social_website      VARCHAR(500)
social_whatsapp     VARCHAR(30)
fiscal_matricule    VARCHAR(50)
fiscal_company      VARCHAR(100)
fiscal_address      TEXT
created_by          UUID FK users
created_at          DATETIME
```

**restaurant_horaires**
```
id              UUID PK
restaurant_id   UUID FK
day_of_week     TINYINT  0=Lundi ... 6=Dimanche
open_time       TIME
close_time      TIME
is_closed       BOOLEAN default false
```

**subscriptions**
```
id              UUID PK
restaurant_id   UUID FK
plan            ENUM(FREE,STARTER,PRO,PREMIUM)
billing_period  ENUM(MONTHLY,ANNUAL)
status          ENUM(ACTIVE,TRIAL,EXPIRED,CANCELLED,SUSPENDED)
starts_at       DATE
ends_at         DATE
trial_ends_at   DATE nullable
amount          DECIMAL(10,3)
currency        VARCHAR(3) default 'DT'
payment_ref     VARCHAR(200)
admin_notes     TEXT
```

**admin_logs**
```
id              UUID PK
admin_id        UUID FK users
action          VARCHAR(100)     CREATE_RESTAURANT, TOGGLE_RESTAURANT...
target_type     VARCHAR(50)      restaurant, user, subscription
target_id       UUID
details         JSON
created_at      DATETIME
```

### Fonctionnalités activées par plan
```
Feature               FREE    STARTER   PRO     PREMIUM
Menus digitaux        1       illimité  illimité illimité
Templates             2       6         6        6
Tables max            5       20        illimité illimité
Staff (comptes)       2       5         15       illimité
Call Waiter           non     oui       oui      oui
Réservations          non     non       oui      oui
Notifications SMS     non     email     oui      oui
Analytics             non     basique   oui      oui
Export CSV            non     non       oui      oui
POS & Caisse          non     non       non      oui
Sous-domaine          non     oui       oui      oui
```

### Livrables
```
frontend/src/pages/admin/
  NewRestaurantPage.jsx   (wizard 4 étapes)
  RestaurantsPage.jsx     (liste + filtres)
  RestaurantDetailPage.jsx
  AdminDashboardPage.jsx
frontend/src/components/admin/
  PlanSelector.jsx
  OwnerAccountForm.jsx
  TemplateGallery.jsx
  HorairesPicker.jsx
  ImageUploader.jsx
backend/src/controllers/adminController.js
backend/src/routes/admin.routes.js
backend/src/models/{Restaurant,RestaurantHoraire,Subscription,AdminLog}.js
backend/src/middleware/planGuard.js
backend/src/services/emailService.js  (welcome-owner template)
```

---

## PHASE P2 — Module 3 : Menu Builder

### Objectif
Interface complète de création et gestion du menu. CRUD menus, catégories et plats
avec drag & drop. Noms des plats en 4 langues. Prix en DT avec DECIMAL(10,3).

### Fonctionnalités
- CRUD menus (limite selon plan : FREE = 1, autres = illimité)
- Catégories avec drag & drop @dnd-kit (réordonnement)
- Plats avec drag & drop inter et intra-catégorie
- Fiche plat : nom/description en FR/EN/IT/AR, prix DT, photo, disponible, featured
- Prix variable : prix_normal, prix_nuit, prix_happy_hour + plages horaires
- Actions groupées : activer / désactiver N plats en lot
- Groupes de suppléments : radio / checkbox, min/max, obligatoire
- Toggle disponibilité → Socket.io broadcast instantané côté client

### Routes backend
```
GET/POST        /api/menus
GET/PUT/DELETE  /api/menus/:id
GET/POST        /api/menus/:menuId/categories
PUT             /api/categories/:id
PUT             /api/categories/reorder         (drag & drop)
GET/POST        /api/categories/:id/items
PUT             /api/items/:id
PUT             /api/items/bulk-status          (action groupée)
POST            /api/items/:id/image            (upload Cloudinary)
GET/POST        /api/items/:id/supplement-groups
GET/POST        /api/supplement-groups/:id/options
```

### Modèles MySQL
```
menus
  id, restaurant_id, name, is_active

categories
  id, menu_id, name_fr, name_en, name_it, name_ar, sort_order, is_active, icon

menu_items
  id, category_id, name_fr, name_en, name_it, name_ar
  description_fr, description_en, description_it, description_ar
  price DECIMAL(10,3), price_night DECIMAL(10,3), price_happy_hour DECIMAL(10,3)
  happy_hour_start TIME, happy_hour_end TIME
  image_url, is_available, is_featured, prep_time_min
  disable_at TIME nullable, enable_at TIME nullable

supplement_groups
  id, menu_item_id, name_fr, name_en, name_it, name_ar
  type ENUM(radio,checkbox), min_select, max_select, is_required

supplement_options
  id, group_id, name_fr, name_en, name_it, name_ar
  extra_price DECIMAL(10,3), is_available
```

### Livrables
```
frontend/src/pages/dashboard/MenuPage.jsx
frontend/src/components/menu/
  CategoryList.jsx        (DnD)
  MenuItemCard.jsx
  MenuItemForm.jsx        (drawer/modal)
  SupplementManager.jsx
  BulkActions.jsx
  ImageUploader.jsx
backend/src/controllers/menuController.js
backend/src/routes/menus.routes.js
backend/src/models/{Menu,Category,MenuItem,SupplementGroup,SupplementOption}.js
```

---

## PHASE P2 — Module 4 : Interface Client QR (Menu Digital)

### Objectif
Menu digital public accessible par scan QR. Aucune authentification requise.
6 templates CSS. 4 langues + RTL. Prix en DT. Panier + commande + Call Waiter.

### Routes publiques
```
GET  /api/public/:slug                          infos restaurant + template
GET  /api/public/:slug/table/:qr_token          vérification token + table
GET  /api/public/:slug/menu                     catégories + plats actifs
POST /api/public/:slug/orders                   créer commande
GET  /api/public/orders/:id                     suivi commande
POST /api/public/:slug/call-waiter              appel serveur
```

### Pages
```
/:slug/table/:qr_token    menu digital public
/:slug/order/:id          suivi commande temps réel
/:slug/reservation        formulaire réservation (module P4)
```

### Composants
```
MenuHeader.jsx     → bannière, logo, nom, sélecteur langue (FR/EN/IT/AR)
CategoryNav.jsx    → navigation sticky, scroll horizontal mobile
DishCard.jsx       → photo, nom (langue active), description, prix formatDT()
DishModal.jsx      → photo, suppléments, compteur, commentaire
CartDrawer.jsx     → articles, total formatDT(), bouton Commander
CallWaiterButton.jsx → bouton flottant (Appeler / Addition / Aide)
OrderTracker.jsx   → progress bar temps réel Socket.io
```

### Templates CSS — data-template
```
aurora_glass    → fond sombre #0D2E4A, teal #00D9C0, glassmorphisme
bento_menu      → crème #FFF8F0, orange #C8501A, grille bento
classic_theme   → crème #FAFAF8, or #C9A96E, police serif
dark_sleek      → noir #0E0E0F, rouge-orange #FF5C35
editorial_menu  → blanc cassé #F9F7F4, style magazine
modern_theme    → blanc, violet #6C47FF, moderne
```

### Livrables
```
frontend/src/pages/client/
  ClientMenuPage.jsx
  OrderTrackerPage.jsx
frontend/src/components/client/
  MenuHeader.jsx, CategoryNav.jsx, DishCard.jsx
  DishModal.jsx, CartDrawer.jsx, CallWaiterButton.jsx
  OrderTracker.jsx
frontend/src/hooks/useCart.js
frontend/src/styles/globals.css  (6 templates CSS variables)
backend/src/routes/public.routes.js
backend/src/controllers/publicController.js
```

---

## PHASE P3 — Module 5 : Commandes Temps Réel

### Objectif
Gestion des commandes en temps réel via WebSocket. Vue Kanban 5 colonnes.
Impression automatique ESC/POS à la réception. Notifications sonores.

### Statuts commande
```
PENDING → CONFIRMED → PREPARING → READY → SERVED → CLOSED | CANCELLED
```

### Socket.io events
```
Émis serveur → dashboard:
  order:new               payload: { id, table, items, total, created_at }
  order:status_changed    payload: { orderId, newStatus, updatedAt }
  order:cancelled         payload: { orderId, reason }

Émis client → serveur:
  join:restaurant         payload: restaurantId
```

### Routes backend
```
GET    /api/orders                  ?status=&table_id=&from=&to=
POST   /api/orders                  (création manuelle depuis dashboard)
GET    /api/orders/:id
PUT    /api/orders/:id/status
PUT    /api/orders/:id/cancel
POST   /api/orders/:id/print        impression ESC/POS
```

### Modèles MySQL
```
orders
  id, restaurant_id, table_id, staff_id
  status ENUM(PENDING,CONFIRMED,PREPARING,READY,SERVED,CLOSED,CANCELLED)
  total DECIMAL(10,3), payment_method ENUM(CASH,CARD,PENDING)
  notes TEXT, created_at, updated_at

order_items
  id, order_id, menu_item_id, quantity
  unit_price DECIMAL(10,3)
  name_snapshot VARCHAR(80)     snapshot du nom au moment de la commande
  notes TEXT

order_item_supplements
  id, order_item_id, supplement_option_id
  option_name_snapshot VARCHAR(80)
  extra_price DECIMAL(10,3)

order_status_logs
  id, order_id, old_status, new_status, changed_by UUID FK, created_at
```

### Livrables
```
frontend/src/pages/dashboard/OrdersPage.jsx
frontend/src/components/orders/
  OrderKanban.jsx, OrderCard.jsx, OrderDetail.jsx
frontend/src/hooks/useOrdersSocket.js
backend/src/controllers/orderController.js
backend/src/routes/orders.routes.js
backend/src/models/{Order,OrderItem,OrderItemSupplement,OrderStatusLog}.js
backend/src/services/printerService.js    (ESC/POS)
backend/src/services/socketService.js     (émetteurs centralisés)
```

---

## PHASE P3 — Module 6 : Tables & Plan de Salle + QR Codes

### Objectif
Gestion visuelle des salles et tables. QR code dynamique par table.
Plan de salle avec drag & drop. 3 zones cohérentes avec les réservations.

### Zones
```
SALLE | TERRASSE | ÉTAGE
```

### Statuts tables
```
LIBRE       → Vert   #27AE60
OCCUPEE     → Orange #E67E22
RESERVEE    → Bleu   #3498DB
EN_ATTENTE  → Jaune  #F1C40F   (Call Waiter actif)
DESACTIVEE  → Gris   #95A5A6
```

### Fonctionnalités QR
```
URL format  : https://[slug].menuqr.tn/table/[qr_token]
qr_token    : UUID v4 (non prédictible)
Export      : PNG / SVG / PDF par table ou en lot ZIP
Logo        : logo du restaurant au centre du QR (sharp)
Dynamique   : URL modifiable sans réimpression
```

### Routes backend
```
GET/POST        /api/rooms
GET/PUT/DELETE  /api/rooms/:id
GET/POST        /api/rooms/:roomId/tables
PUT             /api/tables/:id
PUT             /api/tables/:id/status
GET             /api/tables/:id/qr
POST            /api/tables/:id/qr/regenerate
POST            /api/tables/merge
POST            /api/tables/:id/transfer
```

### Modèles MySQL
```
rooms
  id, restaurant_id, name, capacity, menu_id

tables
  id, room_id, restaurant_id, number, name, capacity
  status ENUM(LIBRE,OCCUPEE,RESERVEE,EN_ATTENTE,DESACTIVEE)
  qr_token UUID UNIQUE
  qr_url VARCHAR(500)
  position_x INT, position_y INT    pour le plan visuel
  is_active BOOLEAN

qr_scans
  id, table_id, ip_address, user_agent, scanned_at
```

### Livrables
```
frontend/src/pages/dashboard/TablesPage.jsx
frontend/src/components/tables/
  FloorPlan.jsx, TableBadge.jsx, TableDetail.jsx
  QRCodeGenerator.jsx, QRExporter.jsx
backend/src/controllers/tableController.js
backend/src/routes/tables.routes.js
backend/src/models/{Room,Table,QRScan}.js
backend/src/services/qrcodeService.js
```

---

## PHASE P3 — Module 7 : Call Waiter

### Objectif
Bouton d'appel serveur dans le menu digital client. Notification instantanée
au dashboard restaurant. Historique des appels par service.

### Types d'appels
```
WAITER  → Appeler le serveur
CHECK   → Demander l'addition
OTHER   → Autre demande (avec champ texte optionnel)
```

### Statuts
```
PENDING → IN_PROGRESS → DONE
```

### Socket.io events
```
Client → serveur  : call_waiter:new       { restaurant_id, table_id, type, message }
Serveur → dashboard: call_waiter:received  { id, table, type, message, created_at }
Dashboard → serveur: call_waiter:acknowledge { id }
Serveur → client  : call_waiter:received   confirmation
```

### Routes backend
```
POST /api/public/:slug/call-waiter    créer appel (public)
GET  /api/call-waiter                 liste des appels (Owner/Manager/Staff)
PUT  /api/call-waiter/:id/resolve     marquer comme traité
GET  /api/call-waiter/stats           statistiques
```

### Modèle MySQL
```
call_waiters
  id, restaurant_id, table_id
  type ENUM(WAITER,CHECK,OTHER)
  message TEXT nullable
  status ENUM(PENDING,IN_PROGRESS,DONE)
  created_at, resolved_at, resolved_by UUID FK nullable
```

### Livrables
```
frontend/src/components/client/
  CallWaiterButton.jsx
  CallWaiterSheet.jsx    (bottom sheet mobile)
frontend/src/pages/dashboard/CallWaiterPage.jsx
frontend/src/components/dashboard/CallWaiterWidget.jsx
backend/src/controllers/callWaiterController.js
backend/src/routes/callWaiter.routes.js
backend/src/models/CallWaiter.js
```

---

## PHASE P4 — Module 8 : Réservations

### Objectif
Module de réservation en ligne complet. Formulaire client public avec zones
configurables. Dashboard restaurant avec calendrier. Rappels automatiques via cron.

### Champs formulaire client (TOUS obligatoires sauf notes)
```
first_name    VARCHAR(80)    Prénom
last_name     VARCHAR(80)    Nom
email         VARCHAR(191)   Email
phone         VARCHAR(30)    Téléphone (format international)
date          DATE           Date de réservation
time_slot     TIME           Créneau horaire (affiché dynamiquement)
covers        TINYINT        Nombre de places (min 1)
zone          ENUM           SALLE | TERRASSE | ÉTAGE
notes         TEXT           Demandes spéciales (optionnel, max 500 chars)
```

### Statuts réservation
```
EN_ATTENTE → CONFIRMEE → RAPPEL_ENVOYE → ARRIVEE → TERMINEE
                       ↓
           ANNULEE_CLIENT | ANNULEE_RESTAURANT | NO_SHOW
```

### Routes backend
```
GET  /api/public/:slug/reservations/slots?date=&zone=   créneaux disponibles
POST /api/public/:slug/reservations                      créer (public)
GET  /api/public/reservations/cancel?token=              annuler via email
GET  /api/reservations                                   liste (Owner/Manager)
GET  /api/reservations/:id
PUT  /api/reservations/:id/status
PUT  /api/reservations/:id/assign-table
GET  /api/reservations/settings
PUT  /api/reservations/settings
GET  /api/reservations/export/csv
```

### Modèles MySQL
```
reservations
  id, restaurant_id, table_id UUID nullable
  first_name, last_name, email, phone
  date DATE, time_slot TIME
  covers TINYINT UNSIGNED
  zone ENUM(SALLE,TERRASSE,ETAGE)
  notes TEXT nullable
  status ENUM(EN_ATTENTE,CONFIRMEE,RAPPEL_ENVOYE,ARRIVEE,TERMINEE,
              ANNULEE_CLIENT,ANNULEE_RESTAURANT,NO_SHOW)
  cancel_token VARCHAR(255) UNIQUE nullable
  cancel_reason TEXT nullable
  confirmed_at DATETIME nullable
  reminder_sent TINYINT default 0

reservation_settings
  id, restaurant_id UNIQUE
  zones_enabled JSON default '["SALLE"]'
  capacity_salle SMALLINT default 50
  capacity_terrasse SMALLINT default 30
  capacity_etage SMALLINT default 20
  open_slots JSON   ex: [{"start":"12:00","end":"14:30"},{"start":"19:00","end":"22:30"}]
  service_duration_min SMALLINT default 90
  min_hours_before TINYINT default 2
  max_days_ahead TINYINT default 30
  auto_confirm TINYINT default 0
  reminder_j1_enabled TINYINT default 1
  reminder_j1_channel ENUM(EMAIL,SMS,BOTH) default EMAIL
  reminder_h2_enabled TINYINT default 0
  reminder_h2_channel ENUM(SMS,WHATSAPP) default SMS
  confirmation_message_fr TEXT
  confirmation_message_en TEXT
  confirmation_message_it TEXT
  confirmation_message_ar TEXT
  is_active TINYINT default 1
```

### Cron jobs (node-cron)
```javascript
// Rappels J-1 — chaque jour à 10h00
cron.schedule('0 10 * * *', async () => {
  // Chercher réservations CONFIRMEE pour demain
  // Envoyer email/SMS selon reminder_j1_channel
  // Mettre status = RAPPEL_ENVOYE
});

// Rappels H-2 — toutes les heures
cron.schedule('0 * * * *', async () => {
  // Chercher réservations CONFIRMEE dans 2h
  // Envoyer SMS/WhatsApp selon reminder_h2_channel
});
```

### Livrables
```
frontend/src/pages/client/ReservationFormPage.jsx
frontend/src/pages/dashboard/ReservationsPage.jsx
frontend/src/pages/dashboard/ReservationSettingsPage.jsx
frontend/src/components/reservations/
  ReservationForm.jsx, SlotPicker.jsx
  ReservationCalendar.jsx, ReservationTable.jsx
  StatusBadge.jsx, ZoneBadge.jsx
backend/src/controllers/reservationController.js
backend/src/routes/reservations.routes.js
backend/src/models/{Reservation,ReservationSettings}.js
backend/src/jobs/cron.js
backend/src/services/emailService.js  (templates réservation)
```

---

## PHASE P5 — Module 9 : POS & Caisse

### Objectif
Interface caisse pour le paiement sur place en DT (espèces ou carte bancaire physique).
Impression reçus ESC/POS et PDF. Clôture de service avec rapport.

### Modes de paiement
```
CASH  → Espèces : saisie montant reçu → calcul monnaie rendue (DT)
CARD  → Carte bancaire : confirmation manuelle (terminal physique)
```

### Formatage obligatoire — DT
```javascript
// Tous les montants via formatDT()
formatDT(order.total)         // "45,500 DT"
formatDT(payment.amount)      // "50,000 DT"
formatDT(changeGiven)         // "4,500 DT"  (monnaie rendue)
```

### Routes backend
```
GET  /api/pos/active-tables
GET  /api/pos/orders/:tableId
POST /api/pos/payments
POST /api/pos/print/pre-check/:orderId
POST /api/pos/print/receipt/:paymentId
POST /api/pos/service-close
GET  /api/pos/service-close/:id/report
```

### Modèles MySQL
```
payments
  id, order_id, method ENUM(CASH,CARD)
  amount DECIMAL(10,3), change_given DECIMAL(10,3)
  discount_amount DECIMAL(10,3), discount_type ENUM(PERCENT,FIXED)
  processed_by UUID FK, processed_at DATETIME

service_closes
  id, restaurant_id, date DATE
  total_cash DECIMAL(10,3), total_card DECIMAL(10,3)
  total_orders INT, total_revenue DECIMAL(10,3)
  notes TEXT, closed_by UUID FK, created_at DATETIME
```

### Livrables
```
frontend/src/pages/dashboard/POSPage.jsx
frontend/src/pages/dashboard/ServiceClosePage.jsx
frontend/src/components/pos/
  TableSelector.jsx, OrderSummary.jsx
  PaymentModal.jsx, PrintButton.jsx
backend/src/controllers/posController.js
backend/src/routes/pos.routes.js
backend/src/models/{Payment,ServiceClose}.js
backend/src/services/printerService.js    (ESC/POS)
backend/src/services/pdfService.js        (PDFKit reçus)
```

---

## PHASE P5 — Module 10 : Abonnements SaaS

### Objectif
Gestion des abonnements SaaS. Factures PDF en DT. Middleware planGuard pour
bloquer les features selon le plan. Les abonnements sont créés par le Super Admin.

### Plans
```
FREE     → fonctionnalités limitées (voir tableau Module 2)
STARTER  → menus illimités, templates, call waiter
PRO      → tout Starter + réservations, analytics, notifications
PREMIUM  → tout Pro + POS, sous-domaine, rapports avancés
```

### planGuard middleware
```javascript
// middleware/planGuard.js
const PLAN_FEATURES = {
  analytics:    ['PRO', 'PREMIUM'],
  reservations: ['PRO', 'PREMIUM'],
  pos_caisse:   ['PREMIUM'],
  call_waiter:  ['STARTER', 'PRO', 'PREMIUM'],
  export_csv:   ['PRO', 'PREMIUM'],
};

exports.planGuard = (feature) => async (req, res, next) => {
  const { restaurant_id } = req.user;
  const subscription = await Subscription.findOne({ where: { restaurant_id, status: 'ACTIVE' } });
  const allowedPlans = PLAN_FEATURES[feature] || [];
  if (!allowedPlans.includes(subscription?.plan)) {
    return res.status(403).json({ error: 'PLAN_UPGRADE_REQUIRED', message: 'Upgrade votre plan' });
  }
  next();
};
```

### Routes backend
```
GET  /api/billing/plan
GET  /api/billing/invoices
GET  /api/billing/invoices/:id/download
```

### Modèles MySQL
```
plans
  id, name ENUM(FREE,STARTER,PRO,PREMIUM)
  price_monthly DECIMAL(10,3), price_annual DECIMAL(10,3)
  features JSON, max_menus INT, max_tables INT, max_staff INT

invoices
  id, restaurant_id, subscription_id
  amount DECIMAL(10,3), currency VARCHAR(3) default 'DT'
  status ENUM(PAID,PENDING,CANCELLED)
  invoice_number VARCHAR(20)    ex: FACTURE-2026-0001
  issued_at DATE, due_at DATE
  pdf_url VARCHAR(500)
```

### Livrables
```
frontend/src/pages/dashboard/BillingPage.jsx
frontend/src/components/billing/
  PlanCard.jsx, InvoicesTable.jsx
backend/src/middleware/planGuard.js
backend/src/controllers/billingController.js
backend/src/routes/billing.routes.js
backend/src/models/{Plan,Subscription,Invoice}.js
backend/src/services/pdfService.js    (factures PDFKit)
```

---

## PHASE P6 — Module 11 : Analytics & Rapports

### Objectif
Tableaux de bord analytiques avec graphiques Recharts. CA en DT.
Statistiques réservations par zone. Export CSV. Rapports PDF.

### Graphiques (Recharts)
```
LineChart  → CA par jour sur la période (valeurs DT formatées)
BarChart   → commandes par heure de la journée
AreaChart  → évolution hebdomadaire sur 8 semaines
PieChart   → répartition CA par catégorie
BarChart   → top plats vendus (horizontal)
```

### Statistiques réservations
```
Nb total réservations par zone (SALLE / TERRASSE / ÉTAGE)
Taux de remplissage par zone
Taux no-show
Heure de pointe des réservations
```

### Routes backend
```
GET /api/analytics/kpis?from=&to=
GET /api/analytics/revenue-chart?period=
GET /api/analytics/top-dishes?limit=10
GET /api/analytics/by-category
GET /api/analytics/tables
GET /api/analytics/reservations      (stats par zone)
GET /api/analytics/qr-scans
GET /api/analytics/staff
GET /api/analytics/export/csv?from=&to=
```

### Livrables
```
frontend/src/pages/dashboard/AnalyticsPage.jsx
frontend/src/components/analytics/
  KPICards.jsx, RevenueChart.jsx, TopDishesTable.jsx
  CategoryPieChart.jsx, QRHeatmap.jsx
  StaffPerformance.jsx, ReservationStats.jsx
  PeriodSelector.jsx
backend/src/controllers/analyticsController.js
backend/src/routes/analytics.routes.js
backend/src/services/pdfService.js    (rapports Puppeteer)
```

---

## PHASE P6 — Module 12 : Notifications Multi-canaux

### Objectif
Système de notifications par email, SMS et push PWA. Rappels réservations.
Centre de notifications in-app avec badge non-lu.

### Canaux
```
EMAIL       Resend / Nodemailer  → bienvenue, réservation, rappels, factures
SMS         Twilio               → confirmation réservation, rappel H-2
WHATSAPP    Twilio WhatsApp API  → rappel réservation J-1
PUSH PWA    web-push             → nouvelle commande, Call Waiter
IN_APP      Socket.io            → toasts dashboard, badge cloche
```

### Routes backend
```
GET  /api/notifications           liste notifications in-app
PUT  /api/notifications/:id/read
PUT  /api/notifications/read-all
GET  /api/notifications/settings
PUT  /api/notifications/settings
POST /api/notifications/test
```

### Modèles MySQL
```
notifications
  id, restaurant_id, user_id
  type VARCHAR(50), channel ENUM(EMAIL,SMS,WHATSAPP,PUSH,IN_APP)
  event VARCHAR(100), title VARCHAR(200), body TEXT
  is_read BOOLEAN, sent_at DATETIME, failed_at DATETIME, error_message TEXT

notification_settings
  id, restaurant_id UNIQUE
  email_new_order BOOLEAN, sms_new_order BOOLEAN, push_new_order BOOLEAN
  email_reservation BOOLEAN, sms_reminder BOOLEAN, whatsapp_reminder BOOLEAN
  push_call_waiter BOOLEAN
```

### Livrables
```
frontend/src/components/shared/
  NotificationBell.jsx
  NotificationCenter.jsx
frontend/src/pages/dashboard/NotificationSettingsPage.jsx
backend/src/controllers/notificationController.js
backend/src/routes/notifications.routes.js
backend/src/models/{Notification,NotificationSettings}.js
backend/src/services/
  emailService.js     (templates Resend/Nodemailer)
  smsService.js       (Twilio)
  pushService.js      (web-push)
  notificationDispatcher.js   (orchestrateur)
```

---

## PHASE P6 — Module 13 : Dashboard Super Admin

### Objectif
Interface d'administration globale de la plateforme. KPIs, gestion restaurants,
QR Code Manager, devise DT, factures.

### Pages
```
/admin                        → dashboard KPIs
/admin/restaurants            → liste + création
/admin/restaurants/new        → wizard (Module 2)
/admin/restaurants/:id        → fiche complète
/admin/users                  → tous les comptes
/admin/qr-manager             → QR codes globaux
/admin/currencies             → gestion devise DT
/admin/billing                → factures + abonnements
```

### KPIs dashboard SA
```
Nb restaurants actifs / total
Répartition par plan (FREE/STARTER/PRO/PREMIUM)
Nouveaux restaurants ce mois
Nb commandes traitées (toute la plateforme) ce mois
Alertes : abonnements expirés, restaurants inactifs > 30j
Top 10 restaurants (activité + CA en DT)
```

### QR Code Manager
```
Tableau : ID QR, restaurant, table, dates, créateur, nb scans, statut
Génération en lot : 10 / 20 / 50 QR codes
Attribution à un restaurant
Modification URL destination (QR dynamique)
Export ZIP (PNG ou PDF)
```

### Gestion devise DT
```
Symbole       : DT
Position      : après le montant (ex: 12,500 DT)
Décimales     : 3
Séparateur    : virgule (fr/ar), point (en/it)
```

### Routes backend
```
GET     /api/admin/stats
GET     /api/admin/restaurants          + filtres + pagination
POST    /api/admin/restaurants
GET/PUT /api/admin/restaurants/:id
PUT     /api/admin/restaurants/:id/toggle
DELETE  /api/admin/restaurants/:id
POST    /api/admin/restaurants/:id/reset-password
GET     /api/admin/users
GET/PUT /api/admin/qr-codes
PUT     /api/admin/qr-codes/:id/url
GET/PUT /api/admin/currencies
GET     /api/admin/invoices
POST    /api/admin/invoices/generate
GET     /api/admin/alerts
```

### Livrables
```
frontend/src/pages/admin/
  AdminDashboardPage.jsx
  RestaurantsPage.jsx, RestaurantDetailPage.jsx
  UsersPage.jsx
  QRManagerPage.jsx
  CurrenciesPage.jsx
  BillingPage.jsx
frontend/src/components/admin/
  PlatformKPIs.jsx, RestaurantsTable.jsx
  UsersTable.jsx, QRManagerTable.jsx
  AlertsWidget.jsx, InvoicesTable.jsx
backend/src/controllers/adminController.js
backend/src/routes/admin.routes.js
```

---

## PHASE P6 — Module 14 : Dashboard Restaurant (Owner/Manager)

### Objectif
Tableau de bord temps réel pour l'espace restaurant. CA en DT, commandes live,
plan de salle, top plats. Gestion du personnel selon les limites du plan.

### Widgets temps réel (Socket.io)
```
CA journalier          → LineChart Recharts courbe horaire + comparaison J-1
Commandes en cours     → compteur par statut + 5 dernières commandes
Plan de salle miniature→ grille tables colorées par statut
Top plats du jour      → top 5 avec quantités et CA en DT
Call Waiter en attente → badge rouge si > 0, liste avec bouton Traiter
Scans QR               → nb scans du jour, top 3 tables
```

### Gestion personnel (Owner uniquement)
```
Créer compte : nom, username, email, téléphone, rôle, MDP temporaire auto
Envoyer email : identifiants automatiques au nouveau membre
Désactiver / Réactiver : accès immédiatement révoqué ou restauré
Limites plan : FREE(2), STARTER(5), PRO(15), PREMIUM(illimité)
```

### Routes backend
```
GET  /api/dashboard/stats
GET  /api/dashboard/orders-live
GET  /api/dashboard/tables-status
GET  /api/dashboard/top-dishes
GET  /api/dashboard/qr-scans
GET  /api/staff
POST /api/staff                    (Owner seulement)
PUT  /api/staff/:id
PUT  /api/staff/:id/toggle
POST /api/staff/:id/reset-password
```

### Livrables
```
frontend/src/pages/dashboard/DashboardPage.jsx
frontend/src/pages/dashboard/StaffPage.jsx
frontend/src/components/dashboard/
  StatsCards.jsx, OrdersLiveWidget.jsx
  FloorPlanWidget.jsx, TopDishesWidget.jsx
  CallWaiterWidget.jsx, QRScansWidget.jsx
frontend/src/hooks/useDashboardSocket.js
backend/src/controllers/dashboardController.js
backend/src/routes/dashboard.routes.js
```

---

## PHASE P7 — Tests & Déploiement

### Tests à effectuer avant mise en production
```
Auth         : tentatives bloquées après 5 essais, is_first_login forcé
Tenant       : impossible d'accéder aux données d'un autre restaurant
formatDT()   : tous les montants affichés avec 3 décimales + " DT"
i18n         : t() sur tous les textes, RTL arabe fonctionnel
Réservations : créneaux disponibles corrects, zones SALLE/TERRASSE/ÉTAGE
Socket.io    : commandes reçues en < 1 seconde
POS          : calcul monnaie rendue correct en DT
planGuard    : features bloquées si plan insuffisant
```

### Déploiement VPS
```bash
# 1. Cloner le projet sur le VPS
git clone https://github.com/hannibal/menuqr.git

# 2. Build frontend
cd menuqr-frontend && npm run build

# 3. Configurer Nginx
# Servir dist/ pour le frontend
# Proxy pass vers localhost:3001 pour l'API

# 4. Démarrer le backend avec PM2
cd menuqr-backend
pm2 start server.js --name menuqr-api -i max
pm2 startup && pm2 save

# 5. SSL Let's Encrypt
certbot --nginx -d menuqr.tn -d www.menuqr.tn
```

---

## Récapitulatif — 14 Modules

| Module | Phase | Fichier prompt dans PROMPTS.md |
|---|---|---|
| 1  Setup global | P0 | ## MODULE 1 — Setup global |
| 2  Auth | P1 | ## MODULE 2 — Auth |
| 3  Super Admin + Création restaurant | P1 | ## MODULE 3 — Super Admin |
| 4  Menu Builder | P2 | ## MODULE 4 — Menu Builder |
| 5  Interface Client QR | P2 | ## MODULE 5 — Menu Client QR |
| 6  Commandes Temps Réel | P3 | ## MODULE 6 — Commandes |
| 7  Tables + Plan de Salle + QR | P3 | ## MODULE 7 — Tables |
| 8  Call Waiter | P3 | ## MODULE 8 — Call Waiter |
| 9  Réservations | P4 | ## MODULE 9 — Réservations |
| 10 POS & Caisse | P5 | ## MODULE 10 — POS |
| 11 Abonnements SaaS | P5 | ## MODULE 11 — Abonnements |
| 12 Analytics | P6 | ## MODULE 12 — Analytics |
| 13 Notifications | P6 | ## MODULE 13 — Notifications |
| 14 Dashboards (SA + Restaurant) | P6 | ## MODULE 14 — Dashboards |
