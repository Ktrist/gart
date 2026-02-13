# 💳 Guide de Configuration Stripe

**Intégration complète du paiement Stripe avec Supabase**

---

## ✅ Étape 1 : Déployer la Edge Function (À faire maintenant)

Vous devez déployer la fonction `create-payment-intent` sur Supabase.

### Option A : Via le Dashboard Supabase (Recommandé - Plus Simple)

1. **Allez dans votre Supabase Dashboard**
2. **Cliquez sur "Edge Functions"** (dans le menu de gauche)
3. **Cliquez sur "Create a new function"**
4. **Remplissez** :
   - **Name:** `create-payment-intent`
   - **Code:** Copiez-collez **TOUT** le contenu du fichier `supabase/functions/create-payment-intent/index.ts`
5. **Cliquez sur "Deploy"**

### Option B : Via Supabase CLI (Plus Avancé)

```bash
# Installer le Supabase CLI
npm install -g supabase

# Login
supabase login

# Link au projet
supabase link --project-ref VOTRE_PROJECT_REF

# Déployer la fonction
supabase functions deploy create-payment-intent
```

---

## ✅ Étape 2 : Configurer les Secrets Supabase

La Edge Function a besoin de votre **Stripe Secret Key** pour fonctionner.

### Via le Dashboard :

1. **Allez dans Settings > Edge Functions** (dans Supabase)
2. **Scrollez jusqu'à "Function Secrets"**
3. **Cliquez sur "Add Secret"**
4. **Ajoutez** :
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_test_51AbCdEf...` (votre Secret Key Stripe)
5. **Cliquez sur "Save"**

⚠️ **IMPORTANT** : Utilisez la clé qui commence par `sk_test_` (PAS `pk_test_`)

### Via le CLI :

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
```

---

## ✅ Étape 3 : Récupérer l'URL de la Fonction

Une fois déployée :

1. **Allez dans "Edge Functions"** dans Supabase Dashboard
2. **Cliquez sur "create-payment-intent"**
3. **Copiez l'URL de la fonction** (elle ressemble à) :
   ```
   https://xxxxx.supabase.co/functions/v1/create-payment-intent
   ```
4. **Gardez cette URL**, on en aura besoin dans l'app

---

## 📱 Étape 4 : Configuration de l'App (Automatique)

Cette partie sera faite automatiquement par le code :

- Installation du StripeProvider
- Création de l'écran de checkout
- Intégration du Payment Sheet

---

## 🧪 Étape 5 : Tester le Paiement

### Cartes de Test Stripe

Utilisez ces numéros de carte pour tester :

| Type | Numéro | Résultat |
|------|--------|----------|
| ✅ Succès | `4242 4242 4242 4242` | Paiement réussi |
| ❌ Refusé | `4000 0000 0000 0002` | Carte refusée |
| 🔐 3D Secure | `4000 0027 6000 3184` | Requiert authentification |

**Détails pour toutes les cartes de test :**
- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel code 3 chiffres (ex: 123)
- **Code postal** : N'importe lequel (ex: 75001)

---

## 🔄 Flow Complet du Paiement

```
1. Utilisateur ajoute produits au panier
2. Utilisateur choisit point de retrait
3. Utilisateur clique "Valider la commande"
   ↓
4. App appelle create-payment-intent (Edge Function)
   → Edge Function crée Payment Intent via Stripe
   → Retourne le clientSecret
   ↓
5. App affiche Stripe Payment Sheet
   → Utilisateur entre les infos de carte
   → Stripe traite le paiement
   ↓
6. Si succès:
   → Créer la commande dans Supabase
   → Mettre à jour les stocks
   → Afficher confirmation
7. Si échec:
   → Afficher message d'erreur
   → Permettre de réessayer
```

---

## 🐛 Dépannage

### Erreur : "STRIPE_SECRET_KEY not found"
**Solution** : Vérifiez que vous avez ajouté le secret dans Supabase (Étape 2)

### Erreur : "Failed to fetch"
**Solution** : Vérifiez que la Edge Function est bien déployée et l'URL est correcte

### Paiement refusé
**Solution** : Vérifiez que vous utilisez une carte de test valide (4242 4242 4242 4242)

### Erreur CORS
**Solution** : La fonction gère déjà CORS, vérifiez que vous appelez la bonne URL

---

## 📊 Suivi des Paiements

### Dans Stripe Dashboard :

1. **Allez dans "Payments"** pour voir tous les paiements
2. **Cliquez sur un paiement** pour voir les détails
3. **Vérifiez les logs** en cas d'erreur

### Dans Supabase Dashboard :

1. **Allez dans "Edge Functions" > "create-payment-intent"**
2. **Cliquez sur "Logs"** pour voir l'historique des appels
3. **Vérifiez les erreurs** si quelque chose ne fonctionne pas

---

## 🚀 Passage en Production (Plus tard)

Quand vous serez prêt pour la production :

1. **Activez votre compte Stripe** (vérification d'identité)
2. **Remplacez les clés test par les clés production** :
   - Dans `.env` : `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - Dans Supabase Secrets : `STRIPE_SECRET_KEY=sk_live_...`
3. **Testez avec de vraies cartes** (petits montants d'abord)
4. **Configurez les Webhooks Stripe** pour notifications automatiques

---

**Dernière mise à jour :** 27 Janvier 2026
**Prochaine étape :** Créer l'écran de checkout dans l'app
