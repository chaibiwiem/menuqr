# MenuQR — Prompts Claude Code par Module

Stack: React 18 + Vite | Node.js 20 + Express 4 | MySQL 8 + Sequelize 6
Devise: DT (Dinar Tunisien) — 3 décimales — TOUJOURS formatDT()
Langues: FR | EN | IT | AR + RTL automatique — TOUJOURS t()
Auth: JWT uniquement — AUCUN OAuth — AUCUNE inscription publique

Utilisation dans Claude Code:
  claude (depuis menuqr/)
  > @docs/PROMPTS.md génère le MODULE 1
  OU copier directement le contenu du module voulu

---

## MODULE 1 — Setup Global (React + Node.js + MySQL)

Tu es un expert React 18 + Node.js + MySQL. Configure le projet complet MenuQR SaaS multi-tenant de zéro.

STACK FINALE OBLIGATOIRE:
- Frontend : React 18 + Vite + React Router v6 + Tailwind CSS + shadcn/ui
- State    : Zustand + TanStack Query (React Query v5)
- i18n     : i18next + react-i18next (FR, EN, IT, AR + RTL arabe)
- Backend  : Node.js 20 + Express.js 4 (CommonJS)
- DB       : MySQL 8 + Sequelize 6 (XAMPP dev, port 3306)
- Auth     : JWT + bcryptjs — AUCUN OAuth externe
- Realtime : Socket.io 4 (intégré dans le même process Express)
- Devise   : Dinar Tunisien (DT) — 3 décimales — formatDT() obligatoire
- Language : JavaScript ES6+ uniquement — JAMAIS TypeScript

TÂCHE 1 — Créer menuqr-frontend/:
```bash
npm create vite@latest menuqr-frontend -- --template react
cd menuqr-frontend
npm install react-router-dom@6
npm install @tanstack/react-query axios zustand
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
npm install react-hook-form @hookform/resolvers zod
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install recharts date-fns socket.io-client react-hot-toast lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
```

TÂCHE 2 — Créer menuqr-backend/:
```bash
mkdir menuqr-backend && cd menuqr-backend && npm init -y
npm install express sequelize mysql2 dotenv
npm install jsonwebtoken bcryptjs
npm install socket.io cors helmet express-rate-limit
npm install multer cloudinary
npm install nodemailer
npm install qrcode sharp
npm install node-thermal-printer pdfkit
npm install node-cron slugify uuid otplib
npm install -D nodemon
```

TÂCHE 3 — Générer ces fichiers avec leur contenu complet:

menuqr-frontend/src/utils/currency.js:
- Fonction formatDT(amount, lang = 'fr') utilisant Intl.NumberFormat
- locale selon lang: fr→fr-TN, en→en-TN, it→it-TN, ar→ar-TN
- minimumFractionDigits: 3, maximumFractionDigits: 3
- Retourne: nombre formaté + ' DT' (ex: "12,500 DT")

menuqr-frontend/src/api/axios.js:
- Instance Axios avec baseURL: import.meta.env.VITE_API_URL
- Intercepteur request: ajouter Bearer token depuis localStorage
- Intercepteur response: si 401 → supprimer token + redirect /login

menuqr-frontend/src/i18n/index.js:
- Config i18next avec Backend + LanguageDetector + initReactI18next
- supportedLngs: ['fr', 'en', 'it', 'ar']
- fallbackLng: 'fr'
- loadPath: '/locales/{{lng}}/translation.json'

menuqr-frontend/src/App.jsx:
- BrowserRouter avec Routes
- Composant ProtectedRoute(roles) → vérifie token + role + is_first_login
- Routes auth publiques: /login, /forgot-password, /reset-password, /change-password
- Routes client publiques: /:slug/table/:qrToken, /:slug/reservation, /:slug/order/:id
- Routes dashboard protégées: /dashboard/* → roles OWNER,MANAGER,STAFF,CASHIER
- Routes admin protégées: /admin/* → role SUPER_ADMIN
- Effet RTL: document.dir = 'rtl' si langue = 'ar'

menuqr-frontend/src/store/authStore.js:
- Zustand store avec: user, token, setAuth(token, user), logout()
- Persist dans localStorage

menuqr-backend/src/config/database.js:
- Sequelize singleton avec dialecte mysql2
- Paramètres depuis .env: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
- logging: false en production
- Pool: max 10, min 0

menuqr-backend/src/app.js:
- Express app + createServer + Socket.io
- Middleware: helmet, cors (FRONTEND_URL), express.json()
- Injection req.io = io dans chaque requête
- Socket.io: on('join:restaurant', restaurantId) → socket.join('restaurant:' + restaurantId)
- Monter toutes les routes: /api/auth, /api/public, /api/admin, /api/dashboard...

menuqr-backend/src/server.js:
- Importer { app, httpServer } depuis app.js
- httpServer.listen(PORT || 3001)

.env (template):
DB_HOST=localhost, DB_PORT=3306, DB_USER=root, DB_PASS=, DB_NAME=menuqr_db
JWT_SECRET=minimum_32_chars_secret_key_here
JWT_EXPIRES_IN=8h, JWT_REMEMBER_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173, PORT=3001, NODE_ENV=development
CLOUDINARY_CLOUD_NAME=, CLOUDINARY_API_KEY=, CLOUDINARY_API_SECRET=
RESEND_API_KEY=, VITE_API_URL=http://localhost:3001/api

TÂCHE 4 — Créer les fichiers de traduction de base:
public/locales/fr/translation.json — structure avec sections: common, auth, menu, cart, reservation, orders, dashboard, errors
public/locales/en/translation.json — même structure en anglais
public/locales/it/translation.json — même structure en italien
public/locales/ar/translation.json — même structure en arabe

LIVRABLES ATTENDUS:
- menuqr-frontend/ configuré et fonctionnel (npm run dev → port 5173)
- menuqr-backend/ configuré et fonctionnel (npm run dev → port 3001)
- Tous les fichiers listés avec leur contenu complet
- package.json des deux projets avec tous les scripts (dev, build, start)
- tailwind.config.js configuré
- README.md avec instructions de démarrage

---

## MODULE 2 — Auth (Email/Username — Sans OAuth)

Tu es un expert React + Express + JWT. Génère le module d'authentification complet pour MenuQR.

RÈGLES ABSOLUES AUTH:
- AUCUN OAuth Google / Facebook / GitHub / réseau social
- AUCUNE page d'inscription publique
- AUCUN bouton "Créer un compte"
- Connexion UNIQUEMENT: email OU username + mot de passe
- Rate limiting: 5 tentatives échouées → blocage 15 minutes
- is_first_login = true → redirection forcée vers /change-password

BACKEND — Générer ces fichiers:

backend/src/models/User.js (Sequelize):
Champs: id(UUID), username(UNIQUE 3-30 chars alphanum), email(UNIQUE),
password_hash, name, phone, role(ENUM: SUPER_ADMIN,OWNER,MANAGER,STAFF,CASHIER),
restaurant_id(UUID FK nullable), is_active(BOOL true), is_first_login(BOOL true),
language(ENUM: fr,en,it,ar default fr), two_fa_secret(nullable), two_fa_enabled(BOOL false),
created_by(UUID FK nullable), login_attempts(INT 0), locked_until(DATETIME nullable),
last_login_at(DATETIME nullable)
Options: tableName: 'users', timestamps: true, underscored: true

backend/src/middleware/auth.js:
- verifyToken: extraire Bearer token, jwt.verify, injecter req.user
  Si invalide ou expiré: 401 { error: 'UNAUTHORIZED', message: 'Token invalide' }
- checkRole(...roles): vérifier req.user.role dans roles[]
  Si non autorisé: 403 { error: 'FORBIDDEN', message: 'Accès refusé' }

backend/src/middleware/rateLimiter.js:
- Utiliser express-rate-limit
- authLimiter: 5 requêtes / 15 minutes par IP sur /api/auth/*
- Message: { error: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives. Réessayez dans X minutes' }

backend/src/controllers/authController.js — Fonctions:

exports.login:
- body: { identifier, password, remember_me }
- Chercher user par: WHERE (email = identifier OR username = identifier) AND is_active = true
- Vérifier locked_until: si bloqué → 429 avec minutes restantes
- bcrypt.compare(password, user.password_hash)
- Si invalide: incrémenter login_attempts, si >= 5 → locked_until = now + 15min, save
- Si valide: reset login_attempts=0, locked_until=null, last_login_at=now, save
- Générer JWT: { id, role, restaurant_id, is_first_login }
  expiresIn = remember_me ? '30d' : '8h'
- Réponse: { data: { token, user: { id, name, username, email, role, restaurant_id, is_first_login } } }

exports.forgotPassword:
- body: { identifier } (email ou username)
- Chercher user (même si non trouvé → MÊME réponse neutre pour sécurité)
- Si trouvé: générer reset token JWT { id, purpose: 'reset' } expiresIn: '1h'
  Envoyer email via emailService.sendPasswordReset(email, name, token, language)
- Réponse TOUJOURS: { message: 'Si un compte existe, vous recevrez un email.' }

exports.resetPassword:
- body: { token, password, confirmPassword }
- Vérifier token JWT (purpose = 'reset')
- Valider password: min 8 chars, 1 majuscule, 1 chiffre
- hash = await bcrypt.hash(password, 12)
- user.password_hash = hash, user.is_first_login = false, save
- Réponse: { message: 'Mot de passe modifié avec succès' }

exports.changePassword (1ère connexion forcée):
- verifyToken requis
- body: { current_password, new_password, confirm_password }
- Vérifier current_password avec bcrypt.compare
- Hash nouveau MDP, is_first_login = false, save
- Réponse: { message: 'Mot de passe changé. Bienvenue !' }

exports.me:
- verifyToken requis
- Retourner user complet sans password_hash

backend/src/routes/auth.routes.js:
POST /api/auth/login            authLimiter, authController.login
POST /api/auth/forgot-password  authLimiter, authController.forgotPassword
POST /api/auth/reset-password   authController.resetPassword
PUT  /api/auth/change-password  verifyToken, authController.changePassword
GET  /api/auth/me               verifyToken, authController.me

FRONTEND — Générer ces fichiers:

frontend/src/pages/auth/LoginPage.jsx:
- Formulaire: 1 champ "Email ou nom d'utilisateur" + champ password (toggle visibilité)
- Checkbox "Se souvenir de moi"
- Lien "Mot de passe oublié ?" → /forgot-password
- Bouton "Se connecter"
- Message bas de page: t('auth.contact_admin') → "Pour accéder, contactez votre administrateur"
- AUCUN bouton OAuth, AUCUN lien inscription
- useMutation TanStack Query pour l'appel API
- onSuccess: setAuth(token, user) → if is_first_login → /change-password else /dashboard ou /admin
- Afficher message d'erreur de l'API sous le formulaire
- Textes via t() — JAMAIS hardcodés

frontend/src/pages/auth/ForgotPasswordPage.jsx:
- 1 champ "Email ou nom d'utilisateur"
- Bouton "Envoyer le lien de réinitialisation"
- Après succès: afficher message de confirmation (pas de redirect)
- Message neutre: t('auth.forgot_sent')

frontend/src/pages/auth/ResetPasswordPage.jsx:
- Lire token depuis query string: useSearchParams()
- 2 champs: nouveau MDP + confirmation
- Validation: min 8 chars, 1 majuscule, 1 chiffre
- Après succès → redirect /login avec toast

frontend/src/pages/auth/ChangePasswordPage.jsx:
- Affiché si is_first_login = true
- Message explicatif: t('auth.first_login_msg')
- 3 champs: MDP actuel + nouveau + confirmation
- Après succès → update store is_first_login=false → /dashboard

frontend/src/store/authStore.js (Zustand):
- State: { user, token }
- Actions: setAuth(token, user), logout(), updateUser(partialUser)
- Persist: zustand/middleware persist → localStorage
- Computed: isAuthenticated, isSuperAdmin, isOwner

LIVRABLES:
backend/src/models/User.js
backend/src/middleware/auth.js
backend/src/middleware/rateLimiter.js
backend/src/controllers/authController.js
backend/src/routes/auth.routes.js
backend/src/services/emailService.js (template reset password)
frontend/src/pages/auth/LoginPage.jsx
frontend/src/pages/auth/ForgotPasswordPage.jsx
frontend/src/pages/auth/ResetPasswordPage.jsx
frontend/src/pages/auth/ChangePasswordPage.jsx
frontend/src/store/authStore.js
public/locales/{fr,en,it,ar}/translation.json (section auth complète)

---

## MODULE 3 — Super Admin : Création Restaurant & Compte Owner

Tu es un expert React + Express + Sequelize. Génère le module complet de création de restaurant par le Super Admin pour MenuQR.

RÈGLE: Seul le Super Admin crée les restaurants et les comptes Owner.
Aucune auto-création. Tout passe par /admin/restaurants/new.

BACKEND — Générer ces fichiers:

backend/src/models/Restaurant.js (Sequelize):
Champs: id(UUID), owner_id(UUID FK), name(VARCHAR 80), slug(VARCHAR 100 UNIQUE),
type(ENUM: Restaurant,Café,Bar,Hôtel,Fast-food,Autre), email, phone, address(TEXT),
logo_url, banner_url, short_description(VARCHAR 160),
template_id(ENUM: aurora_glass,bento_menu,classic_theme,dark_sleek,editorial_menu,modern_theme),
plan(ENUM: FREE,STARTER,PRO,PREMIUM), is_active(BOOL true),
social_facebook, social_instagram, social_tripadvisor, social_google_maps, social_website, social_whatsapp,
fiscal_matricule, fiscal_company, fiscal_address(TEXT),
created_by(UUID FK), activated_at(DATETIME)
tableName: 'restaurants', timestamps: true, underscored: true

backend/src/models/RestaurantHoraire.js:
id(UUID), restaurant_id(UUID FK), day_of_week(TINYINT 0-6),
open_time(TIME), close_time(TIME), is_closed(BOOL false)
tableName: 'restaurant_horaires'

backend/src/models/Subscription.js:
id(UUID), restaurant_id(UUID FK UNIQUE), plan(ENUM), billing_period(ENUM: MONTHLY,ANNUAL),
status(ENUM: ACTIVE,TRIAL,EXPIRED,CANCELLED,SUSPENDED),
starts_at(DATE), ends_at(DATE), trial_ends_at(DATE nullable),
amount(DECIMAL 10,3), currency(VARCHAR 3 default 'DT'), payment_ref, admin_notes(TEXT)

backend/src/models/AdminLog.js:
id(UUID), admin_id(UUID FK), action(VARCHAR 100), target_type(VARCHAR 50),
target_id(UUID), details(JSON), created_at(DATETIME)
tableName: 'admin_logs', timestamps: false

backend/src/middleware/planGuard.js:
- Map PLAN_FEATURES: analytics→[PRO,PREMIUM], reservations→[PRO,PREMIUM],
  pos_caisse→[PREMIUM], call_waiter→[STARTER,PRO,PREMIUM], export_csv→[PRO,PREMIUM]
- exports.planGuard = (feature) => async (req, res, next):
  Chercher subscription active pour req.user.restaurant_id
  Si plan non autorisé → 403 { error: 'PLAN_UPGRADE_REQUIRED', message: 'Upgrade votre plan pour accéder à cette fonctionnalité' }

backend/src/controllers/adminController.js — Fonctions:

exports.createRestaurant:
Transaction Sequelize:
1. slugify(name) → vérifier unicité, incrémenter si doublon (ex: le-bistro-2)
2. Restaurant.create({ ...body, slug, created_by: req.user.id })
3. Si logo uploadé → Cloudinary upload → restaurant.logo_url
4. Si banner uploadée → Cloudinary upload → restaurant.banner_url
5. restaurant.save()
6. Générer MDP temporaire si password_mode = 'auto': crypto.randomBytes(8).toString('hex')
7. hash = bcrypt.hash(tempPassword, 12)
8. User.create({ username, email: owner_email, name: owner_name, phone: owner_phone,
   password_hash: hash, role: 'OWNER', restaurant_id: restaurant.id,
   is_first_login: true, language: ui_language, created_by: req.user.id })
9. Subscription.create({ restaurant_id, plan, billing_period, status: trial_enabled ? 'TRIAL' : 'ACTIVE',
   starts_at, ends_at: calculé selon plan, amount, currency: 'DT', payment_ref, admin_notes })
10. AdminLog.create({ admin_id: req.user.id, action: 'CREATE_RESTAURANT',
    target_type: 'restaurant', target_id: restaurant.id })
11. commit()
12. emailService.sendWelcomeOwner({ to: owner_email, name: owner_name, username,
    tempPassword, restaurantName: name, loginUrl: FRONTEND_URL + '/login', language: ui_language })
13. Réponse 201: { data: { restaurant, owner: { id, username, email }, subscription } }

exports.getRestaurants:
- Pagination 20/page, filtres: plan, status, search (nom/email)
- Include: owner (User), subscription

exports.getRestaurantById:
- Include: owner, subscription, horaires, users count

exports.updateRestaurant, exports.toggleRestaurant, exports.deleteRestaurant
exports.resetOwnerPassword: générer nouveau MDP temp → hash → envoyer email
exports.getStats: nb restaurants par plan, alertes, top restaurants, MRR en DT
exports.checkUsername: GET /check-username?username= → { available: bool }

backend/src/routes/admin.routes.js:
Toutes les routes sous verifyToken + checkRole('SUPER_ADMIN')
GET    /api/admin/stats
GET    /api/admin/restaurants           getRestaurants
POST   /api/admin/restaurants           upload.fields([logo,banner]), createRestaurant
GET    /api/admin/restaurants/:id       getRestaurantById
PUT    /api/admin/restaurants/:id       updateRestaurant
PUT    /api/admin/restaurants/:id/toggle toggleRestaurant
DELETE /api/admin/restaurants/:id       deleteRestaurant
POST   /api/admin/restaurants/:id/reset-password  resetOwnerPassword
GET    /api/admin/check-username        checkUsername (sans auth pour vérif live)

FRONTEND — Générer ces fichiers:

frontend/src/pages/admin/NewRestaurantPage.jsx:
Stepper visuel 4 étapes avec navigation Précédent/Suivant:

Étape 1 — Plan & Abonnement:
- Select plan [FREE, STARTER, PRO, PREMIUM] avec card descriptive des features au survol
- Select billing_period [Mensuel, Annuel]
- Toggle trial_enabled + input trial_days (conditionnel)
- DatePicker start_date
- Input amount_paid (DT) avec label "Montant payé (DT)"
- Input payment_ref
- Textarea admin_notes

Étape 2 — Informations Restaurant:
- Input name (required, max 80)
- Select type [Restaurant, Café, Bar, Hôtel, Fast-food, Autre]
- Input email, phone, address (textarea)
- Composant HorairesPicker: 7 jours, toggle Fermé, heure ouv/ferm
- ImageUploader logo: drag & drop + crop + preview
- ImageUploader banner: drag & drop + preview 1200x400
- Textarea short_description (max 160, compteur live)
- TemplateGallery: 6 miniatures + preview smartphone live au clic
- Input slug (auto-généré, éditable, check unicité debounce 500ms)

Étape 3 — Réseaux sociaux (optionnel):
- 6 inputs avec icônes: Facebook, Instagram, TripAdvisor, Google Maps, Site web, WhatsApp

Étape 4 — Compte Owner:
- Input owner_name, owner_username (check unicité live via /api/admin/check-username)
- Input owner_email, owner_phone
- Radio password_mode [auto-généré, manuel]
- Si auto: afficher MDP généré (bouton copier), si manuel: input password
- Select ui_language [Français, English, Italiano, العربية]
- Preview récapitulatif avant soumission

Validation Zod à chaque étape. Submit: POST /api/admin/restaurants (multipart/form-data).
Toast succès + redirect /admin/restaurants.

frontend/src/pages/admin/RestaurantsPage.jsx:
Tableau avec: nom, plan(badge coloré), statut, owner email, date création, expiration
Filtres: plan, statut, recherche texte
Bouton "Nouveau restaurant" → /admin/restaurants/new
Actions par ligne: Voir, Désactiver/Activer, Reset MDP, Supprimer (confirmation)

frontend/src/pages/admin/AdminDashboardPage.jsx:
Recharts: LineChart croissance restaurants 12 mois, PieChart répartition plans
Cards KPI: nb actifs, nb par plan, alertes expirés

frontend/src/components/admin/:
PlanSelector.jsx, OwnerAccountForm.jsx, TemplateGallery.jsx,
HorairesPicker.jsx, ImageUploader.jsx (avec react-image-crop)

LIVRABLES:
backend/src/models/{Restaurant,RestaurantHoraire,Subscription,AdminLog}.js
backend/src/middleware/planGuard.js
backend/src/controllers/adminController.js
backend/src/routes/admin.routes.js
backend/src/services/emailService.js (template welcome-owner 4 langues)
frontend/src/pages/admin/{NewRestaurantPage,RestaurantsPage,AdminDashboardPage}.jsx
frontend/src/components/admin/{PlanSelector,OwnerAccountForm,TemplateGallery,HorairesPicker,ImageUploader}.jsx

---

## MODULE 4 — Menu Builder (CRUD + DnD)

Tu es un expert React + @dnd-kit + Express + Sequelize. Génère le menu builder complet pour MenuQR.

STACK: React 18 + @dnd-kit/core + @dnd-kit/sortable + TanStack Query + Express + Sequelize + Cloudinary

RÈGLES:
- Noms et descriptions des plats en 4 langues: name_fr, name_en, name_it, name_ar
- Prix TOUJOURS en DT avec DECIMAL(10,3) en MySQL, formatDT() en affichage
- Toggle disponibilité → Socket.io broadcast instantané côté client menu

BACKEND — Modèles Sequelize:

backend/src/models/Menu.js:
id(UUID), restaurant_id(UUID FK), name(VARCHAR 80), is_active(BOOL true)
tableName: 'menus'

backend/src/models/Category.js:
id(UUID), menu_id(UUID FK), name_fr, name_en, name_it, name_ar (VARCHAR 80),
sort_order(INT 0), is_active(BOOL true), icon(VARCHAR 10 nullable)
tableName: 'categories'

backend/src/models/MenuItem.js:
id(UUID), category_id(UUID FK),
name_fr, name_en, name_it, name_ar (VARCHAR 80),
description_fr, description_en, description_it, description_ar (TEXT nullable),
price(DECIMAL 10,3), price_night(DECIMAL 10,3 nullable), price_happy_hour(DECIMAL 10,3 nullable),
happy_hour_start(TIME nullable), happy_hour_end(TIME nullable),
image_url(VARCHAR 500 nullable), is_available(BOOL true), is_featured(BOOL false),
prep_time_min(TINYINT nullable), disable_at(TIME nullable), enable_at(TIME nullable)
tableName: 'menu_items'

backend/src/models/SupplementGroup.js:
id(UUID), menu_item_id(UUID FK),
name_fr, name_en, name_it, name_ar (VARCHAR 80),
type(ENUM: radio,checkbox), min_select(TINYINT 0), max_select(TINYINT 1), is_required(BOOL false)
tableName: 'supplement_groups'

backend/src/models/SupplementOption.js:
id(UUID), group_id(UUID FK),
name_fr, name_en, name_it, name_ar (VARCHAR 80),
extra_price(DECIMAL 10,3 default 0.000), is_available(BOOL true)
tableName: 'supplement_options'

backend/src/controllers/menuController.js:
- CRUD complet: menus, categories, items, supplement groups, options
- exports.reorderCategories: PUT /api/categories/reorder
  body: [{ id, sort_order }] → bulk update dans transaction
- exports.toggleItemAvailability: PATCH /api/items/:id/toggle
  Après toggle → req.io.to('restaurant:' + restaurant_id).emit('menu:item_toggled', { item_id, is_available })
- exports.bulkUpdateStatus: PUT /api/items/bulk-status
  body: { ids: [...], is_available: bool } → update where id IN(ids)
- exports.uploadItemImage: POST /api/items/:id/image
  Multer → Cloudinary (resize 800x600 max, format webp) → update image_url

backend/src/routes/menus.routes.js (verifyToken + checkRole OWNER,MANAGER):
GET/POST        /api/menus
GET/PUT/DELETE  /api/menus/:id
GET/POST        /api/menus/:menuId/categories
PUT             /api/categories/:id
DELETE          /api/categories/:id
PUT             /api/categories/reorder
GET/POST        /api/categories/:id/items
GET/PUT/DELETE  /api/items/:id
PATCH           /api/items/:id/toggle
PUT             /api/items/bulk-status
POST            /api/items/:id/image
GET/POST        /api/items/:id/supplement-groups
GET/PUT/DELETE  /api/supplement-groups/:id
GET/POST        /api/supplement-groups/:id/options
GET/PUT/DELETE  /api/supplement-options/:id

FRONTEND — Générer ces fichiers:

frontend/src/pages/dashboard/MenuPage.jsx:
- Liste des menus du restaurant (cards)
- Bouton "Nouveau menu", toggle actif/inactif
- Clic sur menu → vue catégories + plats

frontend/src/components/menu/CategoryList.jsx (@dnd-kit):
- DndContext + SortableContext pour les catégories
- Chaque catégorie: useSortable(id)
- Drag handle visible, animation de transition
- onDragEnd → calculer nouveaux sort_order → PUT /api/categories/reorder (debounce 500ms)
- Bouton +Catégorie, toggle actif/inactif, badge nb plats actifs

frontend/src/components/menu/MenuItemCard.jsx:
- Carte plat avec: image (lazy load), nom (langue active), prix formatDT(item.price)
- Badge "Populaire" si is_featured, badge "Indisponible" si !is_available
- Switch disponibilité → toggle instantané + Socket.io
- Drag handle pour réordonnement inter-catégorie
- Actions: éditer, supprimer

frontend/src/components/menu/MenuItemForm.jsx (Drawer):
- Onglets langue: FR | EN | IT | AR
- Dans chaque onglet: input name_{lang}, textarea description_{lang}
- Champs communs: prix DT (DECIMAL 10,3), image upload (preview), prep_time_min
- Toggle is_available, toggle is_featured
- Section prix variables: prix_nuit, happy_hour + horaires (conditionnel)
- Section suppléments: SupplementManager intégré

frontend/src/components/menu/SupplementManager.jsx:
- Liste des groupes de suppléments du plat
- CRUD groupe: nom (4 langues), type radio/checkbox, min/max, is_required
- CRUD options: nom (4 langues), extra_price formatDT(), is_available

frontend/src/components/menu/BulkActions.jsx:
- Checkbox sélection multiple des plats
- Barre d'actions en bas: "Activer sélection", "Désactiver sélection", "Supprimer sélection"
- Confirmation avant suppression

LIVRABLES:
backend/src/models/{Menu,Category,MenuItem,SupplementGroup,SupplementOption}.js
backend/src/controllers/menuController.js
backend/src/routes/menus.routes.js
frontend/src/pages/dashboard/MenuPage.jsx
frontend/src/components/menu/{CategoryList,MenuItemCard,MenuItemForm,SupplementManager,BulkActions}.jsx

---

## MODULE 5 — Interface Client QR (Menu Digital Public)

Tu es un expert React + Socket.io client + i18next. Génère l'interface client complète du menu digital pour MenuQR.

RÈGLES:
- Accès 100% public — AUCUNE authentification requise
- Prix TOUJOURS via formatDT(item.price, i18n.language)
- TOUJOURS t() pour tous les textes
- RTL automatique si langue = 'ar'
- 6 templates CSS via data-template sur <html> ou <body>

BACKEND — Routes publiques (sans verifyToken):

backend/src/controllers/publicController.js:
- getRestaurantInfo: GET /api/public/:slug → restaurant sans données sensibles
- verifyTable: GET /api/public/:slug/table/:qr_token → vérifier token, retourner table + salle
  Créer entrée QRScan: { table_id, ip_address: req.ip, user_agent: req.headers['user-agent'] }
- getMenu: GET /api/public/:slug/menu → menus actifs avec catégories et plats disponibles
  Uniquement is_active=true et is_available=true. Include: SupplementGroup, SupplementOption
- createOrder: POST /api/public/:slug/orders
  Créer Order + OrderItems + OrderItemSupplements dans transaction
  Calculer total = sum(items × prix + suppléments)
  Après création → req.io.to('restaurant:' + restaurant_id).emit('order:new', payload)
- trackOrder: GET /api/public/orders/:id → statut + items (sans données restaurant sensibles)
- createCallWaiter: POST /api/public/:slug/call-waiter
  Vérifier: 1 seul appel PENDING par table à la fois
  Émettre → req.io.to('restaurant:' + restaurant_id).emit('call_waiter:new', payload)
- getReservationSlots: GET /api/public/:slug/reservations/slots?date=&zone=
- createReservation: POST /api/public/:slug/reservations

backend/src/routes/public.routes.js (sans verifyToken):
Toutes les routes listées ci-dessus.

FRONTEND — Générer ces fichiers:

frontend/src/pages/client/ClientMenuPage.jsx:
- useParams: { slug, qrToken }
- Appels API: getRestaurantInfo, verifyTable, getMenu
- Appliquer template: document.documentElement.setAttribute('data-template', restaurant.template_id)
- Appliquer langue restaurant: i18n.changeLanguage(restaurant.default_language)
- Gérer état panier via useCart hook
- Composer: MenuHeader + CategoryNav + sections plats + CartDrawer + CallWaiterButton

frontend/src/components/client/MenuHeader.jsx:
- Image bannière (lazy load) avec overlay sombre
- Logo restaurant centré ou top selon template
- Nom restaurant (t() pour labels, valeurs dynamiques)
- Short description
- Indicateur "Table N°{table.name}"
- LanguageSwitcher: boutons FR | EN | IT | AR avec flag emoji
  onClick → i18n.changeLanguage(lang) → document.dir = lang==='ar' ? 'rtl' : 'ltr'

frontend/src/components/client/CategoryNav.jsx:
- Barre sticky en haut après header
- Pills/onglets pour chaque catégorie active
- Scroll horizontal smooth sur mobile
- Clic → scrollIntoView de la section catégorie (ancre)
- Highlight de la catégorie visible (IntersectionObserver)

frontend/src/components/client/DishCard.jsx:
- Photo (lazy load, fallback placeholder)
- Nom: item['name_' + i18n.language] || item.name_fr
- Description courte (2 lignes max, truncate)
- Prix: formatDT(item.price, i18n.language)
- Badge "Populaire" si is_featured (bg accent)
- Badge "Indisponible" si !is_available (grisé, pas cliquable)
- Bouton + animé pour ajouter au panier
- Clic sur carte → ouvrir DishModal

frontend/src/components/client/DishModal.jsx (bottom sheet mobile):
- Photo grande format
- Nom + description complète dans la langue active
- Groupes de suppléments:
  - Type radio → RadioGroup (1 seul choix)
  - Type checkbox → Checkboxes (min/max respectés)
  - is_required → validation avant "Ajouter"
  - extra_price → formatDT(option.extra_price) affiché si > 0
- Compteur quantité (- / N / +)
- Textarea commentaire libre
- Total calculé: (prix_base + extras) × quantité → formatDT()
- Bouton "Ajouter au panier" → addToCart({ item, supplements, quantity, note, totalPrice })

frontend/src/hooks/useCart.js (Zustand store):
- State: { items: [] }
- Actions: addToCart, removeFromCart, updateQuantity, clearCart
- Computed: totalItems, totalPrice (en nombre brut pour formatDT() côté composant)
- Persist: sessionStorage (vide à la fermeture de l'onglet)

frontend/src/components/client/CartDrawer.jsx:
- Bouton flottant bas-droite: icône panier + badge nombre articles
- Slide-up drawer:
  - Liste articles: photo mini, nom, suppléments choisis, prix formatDT(), compteur
  - Sous-total par article formatDT()
  - Total formatDT(totalPrice)
  - Textarea note globale commande
  - Bouton "Commander" → POST /api/public/:slug/orders
  - Après succès: clearCart + afficher confirmation + redirect /:slug/order/:id

frontend/src/components/client/CallWaiterButton.jsx:
- Bouton flottant bas-gauche (icône cloche)
- Bottom sheet au clic:
  3 options: "Appeler le serveur" (WAITER), "Demander l'addition" (CHECK), "Autre" (OTHER)
  Pour OTHER: textarea message optionnel
  Bouton confirmer → POST /api/public/:slug/call-waiter
  Cooldown 30 secondes (anti-spam) avec timer visible
  Feedback: "Votre demande a été envoyée ✓"

frontend/src/pages/client/OrderTrackerPage.jsx:
- useParams: { slug, orderId }
- useQuery polling toutes les 10s: GET /api/public/orders/:orderId
- OU Socket.io: écouter 'order:status_changed' pour orderId
- Progress bar: PENDING → CONFIRMED → PREPARING → READY → SERVED
- Récapitulatif articles commandés avec prix formatDT()
- Message de paiement sur place en DT

frontend/src/styles/globals.css — 6 templates CSS:
Variables CSS via [data-template="nom_template"] pour:
aurora_glass, bento_menu, classic_theme, dark_sleek, editorial_menu, modern_theme
(couleurs --bg-primary, --accent, --text-primary, --card-bg, --card-border)

LIVRABLES:
backend/src/controllers/publicController.js
backend/src/routes/public.routes.js
backend/src/models/QRScan.js
frontend/src/pages/client/{ClientMenuPage,OrderTrackerPage}.jsx
frontend/src/components/client/{MenuHeader,CategoryNav,DishCard,DishModal,CartDrawer,CallWaiterButton}.jsx
frontend/src/hooks/useCart.js
frontend/src/styles/globals.css (variables 6 templates)
public/locales/{fr,en,it,ar}/translation.json (sections: menu, cart, call_waiter, order)

---

## MODULE 6 — Commandes Temps Réel (Kanban + Socket.io)

Tu es un expert React + Socket.io + Express + ESC/POS. Génère le module commandes temps réel pour MenuQR.

BACKEND — Modèles et controllers:

backend/src/models/Order.js:
id(UUID), restaurant_id(UUID FK), table_id(UUID FK), staff_id(UUID FK nullable),
status(ENUM: PENDING,CONFIRMED,PREPARING,READY,SERVED,CLOSED,CANCELLED default PENDING),
total(DECIMAL 10,3), payment_method(ENUM: CASH,CARD,PENDING default PENDING),
notes(TEXT nullable), created_at, updated_at

backend/src/models/OrderItem.js:
id(UUID), order_id(UUID FK), menu_item_id(UUID FK nullable),
quantity(TINYINT), unit_price(DECIMAL 10,3), name_snapshot(VARCHAR 80), notes(TEXT nullable)

backend/src/models/OrderItemSupplement.js:
id(UUID), order_item_id(UUID FK), supplement_option_id(UUID FK nullable),
option_name_snapshot(VARCHAR 80), extra_price(DECIMAL 10,3)

backend/src/models/OrderStatusLog.js:
id(UUID), order_id(UUID FK), old_status, new_status,
changed_by(UUID FK nullable), created_at(DATETIME)
timestamps: false

backend/src/controllers/orderController.js:

exports.getOrders:
Filtres: status, table_id, date_from, date_to
WHERE restaurant_id = req.user.restaurant_id (tenant isolation obligatoire)
Include: OrderItem, Table

exports.updateOrderStatus:
PUT /api/orders/:id/status → body: { status }
Vérifier transitions valides: PENDING→CONFIRMED→PREPARING→READY→SERVED→CLOSED
Créer OrderStatusLog
Émettre: req.io.to('restaurant:' + restaurant_id).emit('order:status_changed', { orderId: id, newStatus: status })
Si SERVED → Table.update({ status: 'EN_ATTENTE' }) pour prompt caissier

exports.cancelOrder:
PUT /api/orders/:id/cancel → body: { reason }
status = CANCELLED, Émettre order:cancelled

exports.printOrder:
POST /api/orders/:id/print
Utiliser printerService.printOrder(order, restaurant)
Format ticket: en-tête restaurant, table, date/heure, articles + options, total formatDT()

backend/src/services/printerService.js:
- Utiliser node-thermal-printer
- printOrder(order, restaurant): ticket commande
- printReceipt(payment, order, restaurant): ticket paiement
- Gestion erreur si imprimante déconnectée (throw avec message clair)

backend/src/routes/orders.routes.js (verifyToken):
GET    /api/orders                     verifyToken, getOrders
POST   /api/orders                     verifyToken, checkRole(OWNER,MANAGER,STAFF), createOrder
GET    /api/orders/:id                 verifyToken, getOrderById
PUT    /api/orders/:id/status          verifyToken, checkRole(OWNER,MANAGER,STAFF), updateOrderStatus
PUT    /api/orders/:id/cancel          verifyToken, checkRole(OWNER,MANAGER), cancelOrder
POST   /api/orders/:id/print           verifyToken, printOrder

FRONTEND:

frontend/src/hooks/useOrdersSocket.js:
- Connexion Socket.io avec restaurantId
- Écouter: order:new, order:status_changed, order:cancelled
- on order:new → toast.success + son (new Audio('/sounds/ding.mp3').play()) + queryClient.invalidateQueries(['orders'])
- on order:status_changed → queryClient.setQueryData pour mettre à jour la carte
- Retourner: { socket, isConnected }

frontend/src/pages/dashboard/OrdersPage.jsx:
- useOrdersSocket(user.restaurant_id)
- useQuery: GET /api/orders?status=PENDING,CONFIRMED,PREPARING,READY,SERVED
- Layout Kanban: 5 colonnes
  PENDING="En attente", CONFIRMED="Confirmée", PREPARING="En préparation", READY="Prête", SERVED="Servie"
- DnD entre colonnes via @dnd-kit: onDragEnd → PUT /api/orders/:id/status
- Filtres en haut: par table, par période (date picker)
- Badge rouge sur l'onglet/menu si commandes PENDING non traitées

frontend/src/components/orders/OrderCard.jsx:
- Numéro commande (derniers 6 chars de l'id)
- Nom de la table
- Heure de création (date-fns: formatDistance ou format)
- Nb articles + résumé (ex: "Tajine × 2, Salade × 1")
- Total: formatDT(order.total)
- Boutons action selon statut:
  PENDING → "Accepter" (→ CONFIRMED)
  CONFIRMED → "En préparation" (→ PREPARING)
  PREPARING → "Prête" (→ READY)
  READY → "Servie" (→ SERVED)
  Toujours: "Voir détail", "Annuler" (OWNER/MANAGER)
- Clic → ouvrir OrderDetail

frontend/src/components/orders/OrderDetail.jsx (Sheet):
- Détail complet: table, serveur, date, statut actuel
- Liste items: nom (langue fr), quantité, options choisies, prix unitaire formatDT(), sous-total formatDT()
- Note client si présente
- Timeline des changements de statut (OrderStatusLog)
- Total: formatDT(order.total)
- Boutons: changer statut, imprimer ticket, annuler

LIVRABLES:
backend/src/models/{Order,OrderItem,OrderItemSupplement,OrderStatusLog}.js
backend/src/controllers/orderController.js
backend/src/routes/orders.routes.js
backend/src/services/printerService.js
frontend/src/pages/dashboard/OrdersPage.jsx
frontend/src/components/orders/{OrderCard,OrderDetail}.jsx
frontend/src/hooks/useOrdersSocket.js
public/sounds/ding.mp3 (note: indiquer d'ajouter un fichier son)

---

## MODULE 7 — Tables, Plan de Salle & QR Codes

Tu es un expert React + @dnd-kit + qrcode + Express. Génère le module tables et plan de salle pour MenuQR.

ZONES: SALLE | TERRASSE | ÉTAGE (cohérent avec le module réservations)

STATUTS TABLES avec couleurs:
LIBRE       → #27AE60 (vert)
OCCUPEE     → #E67E22 (orange)
RESERVEE    → #3498DB (bleu)
EN_ATTENTE  → #F1C40F (jaune) — Call Waiter actif
DESACTIVEE  → #95A5A6 (gris)

BACKEND:

backend/src/models/Room.js:
id(UUID), restaurant_id(UUID FK), name(VARCHAR 60), capacity(SMALLINT),
zone(ENUM: SALLE,TERRASSE,ETAGE default SALLE), menu_id(UUID FK nullable)

backend/src/models/Table.js:
id(UUID), room_id(UUID FK), restaurant_id(UUID FK),
number(TINYINT UNSIGNED), name(VARCHAR 30),
capacity(TINYINT UNSIGNED), status(ENUM statuts ci-dessus default LIBRE),
qr_token(UUID UNIQUE), qr_url(VARCHAR 500),
position_x(INT default 0), position_y(INT default 0), is_active(BOOL true)

backend/src/models/QRScan.js:
id(UUID), table_id(UUID FK), ip_address(VARCHAR 45), user_agent(TEXT), scanned_at(DATETIME)
timestamps: false

backend/src/services/qrcodeService.js:
- generateQRCode(table, restaurant):
  url = APP_URL + '/' + restaurant.slug + '/table/' + table.qr_token
  Générer QR avec qrcode en buffer PNG
  Si restaurant.logo_url: utiliser sharp pour insérer logo au centre (20% de la taille du QR)
  Uploader vers Cloudinary → retourner url publique
  Mettre à jour table.qr_url
- exportQRBatch(tables, restaurant): générer ZIP avec tous les QR en PNG

backend/src/controllers/tableController.js:
- CRUD rooms et tables
- createTable: générer qr_token = uuid(), appeler qrcodeService.generateQRCode
- updateTablePosition: PATCH /api/tables/:id/position → position_x, position_y
  (appelé après drag & drop dans le plan, debounce 500ms)
- updateTableStatus: PUT /api/tables/:id/status
  Émettre: req.io.to('restaurant:' + restaurant_id).emit('table:status_changed', { tableId, newStatus })
- mergeTables: POST /api/tables/merge
  body: { source_table_id, target_table_id }
  Déplacer toutes les commandes PENDING/PREPARING/READY de source → target
  source → status LIBRE
- transferOrder: POST /api/tables/:id/transfer
  body: { order_id, target_table_id }
- regenerateQR: POST /api/tables/:id/qr/regenerate
  Nouveau qr_token UUID → qrcodeService → nouvelle url

FRONTEND:

frontend/src/pages/dashboard/TablesPage.jsx:
- Onglets par salle (rooms)
- Bouton "Ajouter salle" + "Ajouter table"
- Plan de salle visuel + liste des tables

frontend/src/components/tables/FloorPlan.jsx (@dnd-kit):
- Grille 10×10 (ou canvas) représentant la salle
- Chaque table = draggable badge coloré selon statut
- DnD: useDraggable pour chaque table, onDragEnd → PATCH /api/tables/:id/position (debounce 500ms)
- Clic sur table → ouvrir TableDetail Sheet

frontend/src/components/tables/TableBadge.jsx:
- Badge coloré: couleur selon statut
- Affiche: numéro table, capacité, statut icône
- Indicateur Call Waiter si EN_ATTENTE (animation pulse)

frontend/src/components/tables/TableDetail.jsx (Sheet):
- En-tête: numéro, nom, capacité, zone, statut
- Si OCCUPEE: commande en cours (articles, total formatDT())
- Si EN_ATTENTE: appel Call Waiter (type, heure)
- Historique 5 dernières commandes
- Actions: changer statut, libérer table, imprimer addition, fusionner
- Bouton "Voir le QR code": affiche QR + boutons export PNG/PDF

frontend/src/components/tables/QRCodeGenerator.jsx:
- Afficher le QR de la table (image depuis qr_url)
- Boutons: Télécharger PNG, Télécharger PDF, Régénérer QR
- Preview avec logo du restaurant au centre

LIVRABLES:
backend/src/models/{Room,Table,QRScan}.js
backend/src/controllers/tableController.js
backend/src/routes/tables.routes.js
backend/src/services/qrcodeService.js
frontend/src/pages/dashboard/TablesPage.jsx
frontend/src/components/tables/{FloorPlan,TableBadge,TableDetail,QRCodeGenerator}.jsx

---

## MODULE 8 — Call Waiter

Tu es un expert React + Socket.io + Express. Génère le module Call Waiter complet pour MenuQR.

TYPES: WAITER (appeler serveur) | CHECK (demander addition) | OTHER (autre + texte)
STATUTS: PENDING → IN_PROGRESS → DONE

BACKEND:

backend/src/models/CallWaiter.js:
id(UUID), restaurant_id(UUID FK), table_id(UUID FK),
type(ENUM: WAITER,CHECK,OTHER), message(TEXT nullable),
status(ENUM: PENDING,IN_PROGRESS,DONE default PENDING),
created_at(DATETIME), resolved_at(DATETIME nullable), resolved_by(UUID FK nullable)
timestamps: false

backend/src/controllers/callWaiterController.js:
- createCallWaiter (route publique):
  Vérifier: 1 seul appel PENDING par table → 409 si doublon
  Créer CallWaiter
  Émettre: req.io.to('restaurant:' + restaurant_id).emit('call_waiter:new', { id, table_number, type, message, created_at })
  Table.update({ status: 'EN_ATTENTE' }, { where: { id: table_id } })
- getCallWaiters: liste avec filtres status + date, WHERE restaurant_id (tenant)
- resolveCallWaiter:
  status = DONE, resolved_at = now, resolved_by = req.user.id
  Table.update({ status: 'LIBRE' ou 'OCCUPEE' selon présence de commandes actives })
  Émettre: table:status_changed
- getStats: nb appels par type, temps moyen traitement

backend/src/routes/callWaiter.routes.js:
POST /api/public/:slug/call-waiter   publicController (sans auth)
GET  /api/call-waiter                verifyToken, checkRole(OWNER,MANAGER,STAFF), getCallWaiters
PUT  /api/call-waiter/:id/resolve    verifyToken, checkRole(OWNER,MANAGER,STAFF), resolveCallWaiter
GET  /api/call-waiter/stats          verifyToken, checkRole(OWNER,MANAGER), getStats

FRONTEND — Client (déjà dans MODULE 5, rappel):
- CallWaiterButton.jsx: bouton flottant + bottom sheet + cooldown 30s
  Alerte timeout: si PENDING depuis > 5 min → badge rouge clignotant

FRONTEND — Dashboard:

frontend/src/components/dashboard/CallWaiterWidget.jsx:
- Liste des appels PENDING en temps réel via Socket.io (call_waiter:new)
- Son d'alerte à chaque nouvel appel (Audio API)
- Chaque appel: numéro table, type (icône), heure, message si OTHER
- Bouton "Traiter" → PUT /api/call-waiter/:id/resolve
- Badge rouge animé sur l'icône cloche si > 0 appels
- Appels > 5 min sans réponse: fond rouge clignotant

frontend/src/pages/dashboard/CallWaiterPage.jsx:
- Tableau complet avec filtres: statut, table, type, période
- Statistiques: nb appels aujourd'hui, temps moyen traitement
- Export CSV

LIVRABLES:
backend/src/models/CallWaiter.js
backend/src/controllers/callWaiterController.js
backend/src/routes/callWaiter.routes.js
frontend/src/components/dashboard/CallWaiterWidget.jsx
frontend/src/pages/dashboard/CallWaiterPage.jsx

---

## MODULE 9 — Réservations Complètes

Tu es un expert React + Express + node-cron. Génère le module réservations complet pour MenuQR.

ZONES OBLIGATOIRES: SALLE | TERRASSE | ÉTAGE
CHAMPS CLIENT OBLIGATOIRES: first_name, last_name, email, phone, date, time_slot, covers, zone
CHAMP OPTIONNEL: notes (max 500 chars)
PAIEMENT: AUCUN — sur place uniquement

BACKEND:

backend/src/models/Reservation.js:
id(UUID), restaurant_id(UUID FK), table_id(UUID FK nullable),
first_name(VARCHAR 80 NOT NULL), last_name(VARCHAR 80 NOT NULL),
email(VARCHAR 191 NOT NULL), phone(VARCHAR 30 NOT NULL),
date(DATE NOT NULL), time_slot(TIME NOT NULL),
covers(TINYINT UNSIGNED NOT NULL),
zone(ENUM: SALLE,TERRASSE,ETAGE NOT NULL),
notes(TEXT nullable),
status(ENUM: EN_ATTENTE,CONFIRMEE,RAPPEL_ENVOYE,ARRIVEE,TERMINEE,
             ANNULEE_CLIENT,ANNULEE_RESTAURANT,NO_SHOW default EN_ATTENTE),
cancel_token(VARCHAR 255 UNIQUE nullable),
cancel_reason(TEXT nullable),
confirmed_at(DATETIME nullable),
reminder_sent(TINYINT default 0)

backend/src/models/ReservationSettings.js:
id(UUID), restaurant_id(UUID FK UNIQUE),
zones_enabled(JSON default '["SALLE"]'),
capacity_salle(SMALLINT default 50), capacity_terrasse(SMALLINT default 30), capacity_etage(SMALLINT default 20),
open_slots(JSON NOT NULL — ex: [{"start":"12:00","end":"14:30"},{"start":"19:00","end":"22:30"}]),
service_duration_min(SMALLINT default 90),
min_hours_before(TINYINT default 2), max_days_ahead(TINYINT default 30),
auto_confirm(TINYINT default 0),
reminder_j1_enabled(TINYINT default 1), reminder_j1_channel(ENUM: EMAIL,SMS,BOTH default EMAIL),
reminder_h2_enabled(TINYINT default 0), reminder_h2_channel(ENUM: SMS,WHATSAPP default SMS),
confirmation_message_fr/en/it/ar (TEXT nullable),
cancellation_policy(TEXT nullable), is_active(TINYINT default 1)

backend/src/controllers/reservationController.js:

exports.getAvailableSlots:
- GET /api/public/:slug/reservations/slots?date=&zone=
- Charger ReservationSettings du restaurant
- Si !is_active ou zone non dans zones_enabled → retourner []
- Générer tous les créneaux depuis open_slots (step = 30min)
- Pour chaque créneau: compter réservations existantes pour date + zone + time_slot
  Statuts à compter: EN_ATTENTE, CONFIRMEE, RAPPEL_ENVOYE, ARRIVEE
- Comparer avec capacité de la zone
- Retourner: [{ time: "12:00", available: 20, is_full: false }, ...]

exports.createReservation (public):
- POST /api/public/:slug/reservations
- Valider: tous les champs obligatoires, format email, format phone
- Vérifier disponibilité une dernière fois (race condition)
- Vérifier min_hours_before et max_days_ahead
- cancel_token = jwt.sign({ purpose: 'cancel', id: reservation.id }, JWT_SECRET, { expiresIn: '48h' })
- status = settings.auto_confirm ? 'CONFIRMEE' : 'EN_ATTENTE'
- Créer Reservation
- Envoyer email confirmation: emailService.sendReservationConfirmation(reservation, restaurant, cancel_token, lang)
  Email inclut: récapitulatif (prénom, nom, date, heure, couverts, zone), lien annulation
- Émettre: req.io.to('restaurant:' + restaurant_id).emit('reservation:new', { id, first_name, last_name, date, time_slot, covers, zone })
- Réponse: { data: { id: reservation.id, status }, message: 'Réservation créée' }

exports.cancelViaToken (public):
- GET /api/public/reservations/cancel?token=
- Vérifier JWT token (purpose: 'cancel')
- Si statut CONFIRMEE ou EN_ATTENTE → status = ANNULEE_CLIENT
- Envoyer email confirmation annulation
- Libérer la table si assignée

exports.getReservations (dashboard):
- Filtres: date, status, zone, search (nom/email/téléphone)
- Pagination 50/page
- Include: table si assignée

exports.updateReservationStatus:
- PUT /api/reservations/:id/status → body: { status, reason? }
- Si status = ARRIVEE → Table.update({ status: 'OCCUPEE' }) si table assignée
- Si status = TERMINEE ou ANNULEE → libérer table
- Envoyer email selon transition (confirmation, refus avec motif)

exports.assignTable:
- PUT /api/reservations/:id/assign-table → body: { table_id }
- Table.update({ status: 'RESERVEE' })

exports.getSettings / exports.updateSettings

backend/src/jobs/cron.js:
const cron = require('node-cron');

// Rappels J-1 tous les jours à 10h00
cron.schedule('0 10 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const reservations = await Reservation.findAll({
    where: { date: dateStr, status: 'CONFIRMEE', reminder_sent: 0 },
    include: [{ model: Restaurant, include: [ReservationSettings] }]
  });
  
  for (const r of reservations) {
    const settings = r.Restaurant.ReservationSetting;
    if (settings?.reminder_j1_enabled) {
      if (['EMAIL','BOTH'].includes(settings.reminder_j1_channel)) {
        await emailService.sendReservationReminder(r, 'J1');
      }
      if (['SMS','BOTH'].includes(settings.reminder_j1_channel)) {
        await smsService.sendReminder(r, 'J1');
      }
    }
    await r.update({ reminder_sent: 1, status: 'RAPPEL_ENVOYE' });
  }
});

// Rappels H-2 toutes les heures
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  // ... chercher réservations dans 2h et envoyer rappels
});

FRONTEND:

frontend/src/pages/client/ReservationFormPage.jsx:
Route: /:slug/reservation — public, aucune auth
- useParams: { slug }
- Charger infos restaurant + settings
- useForm React Hook Form + Zod validation
- Formulaire:
  - Input first_name (required, min 2)
  - Input last_name (required, min 2)
  - Input email (required, email valide)
  - Input phone (required, format +216...)
  - DatePicker date (min: aujourd'hui + min_hours_before, max: today + max_days_ahead)
  - Select zone: options selon settings.zones_enabled
    [SALLE="Salle", TERRASSE="Terrasse", ÉTAGE="Étage"]
  - Select time_slot: chargé dynamiquement quand date + zone sélectionnés
    via useQuery(['slots', date, zone]) → GET /api/public/:slug/reservations/slots
    Options désactivées si is_full=true avec texte "Complet"
  - Input covers (number, min 1)
  - Textarea notes (optionnel, max 500, compteur)
  - Récapitulatif avant submit
  - Bouton: t('reservation.submit')
- onSuccess: afficher card confirmation avec récapitulatif
- Tous les labels via t() — JAMAIS hardcodés
- RTL si i18n.language = 'ar'

frontend/src/pages/dashboard/ReservationsPage.jsx:
- 3 onglets: Calendrier | Liste | Paramètres

Onglet Calendrier:
- Vue semaine/mois (utiliser une lib calendrier simple ou CSS grid)
- Créneaux colorés selon statut
- Clic → ouvrir detail sheet

Onglet Liste:
- Tableau: Prénom + Nom, Email, Téléphone, Date, Heure, Couverts, Zone (badge), Statut (badge coloré)
- Filtres: date picker, statut, zone (SALLE/TERRASSE/ÉTAGE)
- Recherche: par nom, email ou téléphone
- Actions par ligne: Confirmer, Refuser, Arrivé, No-show, Annuler, Attribuer table
- Export CSV

Onglet Paramètres (/dashboard/reservations/settings):
- Zones activées (multi-select: SALLE, TERRASSE, ÉTAGE)
- Capacité par zone (3 inputs number)
- Créneaux horaires (add/remove: start + end time)
- Délai minimum avant réservation
- Délai maximum à l'avance
- Toggle validation auto
- Toggles rappels J-1 et H-2 avec canal
- Messages de confirmation en 4 langues (onglets FR/EN/IT/AR)
- Toggle module actif/inactif

frontend/src/components/reservations/:
ReservationForm.jsx, SlotPicker.jsx, ReservationCalendar.jsx,
ReservationTable.jsx, StatusBadge.jsx, ZoneBadge.jsx

LIVRABLES:
backend/src/models/{Reservation,ReservationSettings}.js
backend/src/controllers/reservationController.js
backend/src/routes/reservations.routes.js
backend/src/jobs/cron.js
backend/src/services/emailService.js (templates réservation 4 langues)
frontend/src/pages/client/ReservationFormPage.jsx
frontend/src/pages/dashboard/ReservationsPage.jsx
frontend/src/components/reservations/{ReservationForm,SlotPicker,ReservationCalendar,ReservationTable,StatusBadge,ZoneBadge}.jsx
public/locales/{fr,en,it,ar}/translation.json (section reservation complète)

---

## MODULE 10 — POS & Caisse

Tu es un expert React + Express + ESC/POS + PDFKit. Génère le module POS et caisse pour MenuQR.

DEVISE OBLIGATOIRE: Dinar Tunisien (DT) — formatDT() sur TOUS les montants affichés
PAIEMENT: ESPÈCES ou CARTE BANCAIRE physique UNIQUEMENT — AUCUN paiement en ligne

BACKEND:

backend/src/models/Payment.js:
id(UUID), order_id(UUID FK), method(ENUM: CASH,CARD),
amount(DECIMAL 10,3), change_given(DECIMAL 10,3 default 0.000),
discount_amount(DECIMAL 10,3 default 0.000), discount_type(ENUM: PERCENT,FIXED nullable),
processed_by(UUID FK), processed_at(DATETIME)

backend/src/models/ServiceClose.js:
id(UUID), restaurant_id(UUID FK), date(DATE),
total_cash(DECIMAL 10,3 default 0.000), total_card(DECIMAL 10,3 default 0.000),
total_orders(INT default 0), total_revenue(DECIMAL 10,3 default 0.000),
notes(TEXT nullable), closed_by(UUID FK), created_at(DATETIME)
timestamps: false

backend/src/services/pdfService.js (PDFKit):
exports.generateReceipt(payment, order, restaurant):
- En-tête: nom restaurant, adresse, téléphone
- Corps: liste articles (name_snapshot, quantité, prix unit formatDT(), sous-total formatDT())
- Pied: total HT, TVA 19%, total TTC formatDT(), mode paiement, monnaie rendue formatDT() si CASH
- Numéro reçu, date/heure, "Merci pour votre visite"
- Retourner buffer PDF

exports.generateServiceReport(serviceClose, restaurant):
- Rapport journalier avec totaux en DT

backend/src/controllers/posController.js:

exports.getActiveTables:
- GET /api/pos/active-tables
- Tables avec statut OCCUPEE ou EN_ATTENTE + commande active
- Include: current order (PENDING,CONFIRMED,PREPARING,READY,SERVED)

exports.getTableOrder:
- GET /api/pos/orders/:tableId
- Commande active de la table avec tous les items + suppléments
- Calcul: subtotal par item (unit_price × quantity + extras), total DT

exports.processPayment:
- POST /api/pos/payments
- body: { order_id, method, amount_received, discount_amount?, discount_type? }
- Si CASH: change_given = amount_received - total (arrondi 3 décimales DT)
- Si discount: recalculer total
- Créer Payment
- Order.update({ status: 'CLOSED', payment_method: method })
- Table.update({ status: 'LIBRE' })
- req.io.to(...).emit('table:status_changed', { tableId, newStatus: 'LIBRE' })
- Retourner payment + ordre mis à jour

exports.printPreCheck / exports.printReceipt:
- POST /api/pos/print/pre-check/:orderId
- POST /api/pos/print/receipt/:paymentId
- Appeler printerService (ESC/POS) + pdfService (PDF)

exports.closeService:
- POST /api/pos/service-close
- Calculer totaux CASH et CARD du jour pour le restaurant
- Créer ServiceClose
- Retourner rapport

exports.getServiceReport:
- GET /api/pos/service-close/:id/report
- Retourner PDF (buffer → res.setHeader('Content-Type', 'application/pdf'))

FRONTEND:

frontend/src/pages/dashboard/POSPage.jsx:
Layout en 2 colonnes:
Colonne gauche (1/3): liste tables actives
Colonne droite (2/3): détail commande sélectionnée + paiement

frontend/src/components/pos/TableSelector.jsx:
- Grille des tables OCCUPEE / EN_ATTENTE
- Badge: numéro table + total actuel formatDT()
- Clic → sélectionner table → charger commande

frontend/src/components/pos/OrderSummary.jsx:
- Liste des articles: nom, quantité, options, prix unit formatDT(), sous-total formatDT()
- Boutons modifier quantité, supprimer article
- Ligne remise (si appliquée): - formatDT(discount)
- Total: formatDT(order.total)
- Bouton "Pré-addition" (imprimer avant paiement)
- Bouton "Payer" → ouvrir PaymentModal

frontend/src/components/pos/PaymentModal.jsx:
- 2 modes: ESPÈCES / CARTE (toggle ou 2 boutons)

Mode ESPÈCES:
- Total à payer: formatDT(total) (grand, bien visible)
- Input "Montant reçu (DT)": number, step 0.001
- Calcul temps réel: "Monnaie à rendre: formatDT(reçu - total)"
- Si reçu < total: bouton désactivé + message "Montant insuffisant"
- Bouton "Valider le paiement"

Mode CARTE:
- Total à payer: formatDT(total)
- Message: "Procédez au paiement sur le terminal"
- Bouton "Confirmer le paiement" (confirmation manuelle)

Section remise (OWNER/MANAGER seulement):
- Input % ou montant fixe DT
- Nouveau total: formatDT(total - discount)

Après paiement:
- Toast "Paiement validé" + formatDT(montant)
- Si CASH: afficher "Monnaie rendue: formatDT(change)" en grand
- Bouton "Imprimer le reçu" → POST /api/pos/print/receipt
- Auto fermer après 5 secondes

frontend/src/pages/dashboard/ServiceClosePage.jsx:
- Récapitulatif du service: période, nb commandes, CA cash formatDT(), CA carte formatDT(), Total formatDT()
- Bouton "Clôturer le service" avec confirmation
- Bouton "Télécharger rapport PDF"

LIVRABLES:
backend/src/models/{Payment,ServiceClose}.js
backend/src/controllers/posController.js
backend/src/routes/pos.routes.js
backend/src/services/pdfService.js
frontend/src/pages/dashboard/{POSPage,ServiceClosePage}.jsx
frontend/src/components/pos/{TableSelector,OrderSummary,PaymentModal}.jsx

---

## MODULE 11 — Abonnements SaaS & Facturation

Tu es un expert Express + PDFKit + Sequelize. Génère le module abonnements pour MenuQR.

NOTE: Les abonnements sont créés par le Super Admin (MODULE 3). L'Owner voit son plan en lecture seule.

BACKEND:

backend/src/models/Plan.js:
id(UUID), name(ENUM: FREE,STARTER,PRO,PREMIUM),
price_monthly(DECIMAL 10,3), price_annual(DECIMAL 10,3),
features(JSON), max_menus(INT), max_tables(INT), max_staff(INT)

backend/src/models/Invoice.js:
id(UUID), restaurant_id(UUID FK), subscription_id(UUID FK),
amount(DECIMAL 10,3), currency(VARCHAR 3 default 'DT'),
status(ENUM: PAID,PENDING,CANCELLED),
invoice_number(VARCHAR 20), — format: FACTURE-2026-XXXX (séquentiel)
issued_at(DATE), due_at(DATE), pdf_url(VARCHAR 500 nullable)

backend/src/services/pdfService.js (ajouter à l'existant):
exports.generateInvoice(invoice, restaurant, subscription):
- En-tête: logo Hannibal Advanced Solutions, coordonnées
- Destinataire: nom restaurant, adresse, matricule fiscal
- Objet: "Facture Abonnement [PLAN] — [RESTAURANT]"
- Tableau: description, période (dd/mm/yyyy - dd/mm/yyyy), montant HT DT, TVA 19%, total TTC DT
- Numéro facture, date émission
- Conditions de paiement
- "Merci de votre confiance"
- Uploader vers Cloudinary → retourner url

backend/src/controllers/billingController.js:
exports.getCurrentPlan: GET /api/billing/plan → subscription active + dates + features
exports.getInvoices: GET /api/billing/invoices → liste avec pagination
exports.downloadInvoice: GET /api/billing/invoices/:id/download → stream PDF ou redirect url

backend/src/routes/billing.routes.js (verifyToken + checkRole OWNER):
GET /api/billing/plan
GET /api/billing/invoices
GET /api/billing/invoices/:id/download

FRONTEND:

frontend/src/pages/dashboard/BillingPage.jsx:
- Card "Plan actuel":
  - Nom du plan (badge coloré), features incluses listées avec ✓
  - Date expiration
  - Message: "Pour changer de plan, contactez Hannibal Advanced Solutions"
  - Contact: email ou bouton WhatsApp
- Tableau "Historique des factures":
  - Colonnes: N° facture, Date, Période, Montant formatDT(), Statut, Télécharger PDF
  - Bouton télécharger → GET /api/billing/invoices/:id/download

frontend/src/components/billing/PlanCard.jsx:
- Affiche le plan actuel avec icônes features
- Badge statut: ACTIVE (vert), TRIAL (orange), EXPIRED (rouge)

LIVRABLES:
backend/src/models/{Plan,Invoice}.js (Subscription déjà créé MODULE 3)
backend/src/middleware/planGuard.js (déjà créé MODULE 3)
backend/src/controllers/billingController.js
backend/src/routes/billing.routes.js
frontend/src/pages/dashboard/BillingPage.jsx
frontend/src/components/billing/PlanCard.jsx

---

## MODULE 12 — Analytics & Rapports

Tu es un expert React + Recharts + Express + Sequelize. Génère le module analytics pour MenuQR.

IMPORTANT: Tous les montants affichés via formatDT(amount, i18n.language)

BACKEND:

backend/src/controllers/analyticsController.js:

exports.getKPIs: GET /api/analytics/kpis?from=&to=
- CA total période: SUM(orders.total) WHERE restaurant_id + date range + status IN(CLOSED)
- Nb commandes
- CA moyen par commande (CA total / nb commandes)
- Comparaison avec période précédente de même durée (delta % + direction)

exports.getRevenueChart: GET /api/analytics/revenue-chart?period=day|week|month
- GROUP BY DATE(created_at) → SUM(total) par jour
- Retourner: [{ date: '2026-01-15', revenue: 1250.500 }, ...]

exports.getTopDishes: GET /api/analytics/top-dishes?limit=10
- JOIN order_items → GROUP BY menu_item_id
- SUM(quantity), SUM(quantity * unit_price)
- Include: name_fr du MenuItem

exports.getByCategory: GET /api/analytics/by-category
- JOIN categories → GROUP BY category_id
- SUM revenue par catégorie

exports.getReservationStats: GET /api/analytics/reservations
- Nb réservations par zone (SALLE, TERRASSE, ÉTAGE)
- Taux remplissage par zone
- Taux no-show
- Heure de pointe (GROUP BY HOUR(time_slot))

exports.getQRScans: GET /api/analytics/qr-scans?from=&to=
- COUNT scans par table + par heure

exports.getStaffPerformance: GET /api/analytics/staff
- JOIN orders → GROUP BY staff_id
- Nb commandes, CA généré formatDT()

exports.exportCSV: GET /api/analytics/export/csv?from=&to=
- Toutes les commandes CLOSED avec détails
- Colonnes: date, heure, table, articles, total DT
- res.setHeader('Content-Type', 'text/csv')
- res.setHeader('Content-Disposition', 'attachment; filename=export.csv')

FRONTEND:

frontend/src/pages/dashboard/AnalyticsPage.jsx:
Structure:
- PeriodSelector en haut (Aujourd'hui / 7j / 30j / Ce mois / Personnalisé)
- KPICards: CA total, nb commandes, CA moyen, comparaison
- RevenueChart: LineChart CA par jour
- TopDishesTable + CategoryPieChart côte à côte
- BarChart: commandes par heure (pic de service)
- ReservationStats: stats par zone
- Bouton "Exporter CSV"

frontend/src/components/analytics/KPICards.jsx:
- 4 cards métriques: CA formatDT(), nb commandes, CA moyen formatDT(), nb clients
- Delta % vs période précédente avec flèche ↑↓ colorée

frontend/src/components/analytics/RevenueChart.jsx (Recharts):
- LineChart responsive avec ResponsiveContainer
- XAxis: dates formatées (date-fns)
- YAxis: formatDT() sur les valeurs
- Tooltip custom: date + CA formatDT()
- Couleur accent du restaurant (variable CSS --accent)

frontend/src/components/analytics/TopDishesTable.jsx:
- Tableau: rang, nom plat, quantité vendue, CA formatDT(), % du total
- BarChart horizontal Recharts pour visualisation

frontend/src/components/analytics/CategoryPieChart.jsx (Recharts):
- PieChart avec label: catégorie + % + CA formatDT()

frontend/src/components/analytics/ReservationStats.jsx:
- 3 cards: Salle, Terrasse, Étage
- Chaque card: nb réservations, taux remplissage %, taux no-show %

frontend/src/components/analytics/PeriodSelector.jsx:
- Boutons: Aujourd'hui | 7j | 30j | Ce mois | Personnalisé
- Si Personnalisé: 2 date pickers from/to
- onChange → refetch toutes les queries

LIVRABLES:
backend/src/controllers/analyticsController.js
backend/src/routes/analytics.routes.js
frontend/src/pages/dashboard/AnalyticsPage.jsx
frontend/src/components/analytics/{KPICards,RevenueChart,TopDishesTable,CategoryPieChart,ReservationStats,PeriodSelector}.jsx

---

## MODULE 13 — Notifications Multi-canaux

Tu es un expert Node.js + Nodemailer + Twilio + web-push. Génère le module notifications pour MenuQR.

CANAUX: EMAIL (Resend/Nodemailer) | SMS (Twilio) | PUSH PWA (web-push) | IN_APP (Socket.io)

BACKEND:

backend/src/models/Notification.js:
id(UUID), restaurant_id(UUID FK), user_id(UUID FK),
type(VARCHAR 50), channel(ENUM: EMAIL,SMS,WHATSAPP,PUSH,IN_APP),
event(VARCHAR 100), title(VARCHAR 200), body(TEXT),
is_read(BOOL false), sent_at(DATETIME nullable), failed_at(DATETIME nullable), error_message(TEXT nullable)

backend/src/models/NotificationSettings.js:
id(UUID), restaurant_id(UUID FK UNIQUE),
email_new_order(BOOL true), sms_new_order(BOOL false), push_new_order(BOOL true),
email_reservation(BOOL true), sms_reminder(BOOL false), whatsapp_reminder(BOOL false),
push_call_waiter(BOOL true)

backend/src/services/emailService.js:
Templates HTML responsive en 4 langues pour:
- welcome_owner: bienvenue + identifiants (envoyé par SA)
- reset_password: lien reset (1h)
- reservation_confirm: récapitulatif + lien annulation
- reservation_reminder_j1: rappel veille
- reservation_cancel: confirmation annulation
- invoice: facture mensuelle

Chaque template: function sendXxx(params) { to, subject, html via template(lang), envoyer via Resend ou Nodemailer }

backend/src/services/smsService.js:
- Twilio client depuis env TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE
- exports.sendSMS(to, message): client.messages.create({ body: message, from: TWILIO_PHONE, to })
- exports.sendReservationReminder(reservation, type): message formaté selon type J1/H2

backend/src/services/pushService.js:
- web-push avec VAPID keys
- exports.sendPush(subscription, { title, body, icon }): webpush.sendNotification
- Stocker push subscriptions en base (table: push_subscriptions)

backend/src/services/notificationDispatcher.js:
- exports.dispatch(event, data, restaurant_id):
  Charger NotificationSettings du restaurant
  Selon event + settings → appeler emailService, smsService, pushService
  Créer entrée Notification en base pour chaque envoi
  Émettre via Socket.io pour in-app

backend/src/controllers/notificationController.js:
- getNotifications: GET /api/notifications — liste with is_read filter
- markAsRead: PUT /api/notifications/:id/read
- markAllRead: PUT /api/notifications/read-all
- getSettings: GET /api/notifications/settings
- updateSettings: PUT /api/notifications/settings
- sendTest: POST /api/notifications/test → envoyer notification de test

FRONTEND:

frontend/src/components/shared/NotificationBell.jsx:
- Icône cloche dans le header du dashboard
- Badge rouge avec count non-lus
- Socket.io: écouter notification:new → incrémenter badge + toast
- Clic → ouvrir NotificationCenter

frontend/src/components/shared/NotificationCenter.jsx:
- Liste des 20 dernières notifications
- Type icône selon event
- Timestamp relatif (date-fns: formatDistance)
- Clic → marquer comme lu
- Bouton "Tout marquer comme lu"

frontend/src/pages/dashboard/NotificationSettingsPage.jsx:
- Toggles pour chaque canal × event
- Bouton "Tester" par canal
- Sauvegarde via PUT /api/notifications/settings

LIVRABLES:
backend/src/models/{Notification,NotificationSettings}.js
backend/src/controllers/notificationController.js
backend/src/routes/notifications.routes.js
backend/src/services/{emailService,smsService,pushService,notificationDispatcher}.js
frontend/src/components/shared/{NotificationBell,NotificationCenter}.jsx
frontend/src/pages/dashboard/NotificationSettingsPage.jsx

---

## MODULE 14 — Dashboards (Restaurant Owner/Manager + Super Admin)

Tu es un expert React + Recharts + Socket.io client. Génère les deux dashboards principaux pour MenuQR.

DEVISE: tous les montants via formatDT(amount, i18n.language)

DASHBOARD RESTAURANT (/dashboard):

backend/src/controllers/dashboardController.js:
exports.getStats: CA jour en DT, nb commandes actives, CA semaine, CA mois
exports.getOrdersLive: commandes actives avec statuts
exports.getTablesStatus: toutes tables avec statut actuel
exports.getTopDishes: top 5 plats du jour (quantité + CA DT)
exports.getQRScans: nb scans aujourd'hui par table

frontend/src/pages/dashboard/DashboardPage.jsx:
- useSocket(user.restaurant_id) pour les mises à jour temps réel
- Grid responsive: 4 widgets en haut + 2 grands widgets en bas

Widget CA journalier:
- Recharts LineChart: courbe horaire de 6h à 23h
- Valeur totale: formatDT(totalRevenue) (grande police)
- Comparaison J-1: delta % + flèche colorée

Widget Commandes en cours:
- Compteur animé par statut (EN_ATTENTE, PREPARATION, PRÊTE, SERVIE)
- 5 dernières commandes: table + total formatDT() + heure

Widget Plan de salle miniature:
- Grille compacte des tables avec couleurs statuts
- Nb occupées / total
- Clic → redirect /dashboard/tables

Widget Call Waiter en attente:
- Badge rouge si > 0
- Liste: table, type, temps écoulé
- Bouton "Traiter tout"

Widget Top plats du jour:
- Recharts BarChart horizontal
- Top 5 avec nom + quantité + CA formatDT()

Widget Scans QR:
- Total scans aujourd'hui
- Top 3 tables

Gestion personnel (/dashboard/staff):
- Liste membres: nom, username, rôle, statut, dernière connexion
- Bouton "Ajouter membre" → formulaire: nom, username, email, téléphone, rôle, MDP auto
  Limite selon plan affichée: "3/5 comptes utilisés (Plan STARTER)"
- Actions: désactiver, reset MDP, modifier rôle

DASHBOARD SUPER ADMIN (/admin):

frontend/src/pages/admin/AdminDashboardPage.jsx:
- KPIs plateforme:
  Nb restaurants actifs, répartition par plan (badges colorés)
  Nouveaux ce mois + delta %
  Alertes: nb abonnements expirés (rouge), nb is_first_login > 7j (orange)

- Recharts LineChart: croissance restaurants (12 derniers mois)
- Recharts PieChart: répartition par plan (FREE/STARTER/PRO/PREMIUM)

- Alertes section:
  Restaurants expirés: liste cliquable → action "Renouveler"
  Owners n'ayant pas encore connecté (is_first_login depuis > 7j)

- Top 10 restaurants:
  Tableau: nom, plan, nb commandes ce mois, CA formatDT(), dernière connexion owner

frontend/src/pages/admin/UsersPage.jsx:
- Tous les comptes de toute la plateforme
- Colonnes: nom, username, email, rôle, restaurant, statut, dernière connexion
- Filtres: rôle, restaurant, statut
- Actions: modifier, désactiver, reset MDP, forcer déconnexion

frontend/src/pages/admin/QRManagerPage.jsx:
- Tableau: ID QR, restaurant, table, nb scans, statut, dates
- Filtres: restaurant, statut
- Génération en lot: select nb (10/20/50) + restaurant → générer + télécharger ZIP
- Clic sur ligne: popup modifier URL destination

frontend/src/pages/admin/CurrenciesPage.jsx:
- Configuration devise DT:
  Symbole: DT
  Position: après (ex: 12,500 DT)
  Décimales: 3
  Séparateur: , (fr/ar) ou . (en/it)
- Prévisualisation: formatDT(12500) → "12,500 DT"

frontend/src/hooks/useDashboardSocket.js:
- Connexion Socket.io avec restaurantId
- Écouter tous les events: order:new, order:status_changed, table:status_changed,
  call_waiter:new, menu:item_toggled
- Retourner handlers pour chaque event
- Gestion reconnexion automatique

LIVRABLES:
backend/src/controllers/dashboardController.js
backend/src/routes/dashboard.routes.js
frontend/src/pages/dashboard/{DashboardPage,StaffPage}.jsx
frontend/src/pages/admin/{AdminDashboardPage,UsersPage,QRManagerPage,CurrenciesPage}.jsx
frontend/src/components/dashboard/{StatsCards,OrdersLiveWidget,FloorPlanWidget,TopDishesWidget,CallWaiterWidget,QRScansWidget}.jsx
frontend/src/components/admin/{PlatformKPIs,RestaurantsTable,UsersTable,AlertsWidget}.jsx
frontend/src/hooks/useDashboardSocket.js
