# MenuQR — Concept & Roadmap

Plateforme SaaS multi-tenant de menus digitaux QR Code pour restaurants.
Société : Hannibal Advanced Solutions — www.hannibaladvanced.com
Version  : 5.0 — 2026
Stack    : React 18 + Vite | Node.js 20 + Express 4 | MySQL 8 + Sequelize 6

---

## Concept Global

MenuQR permet aux restaurants de digitaliser leur menu via un QR Code.
Le client scanne le QR depuis son téléphone, commande, et paie sur place en DT.
Le restaurant reçoit les commandes en temps réel sur son dashboard.

```
CLIENT                    PLATEFORME MENUQR              RESTAURANT
  │                             │                             │
  │── Scanne QR ──────────────→ │                             │
  │                             │ ── Menu digital ──────────→ │
  │ ←── Affiche le menu ─────── │                             │
  │                             │                             │
  │── Commande ───────────────→ │                             │
  │                             │ ── Notif temps réel ──────→ │
  │ ←── Confirmation ────────── │                             │
  │                             │                             │
  │── Paiement sur place ─────→ │ ←── POS caisse (DT) ─────── │
```

### 3 espaces distincts

| Espace | URL | Accès |
|---|---|---|
| Menu client public | /:slug/table/:qr_token | Public — aucune auth |
| Dashboard restaurant | /dashboard/* | OWNER, MANAGER, STAFF, CASHIER |
| Back-office Super Admin | /admin/* | SUPER_ADMIN uniquement |

---

## Règles absolues (rappel pour Claude Code)

- AUCUN OAuth Google / Facebook / GitHub
- AUCUNE page d'inscription publique
- Connexion : email OU username + mot de passe uniquement
- Comptes créés par Super Admin (Owner) ou Owner (Staff) uniquement
- TOUJOURS formatDT() pour les montants — JAMAIS de prix brut affiché
- TOUJOURS t() pour les textes — JAMAIS de texte hardcodé
- JAMAIS TypeScript — JavaScript ES6+ uniquement

---

## Acteurs & Workflow de création

```
[Client restaurant] ──paie plan──→ [Super Admin Hannibal]
                                          │
                                   crée via /admin
                                          │
                              ┌───────────┴────────────┐
                              │                        │
                        Restaurant                  Owner
                        (en base)                (compte user)
                              │                        │
                              └───────────┬────────────┘
                                          │
                                  email automatique
                               (username + MDP temporaire)
                                          │
                                    Owner se connecte
                                  → change MDP (forcé)
                                  → configure restaurant
                                  → crée son staff
```

### Rôles et permissions

| Rôle | Créé par | Peut faire |
|---|---|---|
| SUPER_ADMIN | Interne Hannibal | Tout — plateforme globale |
| OWNER | Super Admin uniquement | Son restaurant + créer staff |
| MANAGER | Super Admin ou Owner | Commandes, tables, rapports |
| STAFF | Super Admin ou Owner | Commandes, Call Waiter |
| CASHIER | Super Admin ou Owner | POS, paiements DT |
| Client | Aucun compte | Scan QR → menu → commande |

---

## Plans d'abonnement

| Feature | FREE | STARTER | PRO | PREMIUM |
|---|---|---|---|---|
| Menus digitaux | 1 | Illimité | Illimité | Illimité |
| Templates | 2 | 6 | 6 | 6 |
| Tables max | 5 | 20 | Illimité | Illimité |
| Staff (comptes) | 2 | 5 | 15 | Illimité |
| Call Waiter | ✗ | ✓ | ✓ | ✓ |
| Réservations | ✗ | ✗ | ✓ | ✓ |
| Notifications SMS | ✗ | Email | ✓ | ✓ |
| Analytics | ✗ | Basique | ✓ | ✓ |
| Export CSV | ✗ | ✗ | ✓ | ✓ |
| POS & Caisse | ✗ | ✗ | ✗ | ✓ |
| Sous-domaine | ✗ | ✓ | ✓ | ✓ |

---

## 6 Templates Menu Client

| Template | Style | Idéal pour |
|---|---|---|
| aurora_glass | Fond sombre #0D2E4A + teal #00D9C0, glassmorphisme | Bars, lounges, nocturne |
| bento_menu | Crème #FFF8F0 + orange #C8501A, bento grid | Fast-casual, cafés, asiatique |
| classic_theme | Crème #FAFAF8 + or #C9A96E, police serif | Gastronomique, hôtels classiques |
| dark_sleek | Noir #0E0E0F + rouge-orange #FF5C35, minimaliste | Bars, clubs, rooftops |
| editorial_menu | Blanc cassé #F9F7F4, style magazine | Bistrots haut de gamme |
| modern_theme | Blanc + violet #6C47FF | Hôtels, resorts, cafés modernes |

---

## Multilingue — 4 langues

| Langue | Code | Direction |
|---|---|---|
| Français | fr | LTR — langue par défaut |
| English | en | LTR |
| Italiano | it | LTR |
| العربية | ar | RTL — document.dir = 'rtl' automatique |

Fichiers : `public/locales/{fr,en,it,ar}/translation.json`

---

## Module Réservations — Détail

Champs formulaire client (obligatoires sauf notes) :

| Champ | Type | Validation |
|---|---|---|
| Prénom | Text | min 2 chars |
| Nom | Text | min 2 chars |
| Email | Email | format valide |
| Téléphone | Tel | format international |
| Date | Date | min : aujourd'hui + délai config |
| Heure | Select | créneaux dispo selon date + zone |
| Nb places | Number | min 1 |
| Zone | Select | SALLE / TERRASSE / ÉTAGE |
| Notes | Textarea | optionnel, max 500 chars |

Statuts : `EN_ATTENTE → CONFIRMEE → RAPPEL_ENVOYE → ARRIVEE → TERMINEE`
          `                       → ANNULEE_CLIENT / ANNULEE_RESTAURANT / NO_SHOW`

---

## Architecture technique

```
┌─────────────────────────────────────────────────────┐
│                   NAVIGATEUR CLIENT                  │
│                                                      │
│  React 18 + Vite (port 5173)                        │
│  Tailwind CSS + shadcn/ui                           │
│  Zustand + TanStack Query                           │
│  i18next (FR/EN/IT/AR)                              │
│  Socket.io client                                   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST + WebSocket
┌────────────────────▼────────────────────────────────┐
│                  SERVEUR NODE.JS                     │
│                                                      │
│  Express 4 (port 3001)                              │
│  Socket.io 4 (même process)                         │
│  JWT + bcryptjs (auth)                              │
│  Multer + Cloudinary (images)                       │
│  Nodemailer + Resend (email)                        │
│  node-cron (rappels réservations)                   │
│  ESC/POS + PDFKit (impression)                      │
└────────────────────┬────────────────────────────────┘
                     │ Sequelize ORM
┌────────────────────▼────────────────────────────────┐
│                   MYSQL 8                            │
│                                                      │
│  XAMPP (dev) — localhost:3306                       │
│  DB : menuqr_db                                     │
│  ~25 tables — DECIMAL(10,3) pour DT                 │
└─────────────────────────────────────────────────────┘
```

---

## Les 14 Modules

| # | Module | Phase | Plan min |
|---|---|---|---|
| 1 | Setup global | P0 | Tous |
| 2 | Auth email/username (sans OAuth) | P1 | Tous |
| 3 | Super Admin — création restaurant & Owner | P1 | Tous |
| 4 | Menu Builder CRUD + DnD | P2 | Tous |
| 5 | Interface client QR (menu digital public) | P2 | Tous |
| 6 | Commandes temps réel Kanban + Socket.io | P3 | Tous |
| 7 | Tables, plan de salle & QR codes | P3 | Tous |
| 8 | Call Waiter | P3 | STARTER |
| 9 | Réservations (Salle / Terrasse / Étage) | P4 | PRO |
| 10 | POS & Caisse (espèces + carte, DT) | P5 | PREMIUM |
| 11 | Abonnements SaaS & facturation | P5 | Admin |
| 12 | Analytics & rapports | P6 | PRO |
| 13 | Notifications multi-canaux | P6 | PRO |
| 14 | Dashboards Restaurant + Super Admin | P6 | Tous |

---

## Roadmap — 8 Phases

### P0 — Setup Global (3 jours)
**Objectif :** Initialiser les deux projets et poser les fondations.

- [ ] Créer `menuqr-frontend/` (Vite + React 18 + Tailwind + shadcn/ui)
- [ ] Créer `menuqr-backend/` (Node.js + Express + Sequelize)
- [ ] Créer base de données `menuqr_db` dans XAMPP
- [ ] Configurer i18next — 4 langues FR/EN/IT/AR + RTL
- [ ] Créer `src/utils/currency.js` → `formatDT(amount, lang)`
- [ ] Créer `src/api/axios.js` → instance avec intercepteurs JWT
- [ ] Configurer `.env` avec toutes les variables
- [ ] Créer `CLAUDE.md` à la racine
- [ ] Créer `docs/` avec STACK.md, MODULES.md, CONVENTIONS.md, PROMPTS.md, ROADMAP.md

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 1 — Setup global
```

---

### P1 — Auth + Super Admin + Création Restaurant (5 jours)
**Objectif :** Système d'accès complet. Premier flux utilisable.

- [ ] Page `/login` — email OU username, AUCUN OAuth, AUCUN lien inscription
- [ ] Page `/forgot-password` → reset par email (token JWT 1h)
- [ ] Page `/reset-password` — validation contraintes MDP
- [ ] Page `/change-password` — forcée si `is_first_login = true`
- [ ] Middleware `verifyToken` + `checkRole` + `tenantGuard` + `planGuard`
- [ ] Rate limiting : 5 tentatives → blocage 15 minutes
- [ ] Modèle `User.js` (Sequelize) avec tous les champs
- [ ] Wizard Super Admin `/admin/restaurants/new` — 4 étapes
- [ ] Création restaurant + Owner en transaction Sequelize
- [ ] Email automatique au Owner avec identifiants
- [ ] Liste restaurants `/admin/restaurants`

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 2 — Auth
@docs/PROMPTS.md génère le MODULE 3 — Super Admin création restaurant
```

---

### P2 — Menu Builder + Interface Client QR (7 jours)
**Objectif :** Le produit principal — menu digital et interface de gestion.

- [ ] CRUD menus, catégories (DnD @dnd-kit), plats
- [ ] Noms et descriptions en FR/EN/IT/AR (onglets)
- [ ] Prix en DT — `DECIMAL(10,3)` MySQL — `formatDT()` partout
- [ ] Groupes de suppléments (radio/checkbox, prix additionnels DT)
- [ ] Toggle disponibilité → Socket.io broadcast côté client
- [ ] Page `/:slug/table/:qrToken` — menu public sans auth
- [ ] Sélecteur de langue FR/EN/IT/AR avec RTL arabe
- [ ] 6 templates CSS via `data-template`
- [ ] Panier + commande + confirmation paiement sur place DT
- [ ] Suivi commande temps réel Socket.io
- [ ] Call Waiter bouton flottant

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 4 — Menu Builder
@docs/PROMPTS.md génère le MODULE 5 — Interface client QR
```

---

### P3 — Commandes + Tables + Call Waiter (6 jours)
**Objectif :** Moteur opérationnel du restaurant en temps réel.

- [ ] Vue Kanban commandes — 5 colonnes — drag & drop statuts
- [ ] Socket.io : toast + son à chaque nouvelle commande
- [ ] Impression automatique ESC/POS à la réception
- [ ] Plan de salle visuel — 3 zones : Salle, Terrasse, Étage
- [ ] QR code dynamique par table (qrcode.js + logo sharp)
- [ ] Export QR PNG/SVG/PDF par table ou en lot
- [ ] Call Waiter : notif instantanée dashboard + badge rouge
- [ ] Fusion tables, transfert commande

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 6 — Commandes temps réel
@docs/PROMPTS.md génère le MODULE 7 — Tables et plan de salle
@docs/PROMPTS.md génère le MODULE 8 — Call Waiter
```

---

### P4 — Réservations (5 jours)
**Objectif :** Module réservation en ligne complet avec rappels automatiques.

- [ ] Formulaire public : prénom, nom, email, tél, date, heure, couverts, zone, notes
- [ ] Zones SALLE / TERRASSE / ÉTAGE configurables par restaurant
- [ ] Créneaux disponibles chargés dynamiquement selon date + zone
- [ ] Dashboard restaurant : calendrier + liste + filtres
- [ ] Actions : confirmer, refuser, arrivé, no-show, attribuer table
- [ ] Email confirmation + lien annulation (token JWT 48h)
- [ ] Cron rappels : J-1 email, H-2 SMS/WhatsApp
- [ ] Paramètres : zones, capacités, créneaux, délais, messages 4 langues

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 9 — Réservations
```

---

### P5 — POS & Abonnements (4 jours)
**Objectif :** Caisse complète en DT + gestion des abonnements.

- [ ] Interface POS : sélection table → commande → paiement
- [ ] Mode espèces : montant reçu → monnaie rendue `formatDT()`
- [ ] Mode carte : confirmation manuelle (terminal physique)
- [ ] Impression reçus ESC/POS et PDF avec montants DT
- [ ] Clôture service : rapport CA total DT, cash/carte
- [ ] Dashboard Owner : plan actuel lecture seule, historique factures DT
- [ ] Middleware `planGuard` : bloquer features selon plan

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 10 — POS et caisse
@docs/PROMPTS.md génère le MODULE 11 — Abonnements
```

---

### P6 — Analytics + Notifications + Dashboards (5 jours)
**Objectif :** Tableaux de bord, analytics et système de notifications.

- [ ] Analytics : CA DT (Recharts), top plats, stats réservations par zone
- [ ] Export CSV avec montants DT
- [ ] Notifications email (Resend), SMS (Twilio), Push PWA
- [ ] Centre notifications in-app avec badge non-lu
- [ ] Dashboard restaurant : CA DT temps réel, commandes, plan salle
- [ ] Dashboard Super Admin : KPIs plateforme, alertes, QR Manager
- [ ] Gestion personnel par Owner selon limites plan
- [ ] Gestion devise DT dans `/admin/currencies`

**Commande Claude Code :**
```
@docs/PROMPTS.md génère le MODULE 12 — Analytics
@docs/PROMPTS.md génère le MODULE 13 — Notifications
@docs/PROMPTS.md génère le MODULE 14 — Dashboards
```

---

### P7 — Tests & Déploiement (4 jours)
**Objectif :** QA complet et mise en production sur VPS Linux.

**Tests à effectuer :**
- [ ] Auth : 5 tentatives → blocage 15 min, `is_first_login` forcé
- [ ] Tenant isolation : impossible d'accéder aux données d'un autre restaurant
- [ ] `formatDT()` : tous les montants avec 3 décimales + " DT"
- [ ] i18n : `t()` sur tous les textes, RTL arabe fonctionnel
- [ ] Réservations : créneaux corrects, zones SALLE/TERRASSE/ÉTAGE
- [ ] Socket.io : commandes reçues en < 1 seconde
- [ ] POS : calcul monnaie rendue correct en DT
- [ ] `planGuard` : features bloquées si plan insuffisant

**Déploiement :**
- [ ] Build React : `npm run build` → `dist/`
- [ ] PM2 : `pm2 start server.js --name menuqr-api -i max`
- [ ] Nginx : reverse proxy + servir `dist/` en statique
- [ ] SSL : Certbot Let's Encrypt (renouvellement automatique)
- [ ] Monitoring : Sentry + PM2 monitoring + Uptime Robot

---

## Progression des phases

```
P0 ████████████████████ Setup         (3j) ✓ À FAIRE
P1 ████████████████████ Auth + SA     (5j) ○ À FAIRE
P2 ████████████████████ Menu + QR     (7j) ○ À FAIRE
P3 ████████████████████ Commandes     (6j) ○ À FAIRE
P4 ████████████████████ Réservations  (5j) ○ À FAIRE
P5 ████████████████████ POS           (4j) ○ À FAIRE
P6 ████████████████████ Analytics     (5j) ○ À FAIRE
P7 ████████████████████ Déploiement   (4j) ○ À FAIRE

Total estimé : 39 jours de développement
```

---

## Utilisation avec Claude Code

### Démarrage de session
```bash
cd menuqr
claude

> /status
# ✓ CLAUDE.md loaded — rules active
# ✓ Stack: React + Node.js + MySQL
# ✓ Rules: NO OAuth, DT currency, 4 langs

> /context
# Vérifier que toutes les règles sont chargées
```

### Référencer les fichiers docs
```
@docs/PROMPTS.md    → accès aux 14 prompts modules
@docs/MODULES.md    → détail de chaque module
@docs/STACK.md      → stack technique complète
@docs/CONVENTIONS.md → conventions de code
@docs/ROADMAP.md    → ce fichier
```

### Workflow recommandé par phase
```
# Phase P0 — depuis la racine
cd menuqr && claude
> @docs/PROMPTS.md génère le MODULE 1 — Setup global

# Phase P1 — auth dans le frontend
cd menuqr-frontend && claude
> @docs/PROMPTS.md génère le MODULE 2 — Auth

# Phase P1 — admin dans le backend
cd menuqr-backend && claude
> @docs/PROMPTS.md génère le MODULE 3 — Super Admin

# Phase P2 — menu builder
cd menuqr-frontend && claude
> @docs/PROMPTS.md génère le MODULE 4 — Menu Builder

# En cas de déviation des règles
> /reset
# Claude relit CLAUDE.md et retrouve les règles
```

---

## Structure finale du projet

```
menuqr/
├── CLAUDE.md                    ← règles globales (lu automatiquement)
├── docs/
│   ├── ROADMAP.md               ← ce fichier
│   ├── STACK.md                 ← stack technique complète
│   ├── MODULES.md               ← 14 modules détaillés
│   ├── CONVENTIONS.md           ← conventions de code
│   └── PROMPTS.md               ← 14 prompts Claude Code
├── menuqr-frontend/
│   ├── CLAUDE.md                ← règles frontend
│   ├── public/
│   │   ├── locales/
│   │   │   ├── fr/translation.json
│   │   │   ├── en/translation.json
│   │   │   ├── it/translation.json
│   │   │   └── ar/translation.json
│   │   └── sounds/ding.mp3
│   └── src/
│       ├── api/          → axios.js + fonctions par module
│       ├── components/   → ui/, layout/, auth/, dashboard/, admin/, client/, orders/, ...
│       ├── hooks/        → useAuth, useSocket, useCart, useDashboardSocket
│       ├── i18n/         → index.js (config i18next)
│       ├── pages/        → auth/, dashboard/, admin/, client/
│       ├── store/        → authStore.js, cartStore.js
│       ├── styles/       → globals.css (6 templates CSS)
│       ├── utils/        → currency.js (formatDT), dateHelpers.js
│       ├── App.jsx
│       └── main.jsx
└── menuqr-backend/
    ├── CLAUDE.md                ← règles backend
    ├── src/
    │   ├── config/       → database.js, cloudinary.js
    │   ├── controllers/  → auth, admin, menu, order, reservation, table, pos, analytics, dashboard, public
    │   ├── jobs/         → cron.js (rappels réservations)
    │   ├── middleware/   → auth.js, planGuard.js, tenantGuard.js, rateLimiter.js
    │   ├── models/       → index.js + 25 modèles Sequelize
    │   ├── routes/       → 10 fichiers de routes
    │   ├── services/     → email, sms, push, qrcode, printer, pdf, socket
    │   ├── utils/        → currency.js, slugify.js, tokenGenerator.js
    │   ├── app.js        → Express + Socket.io + routes
    │   └── server.js     → entry point port 3001
    └── .env
```
