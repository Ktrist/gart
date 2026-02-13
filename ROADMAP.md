# 🗺️ ROADMAP - Gart : Le jardin du bon

**Application mobile AMAP - Feuille de route stratégique**
**Dernière mise à jour:** 26 Janvier 2026

---

## 📍 État Actuel (Version 1.0.0-alpha)

### ✅ Fonctionnalités Complétées
- **Épic 1:** Cycles de Vente (Status + Compteur) ✅
- **Épic 2:** Produits & Gestion des Stocks ✅
- **Épic 3:** Panier & Validation (Point de retrait) ✅

### 🎯 Prochaine Étape Immédiate
- **Épic 4:** Paiement Stripe (EN ATTENTE)

---

## 🚀 Phases de Développement

### **PHASE 1: MVP Fonctionnel** (Version 1.0.0) - Priorité HAUTE

**Objectif:** Application utilisable en production avec paiement réel

#### Épic 4: Paiement Stripe & Sécurité ⏳ EN COURS
- **Durée estimée:** 3-5 jours
- **Blocage:** Nécessite backend API
- **User Stories:**
  - US-4.1: Intégration Stripe Payment Sheet
  - US-4.2: Vérification stock pre-flight
  - US-4.3: Confirmation de commande

**Livrables:**
- Backend API (Node.js/Express ou Supabase Edge Functions)
- Endpoints: `/api/create-payment-intent`, `/api/webhooks/stripe`
- Écran de confirmation de commande
- Tests en mode sandbox Stripe

**Dépendances:**
- Installation `@stripe/stripe-react-native`
- Compte Stripe (clés test + prod)
- Serveur pour héberger l'API

---

### **PHASE 2: Expérience Utilisateur Enrichie** (Version 1.1.0) - Priorité MOYENNE

**Objectif:** Fidéliser les utilisateurs avec comptes et personnalisation

#### Épic 5: Authentification & Profil Utilisateur
- **Durée estimée:** 5-7 jours
- **Dépendances:** Backend Auth (Firebase/Supabase recommandé)

**Milestone 5.1: Authentification de Base** (v1.1.0)
- US-5.1: Inscription (email/password)
- US-5.2: Connexion avec validation
- US-5.3: Mot de passe oublié
- US-5.5: Déconnexion
- **Tech Stack:** Firebase Auth ou Supabase Auth
- **Durée:** 2 jours

**Milestone 5.2: Profil & Historique** (v1.1.1)
- US-5.4: Profil utilisateur éditable
- US-5.6: Historique des commandes
- US-5.7: Détail d'une commande
- US-5.9: Statuts de commande (En préparation → Prête → Récupérée)
- **Backend:** Table `users`, `orders`, `order_items`
- **Durée:** 2 jours

**Milestone 5.3: Factures & Documents** (v1.1.2)
- US-5.8: Génération de factures PDF
- **Backend:** Librairie PDFKit ou jsPDF
- **Endpoint:** GET `/api/orders/{orderId}/invoice.pdf`
- **Stockage:** S3, Firebase Storage, ou Supabase Storage
- **Durée:** 1 jour

**Milestone 5.4: Favoris & Recommandations** (v1.2.0)
- US-5.10: Ajouter aux favoris
- US-5.11: Page favoris
- US-5.12: Recommandations basées sur l'historique
- US-5.13: Persistance du panier
- **Backend:** Table `user_favorites`, algorithme de recommandation simple
- **Durée:** 2 jours

---

### **PHASE 3: Engagement & Rétention** (Version 1.3.0) - Priorité MOYENNE

**Objectif:** Notifier les utilisateurs au bon moment pour maximiser les ventes

#### Épic 6: Notifications Push & Alertes
- **Durée estimée:** 4-6 jours
- **Dépendances:** Expo Push Notifications ou Firebase Cloud Messaging

**Milestone 6.1: Infrastructure Notifications** (v1.3.0)
- Configuration Expo Push Notifications ou FCM
- Permissions iOS/Android
- Backend: Endpoint `/api/notifications/send`
- Token management (save device token)
- **Durée:** 1 jour

**Milestone 6.2: Notifications de Cycles** (v1.3.1)
- US-6.1: Alerte nouveau cycle ouvert
- US-6.2: Alerte fin de cycle proche (J-1)
- **Backend:** Cron job ou scheduled function
- **Timing:** J-1 à 18h00 + J d'ouverture à 09h00
- **Durée:** 1 jour

**Milestone 6.3: Notifications de Produits** (v1.3.2)
- US-6.3: Alerte produit favori disponible
- US-6.4: Alerte stock limité sur favoris
- US-6.5: Alerte rupture de stock (produit dans panier)
- **Backend:** Triggers sur changement de stock
- **Durée:** 1,5 jours

**Milestone 6.4: Notifications de Commandes** (v1.3.3)
- US-6.6: Alerte commande prête
- US-6.7: Rappel de retrait
- **Backend:** Trigger manuel (producteur) + cron job
- **Durée:** 1 jour

**Milestone 6.5: Préférences Utilisateur** (v1.3.4)
- US-6.8: Configuration des notifications
- **Interface:** Section dans le profil
- **Backend:** Table `user_notification_preferences`
- **Durée:** 0,5 jour

---

### **PHASE 4: Outils Producteur** (Version 2.0.0) - Priorité BASSE

**Objectif:** Autonomie pour le producteur (gestion stocks, commandes, stats)

#### Épic 7: Dashboard Producteur (Admin)
- **Durée estimée:** 7-10 jours
- **Dépendances:** Interface web dédiée (React Admin, Next.js)

**Milestone 7.1: Dashboard de Base** (v2.0.0)
- US-7.1: Vue d'ensemble des commandes
- **Interface:** Tableau avec filtres (date, statut, point de retrait)
- **Données:** Liste des commandes en temps réel
- **Durée:** 2 jours

**Milestone 7.2: Gestion des Stocks** (v2.0.1)
- US-7.2: Mise à jour manuelle des stocks
- **Interface:** Formulaire d'édition par produit
- **Actions:** Augmenter/diminuer stock, marquer en rupture
- **Durée:** 1,5 jours

**Milestone 7.3: Gestion des Commandes** (v2.0.2)
- US-7.3: Marquer commande comme "Prête"
- **Interface:** Bouton d'action sur chaque commande
- **Trigger:** Envoie notification US-6.6 au client
- **Durée:** 1 jour

**Milestone 7.4: Statistiques & Analytics** (v2.1.0)
- US-7.4: Statistiques de vente par cycle
- **Graphiques:** CA par cycle, produits les plus vendus, nombre de clients
- **Librairie:** Recharts ou Chart.js
- **Durée:** 2,5 jours

---

## 🛠️ Architecture Technique Recommandée

### Backend API

**Option 1: Supabase (Recommandé pour MVP rapide)**
- ✅ Auth intégrée (email/password, OAuth)
- ✅ Base de données PostgreSQL
- ✅ Storage pour fichiers (factures PDF)
- ✅ Edge Functions (serverless)
- ✅ Real-time subscriptions (statuts de commande)
- ⚠️ Limites plan gratuit: 50k requêtes/mois

**Option 2: Backend Custom (Node.js + Express)**
- ✅ Contrôle total
- ✅ Stripe Webhooks faciles à implémenter
- ⚠️ Nécessite hébergement (Railway, Render, Fly.io)
- ⚠️ Auth à développer (Passport.js)

**Option 3: Backend Firebase**
- ✅ Firebase Auth très mature
- ✅ Cloud Functions pour serverless
- ✅ Firestore pour base de données
- ⚠️ Coûts peuvent augmenter rapidement

### Push Notifications

**Option 1: Expo Push Notifications (Recommandé si Expo)**
- ✅ Intégration native avec Expo
- ✅ Service gratuit (quotas généreux)
- ✅ API simple
- ⚠️ Dépendance à Expo

**Option 2: Firebase Cloud Messaging (FCM)**
- ✅ Plus flexible
- ✅ Support iOS + Android
- ⚠️ Configuration plus complexe

### Génération de Factures

**Librairies recommandées:**
- **jsPDF** (client-side): Simple, fonctionne en React Native
- **PDFKit** (server-side): Plus puissant, génération côté backend
- **react-native-pdf** (affichage): Pour visualiser PDF dans l'app

### Base de Données

**Tables nécessaires:**
```sql
users (id, email, password_hash, name, phone, created_at)
orders (id, user_id, total, status, pickup_location_id, created_at, payment_intent_id)
order_items (id, order_id, product_id, quantity, price_at_time)
products (id, name, price, stock, category, available)
user_favorites (user_id, product_id)
user_notification_preferences (user_id, cycles, favorites, orders, promotions)
pickup_locations (id, name, type, address, coordinates, opening_hours)
sales_cycles (id, name, opening_date, closing_date, description)
```

---

## 📊 Estimations Globales

| Épic | User Stories | Durée Estimée | Dépendances Critiques |
|------|--------------|---------------|----------------------|
| Épic 4 | 3 US | 3-5 jours | Backend API, Stripe |
| Épic 5 | 13 US | 7-10 jours | Backend Auth, DB |
| Épic 6 | 8 US | 4-6 jours | Push Notifications service |
| Épic 7 | 4 US | 7-10 jours | Interface web admin |

**Total estimé:** 21-31 jours de développement (hors tests et debugging)

---

## 🎯 Priorisation Stratégique

### Must Have (Version 1.0 - Production Ready)
1. **Épic 4:** Paiement Stripe → Sans cela, pas de revenus
2. **Épic 5 (Base):** Auth + Historique → Fidélisation de base

### Should Have (Version 1.2 - Enhanced UX)
3. **Épic 5 (Avancé):** Favoris + Factures → Expérience premium
4. **Épic 6:** Notifications Push → Engagement et rétention

### Nice to Have (Version 2.0 - Autonomie Producteur)
5. **Épic 7:** Dashboard Admin → Autonomie opérationnelle

---

## 🚧 Risques & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Stripe webhook échoue en prod | Critique | Moyenne | Tests exhaustifs, logs robustes, retry automatique |
| Stock conflict (2 users achètent le dernier item) | Élevé | Moyenne | Vérification pre-flight + lock pessimiste |
| Push notifications bloquées par OS | Moyen | Élevée | Fallback sur email, onboarding pour permissions |
| Backend tombe en production | Critique | Faible | Monitoring (Sentry), auto-scaling, status page |
| RGPD non-conforme (données utilisateurs) | Élevé | Moyenne | Consentement explicite, politique de confidentialité, droit à l'oubli |

---

## 📱 Technologies & Stack Final

### Frontend (App Mobile)
- **Framework:** Expo 54.0 (React Native 0.81.5)
- **Langage:** TypeScript
- **State Management:** Zustand
- **Routing:** Expo Router (file-based)
- **Paiement:** @stripe/stripe-react-native
- **Notifications:** Expo Push Notifications
- **Storage Local:** AsyncStorage
- **PDF Viewer:** react-native-pdf

### Backend
- **API:** Supabase (Auth + DB + Storage + Functions) **OU** Node.js + Express
- **Base de Données:** PostgreSQL (Supabase) ou MongoDB
- **Paiement:** Stripe API + Webhooks
- **Notifications:** Expo Push API ou Firebase FCM
- **PDF Generation:** PDFKit (server-side)
- **Hosting:** Supabase Cloud OU Railway/Render/Fly.io

### DevOps & Monitoring
- **CI/CD:** GitHub Actions
- **Error Tracking:** Sentry
- **Analytics:** Expo Analytics ou Google Analytics
- **Versioning:** Semantic versioning (1.0.0, 1.1.0, etc.)

---

## 📅 Timeline Proposée

**Phase 1 (MVP):** 2-3 semaines
- Semaine 1-2: Épic 4 (Stripe + Backend API)
- Semaine 2-3: Épic 5.1 & 5.2 (Auth + Historique)

**Phase 2 (Enhanced):** 2-3 semaines
- Semaine 3-4: Épic 5.3 & 5.4 (Factures + Favoris)
- Semaine 4-5: Épic 6 (Notifications Push)

**Phase 3 (Admin):** 2-3 semaines
- Semaine 6-8: Épic 7 (Dashboard Producteur)

**Timeline totale:** 6-9 semaines pour une version 2.0 complète

---

## ✅ Prochaines Actions Immédiates

1. **Décider du backend:** Supabase vs Custom (recommandation: Supabase pour vitesse)
2. **Créer compte Stripe:** Mode test pour développement
3. **Commencer Épic 4:** Intégration Stripe Payment Sheet
4. **Designer l'écran de confirmation de commande**
5. **Préparer l'infrastructure backend** (API endpoints, webhooks)

---

**Contact Projet:** Gart - Le jardin du bon, Batilly-en-puisaye
**Dernière révision:** 26 Janvier 2026
**Prochaine révision:** Après Phase 1 (MVP)
