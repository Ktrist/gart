# 📊 GART - État d'avancement du projet

**Application mobile:** Gart - Le jardin du bon
**Localisation:** Batilly-en-puisaye
**Date de mise à jour:** 26 Janvier 2026
**Version actuelle:** 1.0.0 (MVP en cours)

---

## 🎯 Vue d'ensemble du projet

Application de commerce mobile pour une AMAP locale permettant la vente de produits frais en cycles limités avec paiement sécurisé, gestion utilisateur complète, et notifications push.

### Stack Technique

**Frontend (Mobile App):**
- **Framework:** Expo 54.0 (React Native 0.81.5)
- **Language:** TypeScript
- **State Management:** Zustand
- **Routing:** Expo Router (file-based)
- **HTTP Client:** Axios
- **Styling:** React Native StyleSheet
- **Palette:** Nature (Vert #2E7D32, Beige #F5F5DC)

**Backend (À venir):**
- **API:** Supabase (recommandé) ou Node.js + Express
- **Database:** PostgreSQL
- **Auth:** Firebase Auth ou Supabase Auth
- **Paiement:** Stripe API + Webhooks
- **Notifications:** Expo Push Notifications ou FCM
- **Storage:** Supabase Storage (factures PDF)

### Backlog Global

**Total User Stories:** 35+ réparties en 7 épics

| Épic | User Stories | Statut | Priorité |
|------|--------------|--------|----------|
| Épic 1: Cycles de Vente | 2 US | ✅ Complété | Haute |
| Épic 2: Produits & Stocks | 3 US | ✅ Complété | Haute |
| Épic 3: Panier & Validation | 2 US | ✅ Complété | Haute |
| Épic 4: Paiement Stripe | 3 US | ⏳ Suivant | **Critique** |
| Épic 5: Auth & Profil | 13 US | 🔜 Planifié | Haute |
| Épic 6: Notifications Push | 8 US | 🔜 Planifié | Moyenne |
| Épic 7: Dashboard Producteur | 4 US | 🔜 Planifié | Basse |

---

## ✅ Épics Complétés

### 🟢 ÉPIC 1 : Cycles de Vente & Accueil ✅ COMPLÉTÉ

**User Stories:**
- ✅ **US-1.1:** Status Boutique (Banner Vert/Rouge)
- ✅ **US-1.2:** Message Informatif (Prochaine vente + Countdown)

**Fonctionnalités implémentées:**
- Service de gestion des cycles de vente (`salesCycleService.ts`)
- 4 cycles simulés (Janvier - Mars 2026)
- Affichage dynamique du statut (Ouvert/Fermé)
- Compteur de jours avant la prochaine ouverture
- Informations détaillées sur le cycle actuel
- 5 scénarios de test disponibles

**Fichiers créés:**
- `services/salesCycleService.ts` (200+ lignes)
- `services/salesCycleService.test.ts` (150+ lignes)
- `EPIC_1_IMPLEMENTATION.md` (documentation complète)

**Documentation:** [EPIC_1_IMPLEMENTATION.md](./EPIC_1_IMPLEMENTATION.md)

---

### 🍅 ÉPIC 2 : Produits & Gestion des Stocks ✅ COMPLÉTÉ

**User Stories:**
- ✅ **US-2.1:** Liste Produits avec Stock restant
- ✅ **US-2.2:** Gestion du Stock (UI + Validation)
- ✅ **US-2.3:** Filtres par catégories

**Fonctionnalités implémentées:**
- Propriété `stock` ajoutée à l'interface Product
- 10 produits avec stocks réalistes (0-50 unités)
- Affichage du stock restant en temps réel
- Badge "Stock limité" (≤5 unités) en orange
- Badge "Rupture de stock" en rouge
- Vérification du stock lors de l'ajout au panier
- Désactivation du bouton "+" quand max atteint
- Alerts claires pour stock insuffisant
- Filtres par 5 catégories (scrollable horizontal)
- Méthode `getAvailableStock()` dans le store

**Améliorations UX:**
- Boutons désactivés visuellement (gris + opacité)
- Messages d'erreur explicites avec icônes
- Mise à jour du stock en temps réel après ajout
- Séparation visuelle produits disponibles/rupture

**Fichiers modifiés:**
- `services/api.ts` (interface Product)
- `services/mockData.ts` (ajout stocks)
- `store/shopStore.ts` (vérification + getAvailableStock)
- `app/(tabs)/shop.tsx` (affichage stock + filtres)
- `EPIC_2_IMPLEMENTATION.md` (documentation complète)

**Documentation:** [EPIC_2_IMPLEMENTATION.md](./EPIC_2_IMPLEMENTATION.md)

---

### 🛒 ÉPIC 3 : Panier & Validation ✅ COMPLÉTÉ

**User Stories:**
- ✅ **US-3.1:** Gestion Panier (récapitulatif + total)
- ✅ **US-3.2:** Choix du Retrait (Ferme ou Dépôt)

**Fonctionnalités implémentées:**
- Service de gestion des points de retrait (`pickupService.ts`)
- 3 points de retrait configurés (La Ferme, Dépôt Centre-Ville, Dépôt Gare SNCF)
- Modal de sélection avec informations détaillées (horaires, adresse, description)
- Calcul de distance avec formule Haversine
- Gestion du point de retrait dans le store Zustand
- Validation obligatoire avant checkout
- Récapitulatif détaillé avec sous-total et total
- Vérification du stock en temps réel dans le panier
- Bouton checkout adaptatif selon l'état
- Interface cart complète (550+ lignes)

**Fichiers créés:**
- `services/pickupService.ts` (214 lignes)
- `EPIC_3_IMPLEMENTATION.md` (documentation complète)

**Fichiers modifiés:**
- `store/shopStore.ts` (validation + actions point de retrait)
- `app/(tabs)/cart.tsx` (refonte complète)

**Documentation:** [EPIC_3_IMPLEMENTATION.md](./EPIC_3_IMPLEMENTATION.md)

---

## 📋 Épics en attente



### 💳 ÉPIC 4 : Paiement Stripe & Sécurité (SUIVANT)

**User Stories:**
- [ ] **US-4.1:** Initialisation Paiement (Stripe React Native)
- [ ] **US-4.2:** Vérification Stock Pre-Flight (backend)
- [ ] **US-4.3:** Confirmation de commande

**Prérequis:**
- Installation de `@stripe/stripe-react-native`
- Backend API pour gérer Stripe
- Webhooks pour confirmation
- Clés API Stripe (test + prod)

**À développer:**
- [ ] Intégration Stripe Payment Sheet
- [ ] Endpoint backend `/api/create-payment-intent`
- [ ] Vérification stock en temps réel (pre-flight)
- [ ] Réservation temporaire du stock (15 min)
- [ ] Webhooks de confirmation de paiement
- [ ] Écran de confirmation de commande
- [ ] Gestion des erreurs de paiement

---

### 👤 ÉPIC 5 : Authentification & Profil Utilisateur (MVP Étendu)

**User Stories:**

**Authentification:**
- [ ] **US-5.1:** Inscription avec email/mot de passe
- [ ] **US-5.2:** Connexion avec gestion des erreurs
- [ ] **US-5.3:** Réinitialisation de mot de passe
- [ ] **US-5.4:** Profil utilisateur (édition infos)
- [ ] **US-5.5:** Déconnexion

**Historique & Commandes:**
- [ ] **US-5.6:** Liste des commandes passées avec statuts
- [ ] **US-5.7:** Détail complet d'une commande
- [ ] **US-5.8:** Téléchargement de factures PDF
- [ ] **US-5.9:** Statut de commande en temps réel

**Favoris & Personnalisation:**
- [ ] **US-5.10:** Ajouter/retirer des produits favoris
- [ ] **US-5.11:** Page dédiée aux favoris
- [ ] **US-5.12:** Recommandations basées sur l'historique
- [ ] **US-5.13:** Sauvegarde du panier (persistance)

**Prérequis:**
- Backend Auth (Firebase, Supabase, ou custom)
- Base de données utilisateurs
- Génération de PDF (factures)
- AsyncStorage pour cache local

---

### 🔔 ÉPIC 6 : Notifications Push & Alertes

**User Stories:**

**Notifications de Cycles:**
- [ ] **US-6.1:** Alerte nouveau cycle de vente ouvert
- [ ] **US-6.2:** Alerte fin de cycle proche (J-1)

**Notifications de Produits:**
- [ ] **US-6.3:** Alerte produit favori disponible
- [ ] **US-6.4:** Alerte stock limité sur favoris
- [ ] **US-6.5:** Alerte rupture de stock (produit dans panier)

**Notifications de Commandes:**
- [ ] **US-6.6:** Alerte commande prête à récupérer
- [ ] **US-6.7:** Rappel de retrait (J de retrait)

**Configuration:**
- [ ] **US-6.8:** Préférences de notifications (on/off par type)

**Prérequis:**
- Expo Push Notifications ou Firebase Cloud Messaging (FCM)
- Backend pour envoi de notifications
- Permissions système (iOS/Android)

---

### 📊 ÉPIC 7 : Dashboard Producteur (Admin)

**User Stories:**
- [ ] **US-7.1:** Dashboard des commandes en cours
- [ ] **US-7.2:** Mise à jour manuelle des stocks
- [ ] **US-7.3:** Marquer commande comme "Prête"
- [ ] **US-7.4:** Statistiques de vente par cycle

**Prérequis:**
- Interface web ou app admin dédiée
- Authentification avec rôles (USER vs PRODUCER)
- Graphiques et analytics

---

## 📊 Métriques du projet

### Code Stats
- **Fichiers créés:** ~18 fichiers
- **Lignes de code:** ~2800+ lignes
- **Services:** 4 (api, salesCycle, mockData, pickup)
- **Screens:** 3 (Home, Shop, Cart)
- **Store Zustand:** 1 (shopStore avec pickup + validation)
- **Composants:** Modal pickup, CartItem amélioré

### Fonctionnalités
- ✅ Navigation par onglets (3 tabs)
- ✅ Cycles de vente simulés (4 cycles)
- ✅ Produits avec stock (10 produits)
- ✅ Panier fonctionnel avec validation stock
- ✅ Filtres par catégories (5 catégories)
- ✅ Gestion stock en temps réel
- ✅ 3 points de retrait configurés
- ✅ Modal de sélection de point de retrait
- ✅ Récapitulatif de commande détaillé
- ✅ Validation avant checkout

### Tests
- ✅ 5 scénarios de test (salesCycleService)
- ✅ 7 scénarios de test (Epic 3 - pickupService)
- ⏳ Tests E2E (à venir)
- ⏳ Tests unitaires Store (à venir)

---

## 🚀 Prochaines étapes recommandées

### Phase 1: Intégration Stripe (Épic 4) - PRIORITAIRE
1. Installer `@stripe/stripe-react-native`
   ```bash
   npm install @stripe/stripe-react-native
   ```
2. Créer backend API (Node.js/Express ou Supabase Edge Functions)
   - Endpoint POST `/api/create-payment-intent`
   - Vérification stock en temps réel
   - Réservation temporaire (15 min)
3. Implémenter Stripe Payment Sheet dans l'app
4. Webhooks de confirmation (`payment_intent.succeeded`)
5. Écran de confirmation avec numéro de commande
6. Tests en mode sandbox (carte test: 4242 4242 4242 4242)

### Phase 2: Backend API & Synchronisation
1. Connecter à la vraie API Open Food Network
2. Endpoint de gestion des cycles de vente
3. Synchronisation stocks en temps réel
4. Gestion des commandes côté serveur
5. Système de notifications (commande prête)

### Phase 3: Authentification (Épic 5)
1. Firebase Auth ou solution custom
2. Profil utilisateur avec adresse par défaut
3. Historique des commandes
4. Persistance du panier (AsyncStorage ou API)

### Phase 4: Améliorations UX
1. Toast notifications (remplacement des Alerts)
2. Animations d'ajout au panier
3. Pull-to-refresh pour les cycles/produits
4. Mode hors ligne avec cache

---

## 🐛 Problèmes connus

- ⚠️ NativeWind désactivé (conflit Babel) - Utilise StyleSheet natif
- ℹ️ Données simulées - pas encore connecté à l'API réelle
- ℹ️ Pas de persistance du panier (refresh = perte)

---

## 📱 Comment tester l'application

### Développement Web
```bash
cd ~/Desktop/projets/Gart
npm run web
# Ouvre http://localhost:8081
```

### Développement Mobile
```bash
# iOS (Mac uniquement)
npm run ios

# Android
npm run android

# Expo Go (smartphone)
npm start
# Scanner le QR code
```

### Test des Cycles de Vente
Dans la console développeur:
```typescript
import { runAllTests } from './services/salesCycleService.test';
runAllTests();
```

---

## 📚 Documentation

### Backlog & Planning
- [USER_STORIES.md](./USER_STORIES.md) - Backlog complet (35+ User Stories sur 7 épics)
- [ROADMAP.md](./ROADMAP.md) - Feuille de route stratégique (4 phases, 6-9 semaines)
- [FEATURES.md](./FEATURES.md) - Présentation produit complète (toutes fonctionnalités)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Ce fichier

### Implémentations Complétées
- [EPIC_1_IMPLEMENTATION.md](./EPIC_1_IMPLEMENTATION.md) - Cycles de Vente ✅
- [EPIC_2_IMPLEMENTATION.md](./EPIC_2_IMPLEMENTATION.md) - Produits & Stocks ✅
- [EPIC_3_IMPLEMENTATION.md](./EPIC_3_IMPLEMENTATION.md) - Panier & Validation ✅

---

## 🎨 Design & UX

### Palette de Couleurs
```typescript
COLORS = {
  primary: '#2E7D32',      // Vert principal
  primaryDark: '#1B5E20',  // Vert foncé
  beige: '#F5F5DC',        // Fond beige
  beigeDark: '#E8E8CD',    // Beige foncé
  white: '#FFFFFF',        // Blanc
  red: '#DC2626',          // Rouge (fermé/erreur)
  gray: '#6B7280',         // Gris
  orange: '#F59E0B',       // Orange (stock limité)
}
```

### Principes UX
- 🎯 Clarté du statut (Ouvert/Fermé)
- 🎯 Feedback immédiat (alerts, badges)
- 🎯 Accessibilité (couleurs contrastées, tailles de texte)
- 🎯 Navigation intuitive (3 onglets)
- 🎯 Informations en temps réel (stock, cycle)

---

## 👥 Équipe

**Développeur:** Claude Sonnet 4.5
**Client:** Gart - Le jardin du bon
**Type de projet:** Application mobile AMAP

---

**Dernière mise à jour:** 26 Janvier 2026, 15:30
**Prochaine revue:** Après implémentation Épic 4 (Paiement Stripe)
