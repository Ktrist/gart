# 🌱 GART - Fonctionnalités de l'Application

**Application mobile pour l'AMAP "Le jardin du bon"**
**Batilly-en-puisaye (45420)**

---

## 🎯 Vision Produit

Gart est une application mobile complète qui connecte les consommateurs locaux aux producteurs de l'AMAP. Elle permet de commander des produits frais en cycles de vente limités, de gérer son compte utilisateur, et de recevoir des notifications intelligentes pour ne jamais manquer une opportunité.

---

## ✅ Fonctionnalités Disponibles (v1.0.0-alpha)

### 🏠 Accueil & Cycles de Vente
- ✅ **Statut en temps réel** : Vente Ouverte ✅ ou Fermée 🔒
- ✅ **Compteur de jours** avant la prochaine ouverture
- ✅ **Informations détaillées** : Dates du cycle actuel, nom du cycle
- ✅ **4 cycles simulés** (Janvier - Mars 2026)

### 🛒 Boutique & Produits
- ✅ **10 produits frais** avec photos (emojis), prix, et descriptions
- ✅ **Stock en temps réel** : Affichage du stock disponible
- ✅ **Badges visuels** :
  - 📦 Stock normal (>5 unités)
  - ⚠️ Stock limité (≤5 unités)
  - ❌ Rupture de stock
- ✅ **Filtres par catégories** : Tous, Légumes racines, Légumes feuilles, Légumes fruits, Courges
- ✅ **Vérification automatique** : Impossible d'ajouter plus que le stock disponible

### 🛍️ Panier & Validation
- ✅ **Gestion du panier** : Ajout, suppression, modification de quantités
- ✅ **Calcul automatique** du total
- ✅ **Badge sur l'onglet** : Nombre d'articles dans le panier
- ✅ **Choix du point de retrait** : 3 options disponibles
  - 🚜 La Ferme (Lieu-dit Le Potager)
  - 🏪 Dépôt Centre-Ville (Place de la Mairie)
  - 🚉 Dépôt Gare SNCF (Parvis de la Gare)
- ✅ **Informations détaillées** : Horaires d'ouverture, adresse, description
- ✅ **Récapitulatif de commande** : Sous-total, frais de service, total
- ✅ **Validation obligatoire** : Impossible de commander sans point de retrait

---

## 🔜 Fonctionnalités à Venir

### 💳 Paiement Sécurisé (v1.0.0 - Production Ready)
- 🔜 **Paiement par carte bancaire** via Stripe
- 🔜 **Sécurité maximale** : PCI-DSS compliant
- 🔜 **Vérification pre-flight** : Stock vérifié avant paiement
- 🔜 **Confirmation de commande** : Numéro de commande unique
- 🔜 **Reçu par email** : Récapitulatif de la commande

**Disponibilité prévue:** 2-3 semaines

---

### 👤 Compte Utilisateur & Profil (v1.1.0 - Enhanced UX)

#### Authentification
- 🔜 **Inscription** : Créer un compte avec email et mot de passe
- 🔜 **Connexion sécurisée** : Gestion des erreurs (identifiants incorrects)
- 🔜 **Mot de passe oublié** : Réinitialisation par email
- 🔜 **Profil éditable** : Modifier nom, prénom, téléphone, adresse

#### Historique des Commandes
- 🔜 **Liste complète** : Toutes vos commandes passées
- 🔜 **Détails de commande** : Produits, quantités, point de retrait, date
- 🔜 **Statuts en temps réel** :
  - 💳 Paiement confirmé
  - 📦 En préparation
  - ✅ Prête à récupérer
  - 🎉 Récupérée
- 🔜 **Factures PDF** : Téléchargement de vos factures

#### Favoris & Personnalisation
- 🔜 **Produits favoris** : Marquez vos produits préférés avec un ❤️
- 🔜 **Page dédiée** : Retrouvez facilement vos favoris
- 🔜 **Recommandations** : Suggestions basées sur votre historique
- 🔜 **Panier sauvegardé** : Retrouvez votre panier même après fermeture de l'app

**Disponibilité prévue:** 4-6 semaines

---

### 🔔 Notifications Push Intelligentes (v1.3.0 - Engagement)

#### Alertes de Cycles
- 🔜 **Nouveau cycle ouvert** : "🟢 La vente est ouverte ! Découvrez les produits de la semaine"
  - Envoyée J-1 à 18h00 + J d'ouverture à 09h00
- 🔜 **Fin de cycle proche** : "⏰ Plus que 24h pour commander !"
  - Envoyée J-1 avant fermeture à 18h00

#### Alertes de Produits
- 🔜 **Favori disponible** : "❤️ Vos Tomates Grappe sont de retour !"
  - Quand un produit en rupture redevient disponible
- 🔜 **Stock limité** : "⚠️ Stock limité : Plus que 3 kg de Carottes Bio !"
  - Uniquement pour vos produits favoris (≤5 unités)
- 🔜 **Rupture de stock** : "❌ Rupture : Les Haricots Verts ne sont plus disponibles"
  - Si un produit dans votre panier devient indisponible

#### Alertes de Commandes
- 🔜 **Commande prête** : "✅ Votre commande est prête ! Retrait disponible à La Ferme"
  - Envoyée par le producteur quand votre commande est prête
- 🔜 **Rappel de retrait** : "📦 N'oubliez pas de récupérer votre commande aujourd'hui !"
  - Rappel le jour du retrait à 10h00

#### Préférences
- 🔜 **Configuration personnalisée** : Activez/désactivez les notifications par type
  - Cycles de vente
  - Produits favoris
  - Commandes
  - Promotions

**Disponibilité prévue:** 6-8 semaines

---

### 📊 Tableau de Bord Producteur (v2.0.0 - Autonomie)

**Interface web dédiée pour le producteur**

#### Gestion des Commandes
- 🔜 **Vue d'ensemble** : Tableau de bord avec toutes les commandes
- 🔜 **Filtres** : Par date, statut, point de retrait
- 🔜 **Actions** : Marquer commande comme "Prête" (envoie notification au client)

#### Gestion des Stocks
- 🔜 **Mise à jour manuelle** : Augmenter/diminuer les stocks
- 🔜 **Rupture de stock** : Marquer un produit comme indisponible
- 🔜 **Historique** : Tracking des variations de stock

#### Statistiques & Analytics
- 🔜 **Chiffre d'affaires** : Par cycle, par mois
- 🔜 **Produits populaires** : Produits les plus vendus
- 🔜 **Nombre de clients** : Clients actifs par cycle
- 🔜 **Graphiques visuels** : Evolution des ventes

**Disponibilité prévue:** 10-12 semaines

---

## 🎨 Design & Expérience Utilisateur

### Palette de Couleurs
```
🟢 Vert principal : #2E7D32 (nature, fraîcheur)
🟤 Beige : #F5F5DC (chaleur, authenticité)
🔴 Rouge : #DC2626 (fermé, erreur, rupture)
🟠 Orange : #F59E0B (alerte, stock limité)
⚪ Blanc : #FFFFFF (clarté)
```

### Principes UX
- 🎯 **Clarté du statut** : Vente ouverte/fermée visible immédiatement
- 🎯 **Feedback immédiat** : Alerts, badges, animations
- 🎯 **Accessibilité** : Couleurs contrastées, tailles de texte adaptées
- 🎯 **Navigation intuitive** : 3 onglets (Home, Shop, Cart)
- 🎯 **Informations en temps réel** : Stock, cycles, commandes

### Animations & Interactions
- Transitions fluides entre les écrans
- Modal slide-up pour la sélection du point de retrait
- Badges animés sur l'onglet Panier
- Boutons désactivés visuellement (gris + opacité)

---

## 📱 Plateformes Supportées

- ✅ **iOS** : iPhone 11 et supérieur (iOS 14+)
- ✅ **Android** : Android 10 et supérieur
- ✅ **Web** : Navigation dans le navigateur (développement uniquement)

---

## 🔒 Sécurité & Confidentialité

### Paiement
- **Stripe** : Certifié PCI-DSS Level 1 (le plus haut niveau de sécurité)
- **Aucune donnée bancaire** stockée dans l'application
- **Cryptage SSL/TLS** : Toutes les communications sécurisées

### Données Utilisateur
- **Conformité RGPD** : Consentement explicite, droit à l'oubli
- **Mot de passe** : Hashé avec bcrypt (jamais stocké en clair)
- **Authentification** : Token JWT avec expiration
- **Politique de confidentialité** : Transparente et accessible

### Notifications
- **Permissions explicites** : Demandées lors du premier lancement
- **Opt-out facile** : Désactivation dans les réglages du profil
- **Pas de spam** : Fréquence limitée (1 notification par type par cycle)

---

## 📊 Statistiques Actuelles

### Code
- **Fichiers créés:** 18 fichiers
- **Lignes de code:** ~2800+ lignes
- **Services:** 4 (api, salesCycle, mockData, pickup)
- **Screens:** 3 (Home, Shop, Cart)
- **Composants:** 5+ (ProductCard, CartItem, Modal, etc.)

### Produits
- **10 produits** disponibles (légumes frais)
- **5 catégories** : Légumes racines, feuilles, fruits, courges
- **3 points de retrait** : Ferme + 2 dépôts

### Fonctionnalités
- ✅ 7 US complétées (Épics 1, 2, 3)
- 🔜 28+ US à venir (Épics 4, 5, 6, 7)

---

## 🚀 Roadmap Visuelle

```
┌──────────────────────────────────────────────────────────────┐
│ AUJOURD'HUI (v1.0.0-alpha)                                   │
│ ✅ Cycles de Vente                                           │
│ ✅ Produits & Stocks                                         │
│ ✅ Panier & Point de Retrait                                 │
└──────────────────────────────────────────────────────────────┘
                          ⬇️
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1 : MVP (2-3 semaines)                                 │
│ 🔜 Paiement Stripe                                           │
│ 🔜 Backend API                                               │
└──────────────────────────────────────────────────────────────┘
                          ⬇️
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2 : Enhanced UX (4-6 semaines)                         │
│ 🔜 Authentification & Profil                                 │
│ 🔜 Historique des Commandes                                  │
│ 🔜 Factures PDF                                              │
│ 🔜 Produits Favoris                                          │
└──────────────────────────────────────────────────────────────┘
                          ⬇️
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3 : Engagement (6-8 semaines)                          │
│ 🔜 Notifications Push                                        │
│ 🔜 Alertes Intelligentes                                     │
│ 🔜 Préférences Personnalisées                                │
└──────────────────────────────────────────────────────────────┘
                          ⬇️
┌──────────────────────────────────────────────────────────────┐
│ PHASE 4 : Autonomie Producteur (10-12 semaines)              │
│ 🔜 Dashboard Admin                                           │
│ 🔜 Gestion Stocks & Commandes                                │
│ 🔜 Statistiques & Analytics                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 💡 Cas d'Utilisation

### Pour le Consommateur

**Scénario 1: Première Commande**
1. Ouvre l'app → Voit le statut "Vente Ouverte ✅"
2. Parcourt les produits → Ajoute 3 kg de Carottes, 2 kg de Tomates
3. Voit le stock restant en temps réel (22 kg de Carottes)
4. Va au panier → Choisit le point de retrait "La Ferme"
5. Valide → Paye par carte bancaire (Stripe)
6. Reçoit confirmation → Reçoit notification "Commande prête" le vendredi
7. Récupère sa commande le vendredi entre 16h-19h

**Scénario 2: Client Fidèle**
1. Reçoit notification "🟢 La vente est ouverte !"
2. Ouvre l'app → Voit ses produits favoris ❤️ (Carottes, Tomates, Poireaux)
3. Ajoute ses favoris au panier en 2 clics
4. Point de retrait déjà sauvegardé (Dépôt Centre-Ville)
5. Paye en 30 secondes
6. Consulte l'historique → Télécharge les factures pour ses impôts

**Scénario 3: Alerte Stock Limité**
1. Reçoit notification "⚠️ Stock limité : Plus que 3 kg de Haricots Verts !"
2. Ouvre l'app immédiatement
3. Ajoute 2 kg au panier avant rupture
4. Commande validée → Satisfait d'avoir eu les derniers haricots

### Pour le Producteur

**Scénario 1: Gestion Quotidienne**
1. Se connecte au dashboard admin (web)
2. Voit 25 nouvelles commandes pour le cycle
3. Met à jour les stocks (récolte du jour)
4. Marque 10 commandes comme "Prêtes"
5. Les clients reçoivent automatiquement la notification

**Scénario 2: Fin de Semaine**
1. Consulte les statistiques du cycle
2. Voit que les Tomates Grappe ont été les plus vendues (35 kg)
3. Planifie la récolte de la semaine prochaine en conséquence
4. Exporte le rapport pour la comptabilité

---

## 🎁 Valeur Ajoutée

### Pour les Consommateurs
- 🌱 **Produits locaux et frais** : Directement du producteur
- ⏱️ **Gain de temps** : Commande en ligne, retrait rapide
- 💰 **Transparence des prix** : Pas d'intermédiaire
- 📱 **Expérience moderne** : App intuitive et rapide
- 🔔 **Ne ratez rien** : Notifications au bon moment

### Pour le Producteur
- 📊 **Visibilité** : Nombre de clients, chiffre d'affaires
- 🤖 **Automatisation** : Commandes, paiements, notifications
- 📈 **Anticipation** : Statistiques pour planifier les récoltes
- 💳 **Paiement sécurisé** : Stripe gère tout
- 🕐 **Temps économisé** : Plus besoin de gérer manuellement

---

**Contact Projet:** Gart - Le jardin du bon
**Localisation:** Batilly-en-puisaye (45420)
**Version Actuelle:** 1.0.0-alpha
**Dernière mise à jour:** 26 Janvier 2026
