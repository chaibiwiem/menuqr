# MenuQR — Conventions de Code

Règles appliquées sur l'ensemble du projet.
Stack: React 18 + Vite | Node.js + Express | MySQL + Sequelize
Claude Code lit ce fichier via @docs/CONVENTIONS.md pour respecter ces conventions automatiquement.

---

## 1. Langage

- JavaScript ES6+ uniquement — JAMAIS de TypeScript
- CommonJS côté backend (require / module.exports)
- ESModules côté frontend (import / export)
- Async/await partout — jamais de .then().catch() chaînés

---

## 2. Nommage des fichiers

### Frontend (menuqr-frontend/src/)
| Type | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase.jsx | MenuItemCard.jsx |
| Page React | PascalCase + Page | LoginPage.jsx |
| Hook custom | camelCase, préfixe use | useSocket.js |
| Store Zustand | camelCase + Store | authStore.js |
| Fichier API | camelCase | menus.js |
| Utilitaire | camelCase | currency.js |
| Style CSS | camelCase | globals.css |
| Fichier i18n | code langue | fr.json |

### Backend (menuqr-backend/src/)
| Type | Convention | Exemple |
|---|---|---|
| Controller | camelCase + Controller | authController.js |
| Route | camelCase + .routes | auth.routes.js |
| Modèle Sequelize | PascalCase | Restaurant.js |
| Middleware | camelCase | tenantGuard.js |
| Service | camelCase + Service | emailService.js |
| Job cron | camelCase | cron.js |
| Utilitaire | camelCase | slugify.js |

---

## 3. Nommage du code

### Variables et fonctions
```js
// camelCase pour variables et fonctions
const restaurantId = req.user.restaurant_id;
const isActive = true;

async function getMenuItems(restaurantId) { ... }
const formatDT = (amount, lang) => { ... }

// PascalCase pour composants React et classes
function MenuItemCard({ item }) { ... }
class EmailService { ... }

// SCREAMING_SNAKE_CASE pour constantes globales
const MAX_LOGIN_ATTEMPTS = 5;
const JWT_EXPIRES_IN = '8h';
const PLAN_FEATURES = { FREE: [...], PRO: [...] };

// Préfixe is/has/can pour booléens
const isLoading = true;
const hasPermission = false;
const canDelete = user.role === 'OWNER';
```

### Colonnes MySQL — snake_case obligatoire
```sql
restaurant_id   -- FK toujours snake_case
created_at      -- timestamps
is_active       -- booléens avec is_ ou has_
first_name      -- mots composés avec underscore
price_night     -- variantes de champs
```

### Modèles Sequelize — PascalCase
```js
// Nom du modèle: PascalCase
const Restaurant = sequelize.define('Restaurant', { ... });
const MenuItem = sequelize.define('MenuItem', { ... });
const OrderItem = sequelize.define('OrderItem', { ... });
```

---

## 4. Structure des composants React

```jsx
// Ordre standard dans un composant
import React, { useState, useEffect } from 'react';      // 1. React
import { useNavigate } from 'react-router-dom';           // 2. Librairies
import { useTranslation } from 'react-i18next';           // 3. i18n
import { useQuery, useMutation } from '@tanstack/react-query'; // 4. Query
import { useAuthStore } from '../../store/authStore';     // 5. Stores
import { getMenuItems } from '../../api/menus';           // 6. API
import { formatDT } from '../../utils/currency';          // 7. Utilitaires
import MenuItemCard from './MenuItemCard';                 // 8. Composants enfants
import { Button } from '../ui/button';                    // 9. UI components

export default function MenuPage() {
  // Hooks en premier
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State local
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Queries et mutations
  const { data: items, isLoading } = useQuery({ ... });
  const mutation = useMutation({ ... });

  // Effets
  useEffect(() => { ... }, []);

  // Handlers
  const handleSubmit = async (data) => { ... };
  const handleDelete = (id) => { ... };

  // Render conditionnel
  if (isLoading) return <div>{t('common.loading')}</div>;

  // JSX principal
  return (
    <div>...</div>
  );
}
```

---

## 5. Internationalisation (i18n)

### Règle absolue — JAMAIS de texte hardcodé

```jsx
// CORRECT
const { t } = useTranslation();
<h1>{t('menu.title')}</h1>
<button>{t('common.save')}</button>
<p>{t('reservation.success_msg')}</p>

// INCORRECT — JAMAIS
<h1>Menu du restaurant</h1>
<button>Enregistrer</button>
```

### Structure des clés de traduction
```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "confirm": "Confirmer",
    "back": "Retour",
    "search": "Rechercher"
  },
  "auth": {
    "login_title": "Connexion",
    "identifier_label": "Email ou nom d'utilisateur",
    "password": "Mot de passe",
    "forgot_password": "Mot de passe oublié ?",
    "login_btn": "Se connecter",
    "contact_admin": "Pour accéder, contactez votre administrateur"
  },
  "menu": {
    "title": "Notre menu",
    "categories": "Catégories",
    "unavailable": "Indisponible",
    "popular": "Populaire",
    "add_to_cart": "Ajouter",
    "supplements": "Personnalisez votre choix"
  },
  "reservation": {
    "title": "Réserver une table",
    "first_name": "Prénom",
    "last_name": "Nom",
    "email": "Email",
    "phone": "Téléphone",
    "date": "Date de réservation",
    "covers": "Nombre de places",
    "zone_salle": "Salle",
    "zone_terrasse": "Terrasse",
    "zone_etage": "Étage",
    "notes_placeholder": "Demandes spéciales...",
    "submit": "Confirmer ma réservation",
    "success_title": "Réservation envoyée !",
    "slot_full": "Complet"
  },
  "orders": {
    "new_order": "Nouvelle commande",
    "status_pending": "En attente",
    "status_preparing": "En préparation",
    "status_ready": "Prête",
    "status_served": "Servie",
    "status_closed": "Clôturée"
  },
  "cart": {
    "title": "Votre commande",
    "empty": "Votre panier est vide",
    "total": "Total",
    "order_btn": "Commander",
    "payment_info": "Paiement sur place en DT"
  }
}
```

### Gestion RTL pour l'arabe
```jsx
// Dans App.jsx — effet automatique
const { i18n } = useTranslation();
useEffect(() => {
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
}, [i18n.language]);

// Dans les composants — classes Tailwind RTL
<div className="flex gap-4 rtl:flex-row-reverse">
  <span className="mr-2 rtl:mr-0 rtl:ml-2">Texte</span>
</div>
```

---

## 6. Devise — Dinar Tunisien (DT)

### Règle absolue — TOUJOURS formatDT()

```js
// src/utils/currency.js
export const formatDT = (amount, lang = 'fr') => {
  const locale = { fr: 'fr-TN', en: 'en-TN', it: 'it-TN', ar: 'ar-TN' }[lang] || 'fr-TN';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount) + ' DT';
};

// CORRECT
<span>{formatDT(item.price)}</span>           // "12,500 DT"
<span>{formatDT(item.price, 'ar')}</span>     // "12٫500 DT"
<td>{formatDT(order.total)}</td>

// INCORRECT — JAMAIS
<span>{item.price} DT</span>
<span>{item.price.toFixed(3)} DT</span>
<span>{Number(item.price).toFixed(2)} TND</span>
```

### MySQL — DECIMAL(10,3) obligatoire
```sql
-- CORRECT pour tous les prix
price           DECIMAL(10,3) NOT NULL DEFAULT 0.000
price_night     DECIMAL(10,3) NULL
extra_price     DECIMAL(10,3) NOT NULL DEFAULT 0.000
total           DECIMAL(10,3) NOT NULL DEFAULT 0.000
amount          DECIMAL(10,3) NOT NULL

-- INCORRECT
price FLOAT      -- perte de précision
price DOUBLE     -- perte de précision
price INT        -- pas de décimales
```

---

## 7. API REST — Conventions

### Routes Express
```js
// Verbes HTTP
GET    /api/restaurants          // liste
GET    /api/restaurants/:id      // détail
POST   /api/restaurants          // créer
PUT    /api/restaurants/:id      // modifier (complet)
PATCH  /api/restaurants/:id      // modifier (partiel)
DELETE /api/restaurants/:id      // supprimer

// Actions spéciales avec verbe dans l'URL
PUT    /api/restaurants/:id/toggle    // activer/désactiver
POST   /api/restaurants/:id/reset-password
GET    /api/restaurants/:id/stats

// Routes publiques (sans auth)
GET    /api/public/:slug              // menu public
POST   /api/public/:slug/orders       // passer commande
POST   /api/public/:slug/call-waiter  // appel serveur
GET    /api/public/:slug/reservations/slots
POST   /api/public/:slug/reservations
```

### Format des réponses — TOUJOURS ce format
```js
// Succès
res.status(200).json({
  data: { ... },       // données retournées
  message: 'Succès'    // message lisible
});

// Création
res.status(201).json({
  data: { ... },
  message: 'Créé avec succès'
});

// Erreur client (400, 401, 403, 404, 409)
res.status(400).json({
  error: 'VALIDATION_ERROR',   // code erreur machine
  message: 'Données invalides' // message lisible
});

// Erreur serveur
res.status(500).json({
  error: 'SERVER_ERROR',
  message: 'Erreur interne du serveur'
});
```

### Controller — structure standard
```js
// controllers/menuController.js
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurant_id } = req.user;              // tenant isolation
    const { categoryId } = req.params;

    const items = await MenuItem.findAll({
      where: { category_id: categoryId },
      include: [{ model: SupplementGroup }]
    });

    res.json({ data: items, message: 'OK' });

  } catch (error) {
    console.error('getMenuItems error:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};
```

---

## 8. Middleware Auth — Utilisation

```js
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const { tenantGuard } = require('../middleware/tenantGuard');

// Route protégée — authentification uniquement
router.get('/profile', verifyToken, controller.getProfile);

// Route avec rôle requis
router.post('/restaurants', verifyToken, checkRole('SUPER_ADMIN'), controller.create);
router.put('/menus/:id', verifyToken, checkRole('OWNER', 'MANAGER'), controller.update);

// Route avec vérification plan
router.get('/analytics', verifyToken, planGuard('analytics'), controller.getStats);
router.post('/reservations', verifyToken, planGuard('reservations'), controller.create);

// Route avec isolation tenant
router.get('/orders', verifyToken, tenantGuard, controller.getOrders);

// Ordre des middleware: verifyToken → checkRole → planGuard → tenantGuard → controller
router.post('/pos/payment',
  verifyToken,
  checkRole('OWNER', 'MANAGER', 'CASHIER'),
  planGuard('pos_caisse'),
  tenantGuard,
  posController.processPayment
);

// Routes publiques — sans middleware
router.get('/public/:slug/menu', publicController.getMenu);
router.post('/public/:slug/orders', publicController.createOrder);
```

---

## 9. Modèles Sequelize — Structure standard

```js
// models/MenuItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name_fr: { type: DataTypes.STRING(80), allowNull: false },
  name_en: { type: DataTypes.STRING(80), allowNull: true },
  name_it: { type: DataTypes.STRING(80), allowNull: true },
  name_ar: { type: DataTypes.STRING(80), allowNull: true },
  description_fr: { type: DataTypes.TEXT, allowNull: true },
  price: {
    type: DataTypes.DECIMAL(10, 3),  // TOUJOURS DECIMAL(10,3) pour DT
    allowNull: false,
    defaultValue: 0.000,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'menu_items',      // snake_case obligatoire
  timestamps: true,             // created_at, updated_at automatiques
  underscored: true,            // camelCase JS → snake_case SQL auto
});

module.exports = MenuItem;
```

### Associations — dans models/index.js
```js
// models/index.js — toutes les associations ici
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
// ...

// Définir les associations
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

User.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });
Restaurant.hasMany(User, { foreignKey: 'restaurant_id' });

// Exporter tous les modèles
module.exports = {
  sequelize,
  User,
  Restaurant,
  MenuItem,
  // ...
};
```

---

## 10. Socket.io — Conventions

### Nommage des events — format module:action
```js
// Commandes
'order:new'              // nouvelle commande reçue
'order:status_changed'   // statut mis à jour
'order:cancelled'        // commande annulée

// Tables
'table:status_changed'   // table libre/occupée/réservée
'table:freed'            // table libérée

// Call Waiter
'call_waiter:new'        // appel serveur entrant
'call_waiter:resolved'   // appel traité

// Menu
'menu:item_toggled'      // plat activé/désactivé

// Réservations
'reservation:new'        // nouvelle réservation
'reservation:confirmed'  // réservation confirmée
```

### Émission côté serveur — via socketService
```js
// services/socketService.js — centraliser les émissions
const emitToRestaurant = (io, restaurantId, event, data) => {
  io.to('restaurant:' + restaurantId).emit(event, data);
};

exports.emitNewOrder = (io, restaurantId, order) => {
  emitToRestaurant(io, restaurantId, 'order:new', {
    id: order.id,
    table: order.table_name,
    total: order.total,
    items_count: order.items.length,
    created_at: order.created_at,
  });
};

// Dans le controller — utiliser req.io
const { emitNewOrder } = require('../services/socketService');
emitNewOrder(req.io, restaurant_id, newOrder);
```

### Connexion côté frontend — hook useSocket
```js
// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (restaurantId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;

    socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', ''), {
      transports: ['websocket'],
    });

    socketRef.current.emit('join:restaurant', restaurantId);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [restaurantId]);

  const on = (event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return { socket: socketRef.current, on };
};
```

---

## 11. Gestion des erreurs

### Frontend — avec TanStack Query
```jsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['menu-items', restaurantId],
  queryFn: () => api.get('/menus/' + restaurantId).then(r => r.data),
  retry: 2,
  staleTime: 5 * 60 * 1000,  // 5 minutes
});

if (isLoading) return <LoadingSpinner />;
if (isError)   return <ErrorMessage message={error.response?.data?.message} />;

// Mutation avec gestion d'erreur
const mutation = useMutation({
  mutationFn: (data) => api.post('/reservations', data),
  onSuccess: () => {
    toast.success(t('reservation.success_title'));
    queryClient.invalidateQueries(['reservations']);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || t('common.error'));
  },
});
```

### Backend — try/catch systématique
```js
exports.createReservation = async (req, res) => {
  try {
    // Validation
    const { first_name, last_name, email, phone, date, time_slot, covers, zone } = req.body;
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Champs obligatoires manquants'
      });
    }

    // Vérification disponibilité
    const isAvailable = await checkSlotAvailability(restaurant_id, date, time_slot, zone, covers);
    if (!isAvailable) {
      return res.status(409).json({
        error: 'SLOT_UNAVAILABLE',
        message: 'Ce créneau n\'est plus disponible'
      });
    }

    const reservation = await Reservation.create({ ... });
    res.status(201).json({ data: reservation, message: 'Réservation créée' });

  } catch (error) {
    console.error('[createReservation]', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};
```

---

## 12. Sécurité

### Isolation multi-tenant — OBLIGATOIRE
```js
// middleware/tenantGuard.js
// Chaque requête authentifiée vérifie que la ressource
// appartient bien au restaurant du token JWT

exports.tenantGuard = async (req, res, next) => {
  const { restaurant_id } = req.user;
  const resourceRestaurantId = req.params.restaurant_id
    || req.body.restaurant_id
    || req.query.restaurant_id;

  if (resourceRestaurantId && resourceRestaurantId !== restaurant_id) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Accès refusé'
    });
  }
  next();
};

// Dans chaque requête Sequelize — toujours filtrer par restaurant_id
const orders = await Order.findAll({
  where: {
    restaurant_id: req.user.restaurant_id,  // OBLIGATOIRE
    status: 'PENDING'
  }
});
```

### Validation des inputs
```js
// Toujours valider côté serveur — même si validé côté client
const { body, validationResult } = require('express-validator');

const validateReservation = [
  body('first_name').trim().isLength({ min: 2, max: 80 }).escape(),
  body('last_name').trim().isLength({ min: 2, max: 80 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isMobilePhone(),
  body('covers').isInt({ min: 1, max: 50 }),
  body('zone').isIn(['SALLE', 'TERRASSE', 'ETAGE']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: errors.array()[0].msg
      });
    }
    next();
  }
];
```

---

## 13. Templates CSS — 6 designs menu client

```css
/* src/styles/globals.css */
/* Appliquer sur <html data-template="aurora_glass"> */

[data-template="aurora_glass"] {
  --bg-primary:   #0D2E4A;
  --bg-secondary: #112640;
  --accent:       #00D9C0;
  --text-primary: #E2E8F0;
  --text-secondary: #94A3B8;
  --card-bg:      rgba(255,255,255,0.08);
  --card-border:  rgba(0,217,192,0.2);
}

[data-template="bento_menu"] {
  --bg-primary:   #FFF8F0;
  --bg-secondary: #FFF0E0;
  --accent:       #C8501A;
  --text-primary: #1A0A00;
  --text-secondary: #7A4A30;
  --card-bg:      #FFFFFF;
  --card-border:  #F0D0B0;
}

[data-template="classic_theme"] {
  --bg-primary:   #FAFAF8;
  --bg-secondary: #F5F0E8;
  --accent:       #C9A96E;
  --text-primary: #2C2016;
  --text-secondary: #6B5A48;
  --card-bg:      #FFFFFF;
  --card-border:  #E8DDD0;
  --font-display: 'Playfair Display', serif;
}

[data-template="dark_sleek"] {
  --bg-primary:   #0E0E0F;
  --bg-secondary: #1A1A1B;
  --accent:       #FF5C35;
  --text-primary: #F5F5F5;
  --text-secondary: #A0A0A0;
  --card-bg:      #1E1E1F;
  --card-border:  #2A2A2B;
}

[data-template="editorial_menu"] {
  --bg-primary:   #F9F7F4;
  --bg-secondary: #F2EFE8;
  --accent:       #1A1A1A;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --card-bg:      #FFFFFF;
  --card-border:  #E0DDD8;
}

[data-template="modern_theme"] {
  --bg-primary:   #FFFFFF;
  --bg-secondary: #F3F0FF;
  --accent:       #6C47FF;
  --text-primary: #1A1A2E;
  --text-secondary: #6B7280;
  --card-bg:      #FFFFFF;
  --card-border:  #E5E7EB;
}
```

---

## 14. Git — Conventions commits

```bash
# Format: type(scope): description courte
feat(auth):      add forgot password flow
fix(orders):     correct total calculation in DT
style(menu):     update dark_sleek template colors
refactor(api):   extract reservation validation middleware
docs(stack):     update MySQL setup instructions
chore(deps):     upgrade sequelize to 6.37
test(reservations): add slot availability unit tests

# Types autorisés
feat      → nouvelle fonctionnalité
fix       → correction de bug
style     → CSS/UI sans changement logique
refactor  → refactoring sans nouvelle feature
docs      → documentation uniquement
chore     → maintenance, dépendances
test      → ajout ou modification de tests
```

---

## 15. Checklist avant chaque commit

```
[ ] TOUJOURS t() pour les textes — aucun texte hardcodé
[ ] TOUJOURS formatDT() pour les prix — aucun affichage de nombre brut
[ ] DECIMAL(10,3) dans MySQL pour les prix
[ ] restaurant_id dans TOUTES les requêtes Sequelize
[ ] verifyToken + checkRole sur TOUTES les routes protégées
[ ] Routes publiques /api/public/* et /api/auth/* seulement sans auth
[ ] Aucun console.log laissé en production (utiliser un logger)
[ ] Réponses API au format { data, message } ou { error, message }
[ ] Variables d'environnement dans .env — jamais hardcodées dans le code
[ ] Clés i18n pour les 4 langues fr/en/it/ar
```
