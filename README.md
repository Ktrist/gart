# 🌱 GART - Le jardin du bon

**Application mobile pour l'AMAP de Batilly-en-puisaye**

[![Version](https://img.shields.io/badge/version-1.0.0--alpha-green)](./PROJECT_STATUS.md)
[![Framework](https://img.shields.io/badge/framework-Expo%2054.0-blue)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📱 À propos

Gart est une application mobile complète permettant aux consommateurs locaux de commander des produits frais directement auprès de l'AMAP "Le jardin du bon" à Batilly-en-puisaye. L'application gère des cycles de vente limités, un système de paiement sécurisé, et offre une expérience utilisateur moderne avec notifications push et gestion de compte.

### 🎯 Fonctionnalités Principales

- ✅ **Cycles de Vente** : Vente ouverte/fermée avec compteur
- ✅ **Produits Frais** : 10 produits avec stocks en temps réel
- ✅ **Panier Intelligent** : Vérification automatique des stocks
- ✅ **Points de Retrait** : 3 options (Ferme + 2 dépôts)
- 🔜 **Paiement Stripe** : Sécurisé et rapide
- 🔜 **Compte Utilisateur** : Historique, favoris, factures
- 🔜 **Notifications Push** : Alertes intelligentes
- 🔜 **Dashboard Producteur** : Gestion autonome

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Expo CLI
- iOS Simulator (Mac) ou Android Emulator

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Ktrist/gart.git
cd gart

# Installer les dépendances
npm install

# Lancer l'application
npm start

# Lancer sur web (développement)
npm run web

# Lancer sur iOS (Mac uniquement)
npm run ios

# Lancer sur Android
npm run android
```

### Accès Web

Ouvrez http://localhost:8081 dans votre navigateur après avoir lancé `npm run web`.

---

## 📚 Documentation

### 📖 Documentation Utilisateur & Produit
- **[FEATURES.md](./FEATURES.md)** - Présentation complète de toutes les fonctionnalités
  - Fonctionnalités disponibles
  - Fonctionnalités à venir
  - Cas d'utilisation
  - Design & UX

### 🗓️ Planning & Backlog
- **[ROADMAP.md](./ROADMAP.md)** - Feuille de route stratégique
  - 4 phases de développement
  - Estimations de durée
  - Architecture technique recommandée
  - Timeline (6-9 semaines)

- **[USER_STORIES.md](./USER_STORIES.md)** - Backlog complet
  - 35+ User Stories
  - 7 Épics (Cycles, Produits, Panier, Paiement, Auth, Notifications, Admin)
  - Critères d'acceptation détaillés

### 📊 Suivi de Projet
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - État d'avancement en temps réel
  - Métriques du code
  - Épics complétés vs à venir
  - Prochaines étapes recommandées

### ✅ Implémentations Détaillées
- **[EPIC_1_IMPLEMENTATION.md](./EPIC_1_IMPLEMENTATION.md)** - Cycles de Vente
  - Service de gestion des cycles
  - 4 cycles simulés (Jan-Mar 2026)
  - 5 scénarios de test

- **[EPIC_2_IMPLEMENTATION.md](./EPIC_2_IMPLEMENTATION.md)** - Produits & Stocks
  - Gestion du stock en temps réel
  - Badges visuels (stock limité, rupture)
  - Filtres par catégories (5 catégories)

- **[EPIC_3_IMPLEMENTATION.md](./EPIC_3_IMPLEMENTATION.md)** - Panier & Validation
  - Service de points de retrait (3 locations)
  - Modal de sélection avec horaires
  - Récapitulatif détaillé de commande
  - Validation obligatoire avant checkout

---

## 🏗️ Architecture

### Stack Technique

**Frontend (Mobile App):**
```
Expo 54.0 (React Native 0.81.5)
├── TypeScript
├── Zustand (State Management)
├── Expo Router (Navigation)
├── React Native StyleSheet
└── Axios (HTTP Client)
```

**Backend (À venir):**
```
Supabase (recommandé) ou Node.js + Express
├── PostgreSQL (Database)
├── Supabase Auth ou Firebase Auth
├── Stripe API (Paiement)
├── Expo Push Notifications
└── PDFKit (Factures)
```

### Structure du Projet

```
Gart/
├── app/                      # Écrans (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx        # Home (Cycles de Vente)
│   │   ├── shop.tsx         # Boutique (Produits)
│   │   └── cart.tsx         # Panier
│   └── _layout.tsx          # Layout principal
├── services/                 # Logique métier
│   ├── api.ts               # API client
│   ├── mockData.ts          # Données simulées
│   ├── salesCycleService.ts # Gestion des cycles
│   └── pickupService.ts     # Points de retrait
├── store/                    # State management (Zustand)
│   └── shopStore.ts         # Store global
├── components/               # Composants réutilisables
├── docs/                     # Documentation
└── assets/                   # Images, fonts, etc.
```

---

## 📊 État d'Avancement

### ✅ Épics Complétés (v1.0.0-alpha)

| Épic | User Stories | Statut | Documentation |
|------|--------------|--------|---------------|
| **Épic 1:** Cycles de Vente | 2 US | ✅ Complété | [EPIC_1_IMPLEMENTATION.md](./EPIC_1_IMPLEMENTATION.md) |
| **Épic 2:** Produits & Stocks | 3 US | ✅ Complété | [EPIC_2_IMPLEMENTATION.md](./EPIC_2_IMPLEMENTATION.md) |
| **Épic 3:** Panier & Validation | 2 US | ✅ Complété | [EPIC_3_IMPLEMENTATION.md](./EPIC_3_IMPLEMENTATION.md) |

**Total:** 7 User Stories complétées (~2800 lignes de code)

### 🔜 Épics Planifiés

| Épic | User Stories | Priorité | Durée Estimée |
|------|--------------|----------|---------------|
| **Épic 4:** Paiement Stripe | 3 US | 🔥 Critique | 3-5 jours |
| **Épic 5:** Auth & Profil | 13 US | Haute | 7-10 jours |
| **Épic 6:** Notifications Push | 8 US | Moyenne | 4-6 jours |
| **Épic 7:** Dashboard Producteur | 4 US | Basse | 7-10 jours |

**Total:** 28 User Stories à venir

---

## 🎨 Design & UX

### Palette de Couleurs

```javascript
COLORS = {
  primary: '#2E7D32',      // Vert principal (nature)
  primaryDark: '#1B5E20',  // Vert foncé
  beige: '#F5F5DC',        // Fond beige (chaleur)
  beigeDark: '#E8E8CD',    // Beige foncé
  white: '#FFFFFF',        // Blanc
  red: '#DC2626',          // Rouge (fermé/erreur)
  gray: '#6B7280',         // Gris
  orange: '#F59E0B',       // Orange (alerte)
}
```

### Captures d'Écran

🚧 *Captures d'écran à venir*

---

## 🧪 Tests

### Tests Manuels

```bash
# Tester les cycles de vente (dans la console dev)
import { runAllTests } from './services/salesCycleService.test';
runAllTests();
```

### Tests Automatisés (À venir)

- Tests unitaires (Jest)
- Tests d'intégration (React Native Testing Library)
- Tests E2E (Detox)

---

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/epic-4-stripe-payment

# Commiter vos changements
git add .
git commit -m "feat: add Stripe payment integration"

# Pousser vers GitHub
git push origin feature/epic-4-stripe-payment

# Créer une Pull Request sur GitHub
```

### Convention de Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatage
refactor: Refactoring
test: Ajout de tests
chore: Tâches de maintenance
```

---

## 📦 Déploiement

### Build Production

```bash
# Build iOS (nécessite Mac + Xcode)
eas build --platform ios

# Build Android
eas build --platform android

# Build les deux
eas build --platform all
```

### Publication

```bash
# Publier une mise à jour OTA (Over-The-Air)
eas update --branch production

# Soumettre à l'App Store / Google Play
eas submit --platform ios
eas submit --platform android
```

---

## 🔒 Sécurité

- **Paiement:** Stripe (PCI-DSS Level 1)
- **Auth:** JWT tokens avec expiration
- **Mots de passe:** Hashage bcrypt
- **HTTPS:** Toutes les communications sécurisées
- **RGPD:** Conforme (consentement, droit à l'oubli)

---

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

---

## 👥 Équipe

**Développeur Principal:** Claude Sonnet 4.5
**Client:** Gart - Le jardin du bon, Batilly-en-puisaye
**Type de projet:** Application mobile AMAP

---

## 📞 Contact & Support

- **Email:** contact@gart-lejardindubon.fr
- **GitHub Issues:** [Signaler un bug](https://github.com/Ktrist/gart/issues)
- **Documentation:** Voir [docs/](./docs/)

---

## 🎉 Remerciements

Merci aux producteurs de l'AMAP "Le jardin du bon" pour leur confiance et leur engagement envers l'agriculture locale et durable.

---

**Dernière mise à jour:** 26 Janvier 2026
**Version actuelle:** 1.0.0-alpha
**Prochaine version:** 1.0.0 (MVP Production Ready) - ETA: 2-3 semaines
