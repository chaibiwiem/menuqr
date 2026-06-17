
Section 1 — En-tête
# MenuQR — Projet
Plateforme SaaS multi-tenant de menus digitaux QR Code.
Société: Hannibal Advanced Solutions
Version: 5.0 — 2026cs/ pour le détail complet
EOF
## ⚡ Stack (ne jamais changer)
Frontend : React 18 + Vite + React Router v6
UI : Tailwind CSS + shadcn/ui
State : Zustand + TanStack Query
Backend : Node.js 20 + Express 4
DB : MySQL 8 + Sequelize 6 (XAMPP port 3306)
Realtime : Socket.io 4
Auth : JWT + bcryptjs
i18n : i18next — FR / EN / IT / AR
Images : Multer + Cloudinary
Email : Nodemailer + Resend
Section 3 — Règles absolues
## 🔒 Règles absolues
- AUCUN OAuth Google/Facebook/GitHub
- AUCUNE page inscription publique
- AUCUN lien "Créer un compte"
- TOUJOURS formatDT() — JAMAIS prix manuel
- TOUJOURS t() — JAMAIS texte hardcodé
- JAMAIS TypeScript — JS ES6+ uniquement
- Connexion : email OU username + mot de passe
- Comptes créés par Super Admin ou Owner seulement
Section 4 — Devise
## 💱 Devise
DT (Dinar Tunisien) — 3 décimales — ex: 12,500 DT
Fichier : src/utils/currency.js → formatDT(amount, lang)
MySQL : DECIMAL(10,3) pour tous les prix
Section 5 — Langues
## 🌍 Langues
fr | en | it | ar — RTL auto si ar — défaut : fr
Fichiers : /public/locales/{fr,en,it,ar}/translation.json
Hook : useTranslation() — TOUJOURS t() pour les textes
Section 6 — Réservations
## 📅 Réservations
Zones : SALLE | TERRASSE | ÉTAGE
Champs : prénom, nom, email, téléphone, date, heure, couverts, zone, notes
Statuts : EN_ATTENTE → CONFIRMEE → ARRIVEE → TERMINEE | ANNULEE | NO_SHOW
Plan : PRO et PREMIUM uniquement
Section 7 — Conventions
## 📏 Conventions
Composants React : PascalCase.jsx → MenuItemCard.jsx
Fichiers JS : camelCase.js → authController.js
Colonnes MySQL : snake_case → restaurant_id
API success : { data, message }
API error : { error, message }
Section 8 — Ports & structure
## 📁 Structure
Frontend : menuqr-frontend/src/ (port 5173)
Backend : menuqr-backend/src/ (port 3001)
MySQL : localhost:3306 — DB: menuqr_db (XAMPP)
API base : http://localhost:3001/api
Section 9 — Commandes Dev votre bloc
## ⚡ Commandes Dev
cd menuqr-frontend && npm run dev # port 5173
cd menuqr-backend && npm run dev # port 3001
# MySQL: XAMPP → Start Apache + MySQL
# phpMyAdmin: http://localhost/phpmyadmin
Section 10 — Docs votre bloc
## 📚 Documentation Modules
- Réservations: docs/RESERVATIONS.md
- Stack complète: docs/STACK.md
- Conventions: docs/CONVENTIONS.md
- Prompts modules: docs/PROMPTS.md
 - Concept & roadmap: docs/ROADMAP.md
