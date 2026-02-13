# 🔐 Guide d'Authentification - Gart

**Système d'authentification complet avec Supabase Auth**

---

## ✅ Ce qui a été implémenté

### Backend Supabase
- ✅ **Supabase Auth** activé (email/password)
- ✅ **Table `user_profiles`** pour les informations utilisateur
- ✅ **RLS Policies** pour sécuriser les données
  - Users peuvent créer et voir leurs commandes
  - Users peuvent gérer leur profil
  - Lecture publique des produits et catégories

### Frontend
- ✅ **AuthContext** (`contexts/AuthContext.tsx`)
  - Gestion de l'état d'authentification global
  - Méthodes : `signUp`, `signIn`, `signOut`, `resetPassword`, `updateProfile`

- ✅ **Écran d'authentification** (`app/auth.tsx`)
  - Connexion / Inscription avec tabs
  - Récupération de mot de passe
  - Validation des formulaires

- ✅ **Écran de profil** (`app/(tabs)/profile.tsx`)
  - Affichage du profil
  - Modification des informations
  - Déconnexion
  - Vue "non connecté" avec CTA

- ✅ **Historique des commandes** (`app/orders-history.tsx`)
  - Liste des commandes de l'utilisateur
  - Détails par commande
  - Pull to refresh

### Intégration
- ✅ **Checkout sécurisé**
  - Vérification d'authentification avant paiement
  - Création de commande avec vrai `user_id`
  - Alert si non connecté avec redirection vers login

---

## 📋 Fichiers créés/modifiés

### Nouveaux fichiers
```
contexts/
  └── AuthContext.tsx                    # Contexte d'authentification global

app/
  ├── auth.tsx                          # Écran de login/signup/reset
  ├── (tabs)/profile.tsx                # Écran de profil utilisateur
  └── orders-history.tsx                # Historique des commandes

supabase/migrations/
  └── 05_auth_rls_policies.sql          # Policies pour auth
```

### Fichiers modifiés
```
app/
  ├── _layout.tsx                       # Ajout AuthProvider + routes
  └── checkout.tsx                      # Vérification auth avant paiement
```

---

## 🔧 Configuration Supabase (À faire)

### Étape 1 : Activer l'authentification par email

1. Allez dans votre **Supabase Dashboard**
2. Cliquez sur **Authentication** > **Providers**
3. Vérifiez que **Email** est activé
4. Configurez les paramètres :
   - ✅ **Enable Email Provider**
   - ✅ **Confirm Email** : Activé (recommandé)
   - ✅ **Secure Email Change** : Activé

### Étape 2 : Exécuter la migration SQL

1. Allez dans **SQL Editor** dans Supabase
2. Copiez le contenu de `supabase/migrations/05_auth_rls_policies.sql`
3. Exécutez le script
4. Vérifiez qu'il n'y a pas d'erreurs

### Étape 3 : Configurer les email templates (Optionnel)

1. Allez dans **Authentication** > **Email Templates**
2. Personnalisez les templates :
   - **Confirm signup** : Email de confirmation d'inscription
   - **Reset password** : Email de réinitialisation de mot de passe
   - **Change email** : Email de changement d'adresse

---

## 🧪 Tester l'authentification

### Test 1 : Inscription
1. Lancez l'app : `npm start`
2. Cliquez sur l'onglet **"Profil"**
3. Cliquez sur **"Se connecter / S'inscrire"**
4. Allez sur l'onglet **"Inscription"**
5. Remplissez :
   - Nom complet : `Jean Dupont`
   - Email : `jean.dupont@example.com`
   - Mot de passe : `Test1234` (minimum 6 caractères)
   - Confirmer : `Test1234`
6. Cliquez sur **"Créer mon compte"**
7. ✅ Vous devriez voir : "Vérifiez votre email pour confirmer votre inscription"

### Test 2 : Vérification email

Si vous avez activé "Confirm Email" dans Supabase :
1. Allez dans **Supabase Dashboard** > **Authentication** > **Users**
2. Trouvez votre utilisateur
3. Si le statut est "Waiting for verification", cliquez sur les `...` > **Send magic link**
4. OU désactivez temporairement la confirmation :
   - **Authentication** > **Settings** > **Email Auth** > **Confirm email** : OFF

### Test 3 : Connexion
1. Retournez sur l'écran d'authentification
2. Onglet **"Connexion"**
3. Entrez email et mot de passe
4. Cliquez sur **"Se connecter"**
5. ✅ Vous devriez être redirigé vers le profil

### Test 4 : Profil
1. Une fois connecté, vous devriez voir :
   - Votre avatar avec initiale
   - Votre nom et email
   - Vos informations personnelles
2. Cliquez sur **"✏️ Modifier"**
3. Modifiez vos informations (téléphone, adresse, etc.)
4. Cliquez sur **"Enregistrer"**
5. ✅ Les modifications sont sauvegardées

### Test 5 : Commande authentifiée
1. Ajoutez des produits au panier
2. Choisissez un point de retrait
3. Cliquez sur **"Valider la commande"**
4. ✅ L'écran de paiement s'ouvre (vous êtes authentifié)
5. Si vous n'étiez pas connecté, un alert apparaîtrait

### Test 6 : Historique des commandes
1. Depuis le profil, cliquez sur **"Historique des commandes"**
2. ✅ Vous voyez vos commandes passées
3. Pull to refresh pour recharger

### Test 7 : Déconnexion
1. Depuis le profil, scrollez en bas
2. Cliquez sur **"🚪 Se déconnecter"**
3. ✅ Vous revenez à la vue "non connecté"

### Test 8 : Mot de passe oublié
1. Écran d'authentification > **"Mot de passe oublié ?"**
2. Entrez votre email
3. Cliquez sur **"Envoyer le lien"**
4. ✅ Vérifiez votre boîte mail (si emails configurés)

---

## 🔍 Vérification dans Supabase

### 1. Vérifier les utilisateurs
1. **Dashboard** > **Authentication** > **Users**
2. Vous devriez voir votre utilisateur créé
3. Colonnes : email, created_at, last_sign_in

### 2. Vérifier les profils
1. **Dashboard** > **Table Editor** > `user_profiles`
2. Vous devriez voir votre profil
3. Colonnes : id, email, full_name, phone, address, etc.

### 3. Vérifier les commandes
1. **Dashboard** > **Table Editor** > `orders`
2. Après avoir passé une commande, elle devrait apparaître ici
3. `user_id` doit correspondre à votre ID utilisateur (pas 00000000...)

### 4. Vérifier les RLS Policies
1. **Dashboard** > **Authentication** > **Policies**
2. Vérifiez que les policies sont actives :
   - `orders` : Users can create/view their own orders
   - `user_profiles` : Users can create/view/update their profile

---

## 🛡️ Sécurité

### Row Level Security (RLS)
Toutes les tables sensibles sont protégées par RLS :

**Orders :**
- ✅ Users peuvent SEULEMENT voir leurs propres commandes
- ✅ Users peuvent SEULEMENT créer des commandes pour eux-mêmes
- ✅ Users peuvent mettre à jour leurs commandes en statut "pending" uniquement

**User Profiles :**
- ✅ Users peuvent SEULEMENT voir/modifier leur propre profil
- ✅ Impossible de voir les profils des autres utilisateurs

**Products & Categories :**
- ✅ Lecture publique (pour parcourir la boutique)
- ❌ Écriture interdite (seul un admin pourrait modifier via le dashboard)

### Validation
- **Frontend** : Validation des formulaires (email, mot de passe, etc.)
- **Backend** : Supabase valide les formats et applique les RLS policies

---

## 📊 Architecture de l'authentification

```
┌─────────────────┐
│   User Device   │
│                 │
│  AuthContext    │ ← État global de l'utilisateur
│  (useAuth)      │
└────────┬────────┘
         │
         │ signUp / signIn / signOut
         ↓
┌─────────────────────────┐
│   Supabase Auth API     │
│                         │
│ - Gère les sessions     │
│ - Vérifie les mots de   │
│   passe                 │
│ - Envoie les emails     │
└────────┬────────────────┘
         │
         │ auth.uid()
         ↓
┌─────────────────────────┐
│   PostgreSQL + RLS      │
│                         │
│ - user_profiles         │
│ - orders                │
│ - order_items           │
│                         │
│ RLS vérifie que         │
│ auth.uid() = user_id    │
└─────────────────────────┘
```

### Flow d'inscription
```
1. User remplit le formulaire d'inscription
   ↓
2. App appelle signUp(email, password, fullName)
   ↓
3. AuthContext appelle supabase.auth.signUp()
   ↓
4. Supabase crée le compte
   ↓
5. App crée le profil dans user_profiles
   ↓
6. Supabase envoie l'email de confirmation (si activé)
   ↓
7. User confirme son email (ou skip si désactivé)
   ↓
8. User peut se connecter
```

### Flow de connexion
```
1. User entre email + password
   ↓
2. App appelle signIn(email, password)
   ↓
3. AuthContext appelle supabase.auth.signInWithPassword()
   ↓
4. Supabase valide les credentials
   ↓
5. Supabase retourne une session JWT
   ↓
6. AuthContext met à jour l'état (user, session, profile)
   ↓
7. App redirige vers le profil
```

### Flow de commande authentifiée
```
1. User ajoute produits au panier
   ↓
2. User clique "Valider la commande"
   ↓
3. Checkout vérifie if (!user) → alert "Connexion requise"
   ↓
4. Si authentifié, continue vers Stripe Payment Sheet
   ↓
5. Après paiement réussi
   ↓
6. App appelle createOrder({ userId: user.id, ... })
   ↓
7. Supabase vérifie RLS : auth.uid() == user_id ✅
   ↓
8. Commande créée avec le vrai user_id
```

---

## 🐛 Dépannage

### Erreur : "Invalid API key"
**Solution** : Vérifiez que `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` sont dans `.env`

### Erreur : "Email not confirmed"
**Solution** :
- Option 1 : Confirmez l'email via le lien reçu
- Option 2 : Désactivez la confirmation dans **Authentication** > **Settings**

### Erreur : "Permission denied for table user_profiles"
**Solution** : Exécutez le fichier `05_auth_rls_policies.sql` dans Supabase

### L'utilisateur ne peut pas voir ses commandes
**Solution** : Vérifiez que :
1. Les RLS policies sont actives sur la table `orders`
2. Le `user_id` de la commande correspond à `auth.uid()`
3. L'utilisateur est bien authentifié

### Erreur : "User already registered"
**Solution** : Utilisez un autre email ou allez sur "Connexion"

---

## 🚀 Prochaines étapes

### Phase 1 : Améliorer l'expérience (Recommandé)
1. **OAuth Social Login** : Google, Apple (plus facile pour les utilisateurs)
2. **Avatar utilisateur** : Upload de photo de profil
3. **Notifications email** : Confirmation de commande, changement de statut

### Phase 2 : Fonctionnalités avancées
1. **Produits favoris** (US-5.9) : Sauvegarder des produits pour plus tard
2. **Notifications push** (Épic 6) : Alertes produit disponible, commande prête
3. **Téléchargement de factures** (US-5.8) : Générer PDF des commandes

### Phase 3 : Administration
1. **Admin dashboard** : Gérer les utilisateurs, commandes, produits
2. **Roles & permissions** : Admin vs User
3. **Analytics** : Statistiques de ventes, utilisateurs actifs

---

## 📱 Résumé des User Stories implémentées

**Épic 5 : Authentification & Profil Utilisateur** ✅ **TERMINÉ**

- ✅ **US-5.1** : Inscription avec email/password
- ✅ **US-5.2** : Connexion
- ✅ **US-5.3** : Déconnexion
- ✅ **US-5.4** : Récupération de mot de passe
- ✅ **US-5.5** : Consultation du profil
- ✅ **US-5.6** : Modification du profil (nom, téléphone, adresse)
- ✅ **US-5.7** : Historique des commandes
- ⏳ **US-5.8** : Téléchargement de factures (à implémenter)
- ⏳ **US-5.9** : Produits favoris (à implémenter)

---

**Date de création** : 27 Janvier 2026
**Status** : ✅ Prêt pour les tests
**Prochaine étape** : Exécuter la migration SQL `05_auth_rls_policies.sql` dans Supabase
