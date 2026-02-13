# 🚀 Guide Rapide - Setup Supabase

**Configuration backend en 15 minutes**

---

## ✅ Prérequis Installés

Les dépendances suivantes ont déjà été installées :
- ✅ `@supabase/supabase-js`
- ✅ `@react-native-async-storage/async-storage`
- ✅ `react-native-url-polyfill`

---

## 📋 Étapes à Suivre

### 1️⃣ Créer le Projet Supabase (5 minutes)

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur **"New Project"**
4. Remplir :
   - **Name:** `gart-production` (ou `gart-dev`)
   - **Database Password:** Générer un mot de passe fort (le sauvegarder !)
   - **Region:** Europe West (Frankfurt)
   - **Plan:** Free

5. Attendre la création (~2 minutes)

---

### 2️⃣ Configurer les Variables d'Environnement (2 minutes)

1. Dans Supabase Dashboard, aller dans **Settings > API**
2. Copier les clés suivantes :
   - `Project URL`
   - `anon/public key`

3. Créer le fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

4. Ouvrir `.env` et remplacer les valeurs :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3️⃣ Créer les Tables dans Supabase (5 minutes)

1. Dans Supabase Dashboard, aller dans **SQL Editor**
2. Cliquer sur **"New Query"**
3. Copier-coller le contenu de `supabase/migrations/01_create_tables.sql`
4. Cliquer sur **"Run"** (ou Ctrl+Enter)
5. Répéter pour :
   - `02_enable_rls.sql` (sécurité Row Level Security)
   - `03_seed_data.sql` (données initiales)

✅ Vérification : Aller dans **Database > Tables**, vous devriez voir 10 tables créées.

---

### 4️⃣ Tester la Connexion (3 minutes)

1. Redémarrer le serveur Expo :

```bash
npm run web
```

2. Ouvrir la console développeur du navigateur
3. Exécuter ce code dans la console :

```javascript
// Test de connexion Supabase
fetch('http://localhost:8081')
  .then(() => console.log('✅ App is running'))
  .catch(console.error);
```

---

## 🔍 Vérification du Setup

### Vérifier que les Tables sont Créées

Dans Supabase Dashboard → **Database** → **Tables**, vous devriez voir :

- ✅ `user_profiles`
- ✅ `sales_cycles` (avec 4 cycles)
- ✅ `pickup_locations` (avec 3 points de retrait)
- ✅ `categories` (avec 4 catégories)
- ✅ `products` (avec 10 produits)
- ✅ `orders`
- ✅ `order_items`
- ✅ `user_favorites`
- ✅ `user_notification_preferences`
- ✅ `invoices`

### Vérifier les Données Seed

1. Aller dans **Database** → **Table Editor**
2. Sélectionner la table `products`
3. Vous devriez voir 10 produits (Carottes Bio, Pommes de Terre, etc.)

---

## 🎯 Prochaines Étapes

Une fois Supabase configuré, les prochaines étapes sont :

1. **Migrer le shopStore** pour utiliser Supabase au lieu des données mock
2. **Tester l'app** avec les vraies données
3. **Implémenter l'authentification** (Épic 5)
4. **Intégrer Stripe** (Épic 4)

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

**Solution:** Vérifier que le fichier `.env` existe et contient les bonnes valeurs.

```bash
# Afficher le contenu du .env (macOS/Linux)
cat .env

# S'assurer que les variables commencent par EXPO_PUBLIC_
```

### Erreur : "relation 'products' does not exist"

**Solution:** Les tables n'ont pas été créées. Exécuter les migrations SQL dans l'ordre :
1. `01_create_tables.sql`
2. `02_enable_rls.sql`
3. `03_seed_data.sql`

### Erreur de connexion à Supabase

**Solution:** Vérifier que l'URL Supabase est correcte et que le projet est bien démarré.

```bash
# Tester la connexion avec curl
curl https://your-project.supabase.co

# Devrait retourner une page HTML Supabase
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Guide complet avec architecture détaillée
- **[ROADMAP.md](./ROADMAP.md)** - Planification globale du projet

---

**Temps Total Estimé:** ~15 minutes

**Questions ?** Consultez la [documentation Supabase](https://supabase.com/docs) ou le fichier SUPABASE_SETUP.md
