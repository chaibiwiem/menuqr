

**CAHIER DES CHARGES**

Plateforme Menu QR Code

*Application Web SaaS — Digitalisation des Menus de Restaurant*

**Hannibal Advanced Solutions**

www.hannibaladvanced.com

Version 5.0 — 2026

**━━━  PARTIE 1 : CAHIER DES CHARGES  ━━━**

# **1\. Introduction & Contexte**

## **1.1 Objectifs**

* Menus digitaux multi-langues (Français, English, Italiano, العربية)

* QR Codes dynamiques et personnalisés par table

* Gestion des commandes et réservations en temps réel

* Paiement sur place — devise : Dinar Tunisien (DT)

* Interface d'administration complète : Super Admin, Owner, Manager, Staff

* Notifications multi-canaux et tableau de bord temps réel

* Onboarding restaurant entièrement géré par le Super Admin

## **1.2 Stack Technologique (V5)**

| ⚡  STACK FINALE — React.js \+ Node.js \+ MySQL — Pas de Next.js |
| :---- |

| Couche | Technologie | Version | Justification |
| :---- | :---- | :---- | :---- |
| Frontend | React.js (Vite) | 18.x | SPA rapide, Vite HMR, déploiement statique |
| Routing | React Router v6 | 6.x | SPA routing côté client |
| UI Framework | Tailwind CSS \+ shadcn/ui | latest | Composants accessibles, dark mode |
| State Global | Zustand | 4.x | State management léger, simple |
| Data Fetching | TanStack Query (React Query) | 5.x | Cache, refetch, mutations |
| i18n | i18next \+ react-i18next | latest | FR / EN / IT / AR (RTL) |
| Graphiques | Recharts | 2.x | Charts responsive, simple |
| Drag & Drop | @dnd-kit | latest | DnD accessible, performant |
| Formulaires | React Hook Form \+ Zod | latest | Validation schema, perf |
| Backend | Node.js \+ Express.js | 20.x / 4.x | REST API, middleware, flexible |
| Base de données | MySQL 8 | 8.x | Relationnel, XAMPP dev, production VPS |
| ORM | Sequelize | 6.x | MySQL compatible, migrations, seeds |
| Auth | JWT \+ bcryptjs | latest | Email/Username — sans OAuth externe |
| Temps réel | Socket.io | 4.x | Commandes, Call Waiter, notifications |
| Upload images | Multer \+ Cloudinary | latest | CDN, resize auto, WebP |
| Email | Nodemailer \+ Resend | latest | Transactionnel, templates HTML |
| QR Code | qrcode \+ sharp | latest | Génération serveur, logo intégré |
| Impression | node-thermal-printer | latest | ESC/POS USB/LAN/Bluetooth |
| PDF | PDFKit | latest | Factures, rapports |
| Cron | node-cron | latest | Rappels réservations, alertes |
| Dev local | XAMPP (Apache \+ MySQL) | latest | phpMyAdmin inclus |
| Production | VPS Linux \+ PM2 \+ Nginx | latest | Process manager, reverse proxy |
| Monitoring | Sentry \+ PM2 monitoring | latest | Erreurs, uptime |

## **1.3 Architecture Générale**

| Composant | Port | Description |
| :---- | :---- | :---- |
| React Frontend (Vite) | 5173 (dev) / dist (prod) | SPA servie par Nginx en production |
| Express API Server | 3001 | REST API \+ Socket.io intégré |
| MySQL Database | 3306 | XAMPP (dev) / MySQL dédié (prod) |
| Socket.io | 3001 (même serveur) | WebSocket sur le même process Express |
| Nginx (prod) | 80 / 443 | Reverse proxy → React dist \+ API |

## **1.4 Multilingue — 4 Langues**

| 🌍  Langues supportées : Français (fr) | English (en) | Italiano (it) | العربية (ar) — avec support RTL complet pour l'arabe |
| :---- |

| Langue | Code | Direction | Scope |
| :---- | :---- | :---- | :---- |
| Français | fr | LTR | Interface admin \+ menu client — langue par défaut |
| English | en | LTR | Interface admin \+ menu client |
| Italiano | it | LTR | Interface admin \+ menu client |
| العربية | ar | RTL | Interface admin \+ menu client (dir="rtl" automatique) |

* Traduction interface complète : menus, boutons, messages, alertes, emails

* Noms et descriptions des plats saisissables en 4 langues

* Sélecteur de langue dans le header (admin) et dans le menu client (QR)

* RTL automatique : police adaptée, layout miroir, alignement texte pour l'arabe

* Fichiers de traduction : /src/i18n/locales/{fr,en,it,ar}.json

* Langue par défaut configurée par restaurant et par utilisateur

## **1.5 Devise — Dinar Tunisien (DT)**

* Devise unique : Dinar Tunisien (DT) — affichage : "25,500 DT" ou "25.500 DT"

* Format nombre : 3 décimales (ex: 12,500 DT)

* Configuration dans le Super Admin : symbole, position (avant/après), séparateur

* Option multi-devises pour future extension (EUR, USD) via table currencies

# **2\. Structure du Projet**

## **2.1 Arborescence React Frontend**

| menuqr-frontend/ ├── public/ │   └── locales/            \# Fichiers i18n (chargés dynamiquement) │       ├── fr/translation.json │       ├── en/translation.json │       ├── it/translation.json │       └── ar/translation.json ├── src/ │   ├── api/                \# Axios instances \+ fonctions API par module │   │   ├── axios.js        \# Instance Axios (baseURL, intercepteurs JWT) │   │   ├── auth.js │   │   ├── restaurants.js │   │   ├── menus.js │   │   ├── orders.js │   │   ├── reservations.js │   │   └── ... │   ├── assets/             \# Images, icônes statiques │   ├── components/ │   │   ├── ui/             \# Composants shadcn/ui \+ custom │   │   ├── layout/         \# DashboardLayout, AdminLayout, ClientLayout │   │   ├── auth/           \# LoginForm, ForgotPassword, ChangePassword │   │   ├── dashboard/      \# Widgets dashboard restaurant │   │   ├── admin/          \# Composants Super Admin │   │   ├── menu/           \# Menu builder, CategoryList, MenuItemCard │   │   ├── client/         \# Menu digital public (templates) │   │   ├── orders/         \# OrderKanban, OrderCard, OrderDetail │   │   ├── reservations/   \# ReservationForm, ReservationCalendar │   │   ├── tables/         \# FloorPlan, TableBadge, QRCodeGenerator │   │   ├── pos/            \# POS interface caisse │   │   └── shared/         \# LanguageSwitcher, CurrencyDisplay, etc. │   ├── hooks/              \# Custom React hooks │   │   ├── useAuth.js      \# Context auth \+ JWT │   │   ├── useSocket.js    \# Socket.io client hook │   │   ├── useCart.js      \# Panier menu client │   │   └── usePlanGuard.js \# Vérif features selon plan │   ├── i18n/ │   │   └── index.js        \# Config i18next \+ détection langue \+ RTL │   ├── pages/ │   │   ├── auth/           \# Login, ForgotPassword, ResetPassword, ChangePassword │   │   ├── dashboard/      \# Dashboard, Menu, Tables, Orders, Reservations... │   │   ├── admin/          \# SuperAdmin pages │   │   └── client/         \# Menu public \[:slug\]/table/\[:token\] │   ├── store/              \# Zustand stores │   │   ├── authStore.js │   │   ├── cartStore.js │   │   └── uiStore.js │   ├── styles/ │   │   └── globals.css     \# Tailwind \+ variables CSS templates \+ RTL overrides │   ├── utils/              \# Formatters (currency DT, dates), helpers │   ├── App.jsx             \# Router principal \+ ProtectedRoute │   └── main.jsx            \# Entry point \+ i18n init \+ QueryClient |
| :---- |

## **2.2 Arborescence Node.js Backend**

| menuqr-backend/ ├── src/ │   ├── config/ │   │   ├── database.js     \# Sequelize \+ MySQL connexion │   │   ├── cloudinary.js   \# Config Cloudinary │   │   └── socket.js       \# Config Socket.io │   ├── controllers/        \# Logique métier par module │   │   ├── authController.js │   │   ├── restaurantController.js │   │   ├── menuController.js │   │   ├── orderController.js │   │   ├── reservationController.js │   │   ├── tableController.js │   │   ├── posController.js │   │   ├── analyticsController.js │   │   └── adminController.js │   ├── middleware/ │   │   ├── auth.js         \# verifyToken (JWT) \+ checkRole │   │   ├── planGuard.js    \# Vérif features selon plan │   │   ├── rateLimiter.js  \# express-rate-limit │   │   ├── upload.js       \# Multer config │   │   └── tenantGuard.js  \# Isolation restaurant\_id │   ├── models/             \# Sequelize models MySQL │   │   ├── index.js        \# Associations \+ sync │   │   ├── User.js │   │   ├── Restaurant.js │   │   ├── Room.js │   │   ├── Table.js │   │   ├── Menu.js │   │   ├── Category.js │   │   ├── MenuItem.js │   │   ├── SupplementGroup.js │   │   ├── SupplementOption.js │   │   ├── Order.js │   │   ├── OrderItem.js │   │   ├── OrderStatusLog.js │   │   ├── Reservation.js │   │   ├── ReservationSettings.js │   │   ├── Payment.js │   │   ├── Subscription.js │   │   ├── Invoice.js │   │   ├── CallWaiter.js │   │   ├── Notification.js │   │   ├── QRScan.js │   │   └── AdminLog.js │   ├── routes/             \# Express routers │   │   ├── auth.routes.js │   │   ├── restaurants.routes.js │   │   ├── menus.routes.js │   │   ├── orders.routes.js │   │   ├── reservations.routes.js │   │   ├── tables.routes.js │   │   ├── pos.routes.js │   │   ├── analytics.routes.js │   │   ├── admin.routes.js │   │   └── public.routes.js  \# Routes publiques (menu client) │   ├── services/ │   │   ├── emailService.js   \# Nodemailer \+ Resend templates │   │   ├── qrcodeService.js  \# Génération QR \+ logo │   │   ├── printerService.js \# ESC/POS thermique │   │   ├── pdfService.js     \# PDFKit factures/rapports │   │   └── socketService.js  \# Émetteurs Socket.io │   ├── jobs/ │   │   └── cron.js           \# node-cron: rappels réservations, alertes expiration │   ├── utils/ │   │   ├── currency.js       \# Formatage DT │   │   ├── slugify.js │   │   └── tokenGenerator.js │   └── app.js               \# Express app \+ Socket.io \+ routes ├── migrations/              \# Sequelize migrations ├── seeders/                 \# Données initiales ├── .env └── server.js                \# Entry point (port 3001\) |
| :---- |

# **3\. Authentification — Règles Strictes**

| 🔒  POLITIQUE : Connexion uniquement via email ou username \+ mot de passe. Aucun OAuth. Aucune inscription publique. Comptes créés uniquement par Super Admin (Owner) ou Owner (Staff). |
| :---- |

## **3.1 Ce qui N'EXISTE PAS**

* Page "Créer un compte" ou "S'inscrire" publique

* OAuth Google / Facebook / GitHub / tout réseau social

* Auto-création de restaurant par un utilisateur

* Tout bouton de connexion sociale sur /login

## **3.2 Ce qui EXISTE**

* Page /login : champ "Email ou Username" \+ mot de passe \+ "Se souvenir de moi"

* Lien "Mot de passe oublié ?" → /forgot-password

* Page /reset-password?token=xxx (token JWT, expiration 1h)

* Page /change-password : forcée à la 1ère connexion (is\_first\_login \= true)

* 2FA optionnel TOTP pour Owner et Manager (otplib \+ QR code authenticator)

* Message bas de page login : "Pour accéder, contactez votre administrateur"

## **3.3 Flux création d'un restaurant**

| Étape | Acteur | Action | Résultat |
| :---- | :---- | :---- | :---- |
| 1 | Client | Souscrit à un plan (hors plateforme) | Paiement validé, plan choisi |
| 2 | Super Admin | Crée restaurant \+ compte Owner dans /admin | Restaurant \+ User créés en base |
| 3 | Système | Email automatique au Owner | URL login, username, mot de passe temporaire |
| 4 | Owner | Se connecte → change mot de passe forcé | is\_first\_login \= false, accès dashboard |
| 5 | Owner | Configure restaurant, crée staff | Membres reçoivent leurs identifiants par email |

# **4\. Module Réservations — Détail Complet**

| 📅  Module disponible à partir du plan PRO. Réservations avec salle configurable : Salle, Terrasse ou Étage. |
| :---- |

## **4.1 Formulaire Client (public)**

**URL : /:slug/reservation — Accessible sans authentification**

| Champ | Type | Validation | Obligatoire |
| :---- | :---- | :---- | :---- |
| Prénom | Text input | Min 2 chars, lettres uniquement | Oui |
| Nom | Text input | Min 2 chars, lettres uniquement | Oui |
| Email | Email input | Format email valide | Oui |
| Téléphone | Tel input | Format international (+216...) | Oui |
| Date de réservation | Date picker | Minimum : aujourd'hui \+ délai config (ex: 2h) | Oui |
| Heure | Select créneaux disponibles | Créneaux dispo selon config restaurant | Oui |
| Nombre de places | Number input | Min 1, Max selon capacité zone choisie | Oui |
| Zone | Select: Salle | Terrasse | Étage | Selon zones activées par le restaurant | Oui |
| Demandes spéciales | Textarea | Max 500 chars (allergies, occasions...) | Non |

### **Comportement dynamique du formulaire :**

* Sélection de date → chargement des créneaux horaires disponibles (appel API)

* Sélection de zone → mise à jour de la capacité max (nombre de places)

* Si créneau complet → désactivé dans le select \+ message "Complet"

* Preview récapitulatif avant soumission (nom, date, heure, couverts, zone)

* Confirmation immédiate à l'écran \+ email de confirmation envoyé

* Email inclut : récapitulatif complet \+ lien d'annulation (token 48h)

## **4.2 Gestion des Réservations (Dashboard Restaurant)**

### **Vue Calendrier (/dashboard/reservations)**

* Calendrier semaine / mois avec créneaux colorés selon statut

* Vue jour : liste des réservations avec détail (nom, heure, couverts, zone)

* Clic sur réservation → drawer de détail avec actions

### **Vue Liste avec filtres :**

* Colonnes : Prénom \+ Nom, Email, Téléphone, Date, Heure, Couverts, Zone, Statut

* Filtres : par date, par statut, par zone (Salle / Terrasse / Étage)

* Recherche : par nom, email ou téléphone

* Export CSV des réservations de la période

### **Actions sur une réservation :**

* Confirmer → email de confirmation au client

* Refuser avec motif → email de refus au client

* Marquer "Arrivé" → table assignée passe à OCCUPÉE dans le plan de salle

* Marquer "No-show" → statistiques \+ libération créneau

* Annuler avec motif → email au client

* Attribuer une table depuis le plan de salle

## **4.3 Statuts des Réservations**

| Statut | Description | Action système | Couleur |
| :---- | :---- | :---- | :---- |
| EN\_ATTENTE | Reçue, non traitée | Notification restaurant \+ email client | Jaune |
| CONFIRMÉE | Acceptée par le restaurant | Email \+ SMS confirmation client | Vert |
| RAPPEL\_ENVOYÉ | Rappel automatique J-1 et H-2 | Email et/ou SMS au client | Bleu clair |
| ARRIVÉE | Client présent, table occupée | Table → OCCUPÉE dans le plan | Bleu |
| TERMINÉE | Service terminé, table libérée | Archivage, table → LIBRE | Gris |
| ANNULÉE\_CLIENT | Client a annulé via le lien | Libération créneau, notif restaurant | Orange |
| ANNULÉE\_RESTAURANT | Restaurant a refusé/annulé | Email client avec motif | Rouge |
| NO\_SHOW | Client absent | Marquage stats, table libérée | Gris foncé |

## **4.4 Configuration Restaurant (/dashboard/reservations/settings)**

| Paramètre | Type | Description |
| :---- | :---- | :---- |
| Zones activées | Multi-select: Salle / Terrasse / Étage | Zones proposées aux clients |
| Capacité par zone | Number par zone | Nb max couverts simultanés par zone |
| Créneaux horaires | Heure ouverture \+ fermeture \+ durée service | Ex: 12h-14h30 (déj) \+ 19h-22h30 (dîner) |
| Délai minimum | Number (heures) | Ex: 2h minimum avant réservation |
| Réservation max à l'avance | Number (jours) | Ex: 30 jours à l'avance maximum |
| Validation | Toggle: Auto / Manuelle | Auto \= confirmé immédiatement, Manuel \= admin valide |
| Rappel J-1 | Toggle \+ canal (email/SMS) | Rappel automatique la veille |
| Rappel H-2 | Toggle \+ canal (SMS/WhatsApp) | Rappel 2h avant |
| Message confirmation | Textarea (traduit en 4 langues) | Message personnalisé après confirmation |
| Politique annulation | Textarea | Conditions affichées au client |
| Module actif | Toggle | Activer/désactiver les réservations |

## **4.5 Modèle de données — Réservation (MySQL)**

| \-- Table reservations CREATE TABLE reservations (   id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),   restaurant\_id CHAR(36) NOT NULL,   table\_id      CHAR(36) NULL,                     \-- attribuée par restaurant   first\_name    VARCHAR(80) NOT NULL,   last\_name     VARCHAR(80) NOT NULL,   email         VARCHAR(191) NOT NULL,   phone         VARCHAR(30) NOT NULL,   date          DATE NOT NULL,   time\_slot     TIME NOT NULL,                      \-- ex: 19:30:00   covers        TINYINT UNSIGNED NOT NULL,           \-- nombre de places   zone          ENUM('SALLE','TERRASSE','ETAGE') NOT NULL,   notes         TEXT NULL,   status        ENUM('EN\_ATTENTE','CONFIRMEE','RAPPEL\_ENVOYE',                      'ARRIVEE','TERMINEE','ANNULEE\_CLIENT',                      'ANNULEE\_RESTAURANT','NO\_SHOW')                 NOT NULL DEFAULT 'EN\_ATTENTE',   cancel\_token  VARCHAR(255) NULL UNIQUE,           \-- token lien annulation   cancel\_reason TEXT NULL,   confirmed\_at  DATETIME NULL,   reminder\_sent TINYINT(1) DEFAULT 0,   created\_at    DATETIME DEFAULT CURRENT\_TIMESTAMP,   updated\_at    DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,   FOREIGN KEY (restaurant\_id) REFERENCES restaurants(id) ON DELETE CASCADE,   FOREIGN KEY (table\_id) REFERENCES tables(id) ON DELETE SET NULL );   \-- Table reservation\_settings CREATE TABLE reservation\_settings (   id                      CHAR(36) PRIMARY KEY DEFAULT (UUID()),   restaurant\_id           CHAR(36) NOT NULL UNIQUE,   zones\_enabled           JSON DEFAULT '\["SALLE"\]',  \-- ex: \["SALLE","TERRASSE"\]   capacity\_salle          SMALLINT DEFAULT 50,   capacity\_terrasse       SMALLINT DEFAULT 30,   capacity\_etage          SMALLINT DEFAULT 20,   open\_slots              JSON NOT NULL,             \-- \[{start:"12:00",end:"14:30"},{start:"19:00",end:"22:30"}\]   service\_duration\_min    SMALLINT DEFAULT 90,       \-- durée moyenne d'un service   min\_hours\_before        TINYINT DEFAULT 2,   max\_days\_ahead          TINYINT DEFAULT 30,   auto\_confirm            TINYINT(1) DEFAULT 0,   reminder\_j1\_enabled     TINYINT(1) DEFAULT 1,   reminder\_j1\_channel     ENUM('EMAIL','SMS','BOTH') DEFAULT 'EMAIL',   reminder\_h2\_enabled     TINYINT(1) DEFAULT 0,   reminder\_h2\_channel     ENUM('SMS','WHATSAPP') DEFAULT 'SMS',   confirmation\_message\_fr TEXT NULL,   confirmation\_message\_en TEXT NULL,   confirmation\_message\_it TEXT NULL,   confirmation\_message\_ar TEXT NULL,   cancellation\_policy     TEXT NULL,   is\_active               TINYINT(1) DEFAULT 1,   FOREIGN KEY (restaurant\_id) REFERENCES restaurants(id) ON DELETE CASCADE ); |
| :---- |

## **4.6 API Routes — Réservations**

| Méthode | Route | Auth | Description |
| :---- | :---- | :---- | :---- |
| GET | /api/public/:slug/reservations/slots?date=\&zone= | Public | Créneaux disponibles pour date \+ zone |
| POST | /api/public/:slug/reservations | Public | Créer réservation (formulaire client) |
| GET | /api/public/reservations/cancel?token= | Public | Annuler via le lien email |
| GET | /api/reservations | Owner/Manager | Liste avec filtres (date, statut, zone) |
| GET | /api/reservations/:id | Owner/Manager | Détail complet |
| PUT | /api/reservations/:id/status | Owner/Manager | Changer statut \+ motif si besoin |
| PUT | /api/reservations/:id/assign-table | Owner/Manager | Attribuer une table |
| GET | /api/reservations/settings | Owner | Config réservations du restaurant |
| PUT | /api/reservations/settings | Owner | Sauvegarder la configuration |
| GET | /api/reservations/export/csv | Owner/Manager | Export CSV période |

# **5\. Modules Principaux**

## **5.1 Menu Digital (QR Client)**

* Accès public : /:slug/table/:qr\_token — aucune auth requise

* Header : bannière, logo, short description, nom restaurant, sélecteur de langue (FR/EN/IT/AR)

* Navigation catégories : sticky, scroll horizontal mobile

* Cards plats : photo, nom (langue active), description, prix en DT

* Modal plat : suppléments, compteur quantité, commentaire libre

* Panier flottant : badge quantité, total en DT, bouton Commander

* Call Waiter : bouton flottant (Appeler serveur / Demande addition / Aide)

* Confirmation commande : récapitulatif \+ instructions paiement sur place (DT)

* Suivi commande : progress bar temps réel via Socket.io

* 6 templates visuels sélectionnables par le restaurant

## **5.2 Commandes Temps Réel**

* Vue Kanban : En attente | En préparation | Prête | Servie | Clôturée

* Cards : numéro commande, table, heure, articles, total en DT

* Drag & drop entre colonnes pour changer statut

* Son \+ toast notification à chaque nouvelle commande

* Impression automatique ESC/POS à la réception

* Filtres : par table, statut, période

## **5.3 Gestion Tables & QR Codes**

* 3 types de zones : Salle, Terrasse, Étage (cohérent avec les réservations)

* QR code unique et dynamique par table (URL modifiable sans réimpression)

* Plan de salle visuel : couleurs selon statut (Libre/Occupée/Réservée/En attente)

* Export QR : PNG, SVG, PDF (par table ou en lot)

* Logo du restaurant au centre du QR code

## **5.4 POS & Caisse**

* Paiement sur place uniquement : Espèces (DT) ou Carte bancaire (terminal physique)

* Mode espèces : saisie montant reçu → calcul monnaie à rendre en DT

* Impression reçus ESC/POS et PDF avec montants en DT

* Clôture de service : rapport journalier (CA total en DT, répartition cash/carte)

## **5.5 Dashboard Restaurant (Owner/Manager)**

* CA journalier en DT avec courbe horaire (Recharts)

* Commandes en cours avec statuts temps réel

* Plan de salle miniature avec statuts colorés

* Top plats vendus \+ Call Waiter en attente

* Gestion du personnel (Managers, Staff) selon limites du plan

## **5.6 Super Admin**

* Création restaurants \+ comptes Owner (wizard 4 étapes)

* Plan & abonnement : FREE / STARTER / PRO / PREMIUM

* QR Code Manager : génération en lot, attribution, modification URL

* Gestion devise DT : symbole, format, décimales

* Facturation PDF avec montants en DT

* Dashboard : KPIs plateforme, alertes, top restaurants

## **5.7 Analytics**

* CA par jour/semaine/mois en DT (Recharts LineChart)

* Top plats : nom, quantité vendue, revenu en DT

* Statistiques réservations : nb, taux remplissage par zone, no-show

* Performances staff, scans QR, taux conversion scan→commande

* Export CSV avec montants en DT

# **6\. Templates Menu Client**

| N° | Nom | Style | Idéal pour |
| :---- | :---- | :---- | :---- |
| 1 | Aurora Glass | \#0D2E4A \+ teal \#00D9C0, glassmorphisme | Bars, lounges, nocturne |
| 2 | Bento Menu | Crème chaud \+ orange \#C8501A, bento grid | Fast-casual, cafés, asiatique |
| 3 | Classic Theme | Crème \#FAFAF8 \+ or \#C9A96E, serif | Gastronomique, bistrots, hôtels |
| 4 | Dark Sleek | Noir \#0E0E0F \+ rouge-orange \#FF5C35 | Bars, clubs, rooftops premium |
| 5 | Editorial Menu | Blanc cassé \#F9F7F4, style magazine | Bistrots haut de gamme |
| 6 | Modern Theme | Blanc \+ violet \#6C47FF | Hôtels, resorts, cafés contemporains |

# **7\. Plan de Développement**

| Phase | Livrables | Pack |
| :---- | :---- | :---- |
| Phase 1 — Setup & Auth | Vite \+ React setup, Express API, MySQL Sequelize, Auth JWT email/username, middleware rôles, Super Admin création restaurant | Tous |
| Phase 2 — Menu client | Interface QR public, 6 templates, i18n 4 langues (FR/EN/IT/AR) \+ RTL, panier, suppléments, affichage DT | Tous |
| Phase 3 — Commandes | Order Management Kanban, Socket.io temps réel, impression ESC/POS, Call Waiter | Pro+ |
| Phase 4 — Réservations | Module réservations complet (formulaire, dashboard, settings, zones Salle/Terrasse/Étage, cron rappels) | Pro+ |
| Phase 5 — POS & Billing | Interface POS caisse DT, abonnements SaaS, factures PDF en DT | Pro+ / Premium |
| Phase 6 — Analytics | Dashboard analytique, rapports, exports CSV (montants DT) | Premium |
| Phase 7 — Super Admin | QR Manager, gestion complète restaurants, devise DT, factures | Interne |
| Phase 8 — Tests & Prod | QA complet, optimisation, audit sécurité, déploiement VPS \+ PM2 \+ Nginx | Tous |

**Hannibal Advanced Solutions — www.hannibaladvanced.com**

*contact@hannibaladvanced.com  |  Version 5.0 — 2026  |  Confidentiel*