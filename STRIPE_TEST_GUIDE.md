# 🧪 Guide de Test - Paiement Stripe

**Intégration Stripe complète et fonctionnelle !**

---

## ✅ Ce qui a été implémenté

### Backend
- ✅ **Supabase Edge Function** (`create-payment-intent`) déployée
- ✅ **Secret Key Stripe** configurée dans Supabase
- ✅ **Gestion CORS** pour les appels depuis l'app
- ✅ **Conversion montants** (euros → centimes pour Stripe)

### Frontend
- ✅ **StripeProvider** intégré dans l'app
- ✅ **Écran de checkout** (`app/checkout.tsx`)
- ✅ **Écran de confirmation** (`app/order-confirmation.tsx`)
- ✅ **Création de commande** dans Supabase après paiement
- ✅ **Mise à jour du stock** après validation
- ✅ **Support multi-plateforme** (iOS/Android/Web)

### Gestion Web
- ✅ **Mock Stripe pour Web** (`utils/stripe.web.ts`)
- ✅ **Message informatif** sur checkout web
- ✅ **Compilation sans erreur** sur toutes les plateformes

---

## 📱 Comment tester le paiement (iOS/Android uniquement)

### Option 1 : Émulateur iOS (recommandé si vous avez un Mac)

```bash
# 1. Installer les dépendances iOS
cd ios && pod install && cd ..

# 2. Lancer l'émulateur iOS
npm run ios
```

### Option 2 : Émulateur Android

```bash
# 1. S'assurer que l'émulateur Android est lancé
# Ouvrir Android Studio > AVD Manager > Start

# 2. Lancer l'app
npm run android
```

### Option 3 : Device physique (iPhone ou Android)

```bash
# 1. Installer Expo Go sur votre téléphone
# iOS: https://apps.apple.com/app/expo-go/id982107779
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent

# 2. Lancer Expo
npm start

# 3. Scanner le QR code avec votre téléphone
```

---

## 🎯 Flux de test complet

### Étape 1 : Ajouter des produits au panier
1. Cliquez sur l'onglet **"Boutique"**
2. Ajoutez quelques produits (ex: 2 kg de carottes, 1 kg de pommes de terre)
3. Cliquez sur l'onglet **"Panier"**

### Étape 2 : Choisir un point de retrait
1. Cliquez sur **"➕ Choisir un point de retrait"**
2. Sélectionnez un point (ex: "Ferme de Batilly")
3. Confirmez

### Étape 3 : Valider la commande
1. Cliquez sur **"Valider la commande"**
2. L'écran de checkout s'ouvre
3. Vérifiez le récapitulatif (produits, total, point de retrait)

### Étape 4 : Payer avec Stripe
1. Cliquez sur **"Payer X.XX € avec Stripe"**
2. Le **Stripe Payment Sheet** s'ouvre
3. Entrez les informations de test :
   - **Numéro de carte** : `4242 4242 4242 4242`
   - **Date d'expiration** : `12/25` (ou n'importe quelle date future)
   - **CVC** : `123` (ou n'importe quel code 3 chiffres)
   - **Code postal** : `75001` (ou n'importe lequel)
4. Cliquez sur **"Payer"**

### Étape 5 : Confirmation
1. Le paiement est traité par Stripe
2. La commande est créée dans Supabase
3. Le stock des produits est mis à jour
4. Vous êtes redirigé vers **l'écran de confirmation**
5. Vous voyez :
   - ✅ "Paiement réussi !"
   - Numéro de commande (ex: `GART-2026-1234`)
   - Montant payé
   - Point de retrait
   - Prochaines étapes

---

## 💳 Cartes de test Stripe

### Carte de succès
- **Numéro** : `4242 4242 4242 4242`
- **Résultat** : Paiement réussi ✅

### Carte refusée
- **Numéro** : `4000 0000 0000 0002`
- **Résultat** : Carte refusée ❌

### Carte avec authentification 3D Secure
- **Numéro** : `4000 0027 6000 3184`
- **Résultat** : Requiert authentification 🔐

**Pour toutes les cartes :**
- Date d'expiration : N'importe quelle date future
- CVC : N'importe quel code 3 chiffres
- Code postal : N'importe lequel

---

## 🔍 Vérification après le test

### 1. Dans Stripe Dashboard
1. Allez sur https://dashboard.stripe.com/test/payments
2. Vous devriez voir votre paiement avec :
   - Montant : `8.60 €` (ou le total de votre commande)
   - Statut : `Succeeded`
   - Description : `Commande Gart - 2 article(s)`
   - Metadata : Détails du panier et point de retrait

### 2. Dans Supabase Dashboard
1. Allez dans **Table Editor** > `orders`
2. Vous devriez voir une nouvelle commande :
   - `order_number` : GART-2026-XXXX
   - `status` : pending
   - `total` : 8.60
   - `user_id` : 00000000-0000-0000-0000-000000000000 (temporaire)

3. Allez dans **Table Editor** > `order_items`
4. Vous devriez voir les produits de la commande

5. Allez dans **Table Editor** > `products`
6. Vérifiez que le stock a bien diminué

---

## ⚠️ Limitations actuelles

### Sur le Web
- Le paiement Stripe n'est **pas disponible sur le web**
- `@stripe/stripe-react-native` ne fonctionne que sur iOS/Android
- Un message informatif s'affiche sur l'écran de checkout web

### Authentification
- Pour l'instant, un `user_id` temporaire est utilisé
- Après implémentation de l'authentification (Épic 5), les commandes seront liées aux vrais utilisateurs

### Webhooks
- Les webhooks Stripe ne sont pas encore configurés
- La confirmation du paiement se fait uniquement côté client
- En production, il faudra ajouter des webhooks pour la sécurité

---

## 🐛 Dépannage

### Erreur : "Failed to initialize payment sheet"
**Solution** : Vérifiez que :
- La Edge Function est bien déployée
- Le secret `STRIPE_SECRET_KEY` est configuré dans Supabase
- L'URL de la fonction est correcte dans `.env`

### Erreur : "Payment failed"
**Solution** :
- Vérifiez que vous utilisez une carte de test valide
- Vérifiez les logs dans Stripe Dashboard
- Vérifiez les logs de la Edge Function dans Supabase

### L'app ne compile pas
**Solution** :
- Supprimez le cache : `npm start -- --clear`
- Réinstallez les dépendances : `rm -rf node_modules && npm install`
- Sur iOS : `cd ios && pod install && cd ..`

### Erreur de connexion à Supabase
**Solution** :
- Vérifiez que les clés Supabase sont dans `.env`
- Vérifiez que vous avez bien redémarré l'app après modification du `.env`
- Vérifiez que les RLS policies permettent l'accès public aux produits

---

## 🚀 Prochaines étapes

### Phase 1 : Améliorer la sécurité (Recommandé)
1. Configurer les **Stripe Webhooks** pour vérifier les paiements côté serveur
2. Implémenter l'**authentification Supabase** (Épic 5)
3. Lier les commandes aux vrais utilisateurs

### Phase 2 : Améliorer l'expérience
1. Ajouter un **écran de suivi de commande**
2. Envoyer des **emails de confirmation**
3. Ajouter des **notifications push**

### Phase 3 : Production
1. Remplacer les clés test par les **clés production** Stripe
2. Activer votre compte Stripe (vérification d'identité)
3. Tester avec de **vraies cartes** (petits montants d'abord)

---

## 📊 Architecture du flux de paiement

```
┌─────────────┐
│   User      │
│  (Mobile)   │
└──────┬──────┘
       │ 1. Ajoute produits au panier
       │ 2. Choisit point de retrait
       │ 3. Clique "Valider la commande"
       ↓
┌─────────────────────┐
│  checkout.tsx       │
│                     │
│  initializePayment  │
│  Sheet()            │
└──────┬──────────────┘
       │ 4. Appelle Edge Function
       ↓
┌──────────────────────────┐
│ Supabase Edge Function   │
│ create-payment-intent    │
│                          │
│ - Récupère STRIPE_SECRET │
│ - Crée Payment Intent    │
│ - Retourne clientSecret  │
└──────┬───────────────────┘
       │ 5. clientSecret
       ↓
┌─────────────────────┐
│  checkout.tsx       │
│                     │
│  presentPayment     │
│  Sheet()            │
└──────┬──────────────┘
       │ 6. Affiche Stripe Payment Sheet
       ↓
┌─────────────────────┐
│  Stripe SDK         │
│  (Native)           │
│                     │
│  - User entre carte │
│  - Stripe valide    │
└──────┬──────────────┘
       │ 7. Paiement réussi
       ↓
┌─────────────────────┐
│  checkout.tsx       │
│                     │
│  handleSuccessful   │
│  Payment()          │
│                     │
│  - Crée commande    │
│  - Met à jour stock │
│  - Vide panier      │
└──────┬──────────────┘
       │ 8. Redirect
       ↓
┌─────────────────────┐
│ order-confirmation  │
│      .tsx           │
│                     │
│  ✅ Confirmation    │
└─────────────────────┘
```

---

**Date de création** : 27 Janvier 2026
**Status** : ✅ Prêt pour les tests
**Prochaine étape** : Tester sur un émulateur iOS ou Android
