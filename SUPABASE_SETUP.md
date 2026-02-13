# 🗄️ SUPABASE SETUP - Gart Backend

**Guide complet de configuration du backend Supabase**

---

## 📋 Vue d'ensemble

Ce document décrit la mise en place complète du backend Supabase pour l'application Gart, incluant :
- Schéma de base de données
- Configuration de l'authentification
- Migration des données mock
- Intégration avec l'app React Native

---

## 🚀 Étape 1 : Créer le Projet Supabase

### 1.1 Création du compte et du projet

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name:** `gart-production` (ou `gart-dev` pour développement)
   - **Database Password:** Générer un mot de passe fort (le sauvegarder !)
   - **Region:** Europe West (Frankfurt) - Plus proche de la France
   - **Pricing Plan:** Free (suffisant pour commencer)

5. Attendre la création du projet (~2 minutes)

### 1.2 Récupérer les clés API

Une fois le projet créé, aller dans **Settings > API** et noter :

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI... (SECRET!)
```

⚠️ **IMPORTANT** : Ne jamais commiter `SUPABASE_SERVICE_ROLE_KEY` dans Git !

---

## 🗂️ Étape 2 : Schéma de Base de Données

### 2.1 Architecture des Tables

```
users (Supabase Auth intégré)
├── id (uuid, PK)
├── email (text)
├── created_at (timestamp)
└── ...

user_profiles (informations additionnelles)
├── id (uuid, PK, FK → users.id)
├── first_name (text)
├── last_name (text)
├── phone (text, nullable)
├── address (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

sales_cycles (cycles de vente)
├── id (uuid, PK)
├── name (text)
├── opening_date (timestamptz)
├── closing_date (timestamptz)
├── description (text, nullable)
├── is_active (boolean, default: true)
├── created_at (timestamp)
└── updated_at (timestamp)

pickup_locations (points de retrait)
├── id (uuid, PK)
├── name (text)
├── type (text) -- 'farm' ou 'depot'
├── address (text)
├── city (text)
├── postal_code (text)
├── latitude (float, nullable)
├── longitude (float, nullable)
├── opening_hours (jsonb) -- [{day: "Vendredi", hours: "16h00-19h00"}]
├── description (text)
├── icon (text) -- Emoji ou URL image
├── available_days (text[]) -- Array de jours
├── is_active (boolean, default: true)
├── created_at (timestamp)
└── updated_at (timestamp)

categories (catégories de produits)
├── id (uuid, PK)
├── name (text, unique)
├── slug (text, unique)
├── icon (text, nullable)
├── display_order (integer)
└── created_at (timestamp)

products (produits)
├── id (uuid, PK)
├── name (text)
├── description (text)
├── price (numeric(10,2))
├── unit (text) -- 'kg', 'pièce', 'botte', etc.
├── image_url (text, nullable)
├── stock (integer, default: 0)
├── stock_unit (text, nullable)
├── category_id (uuid, FK → categories.id)
├── is_available (boolean, default: true)
├── sales_cycle_id (uuid, FK → sales_cycles.id, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

orders (commandes)
├── id (uuid, PK)
├── user_id (uuid, FK → users.id)
├── order_number (text, unique) -- Format: "GART-2026-0001"
├── total (numeric(10,2))
├── status (text) -- 'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'
├── pickup_location_id (uuid, FK → pickup_locations.id)
├── sales_cycle_id (uuid, FK → sales_cycles.id)
├── stripe_payment_intent_id (text, nullable)
├── pickup_date (date, nullable)
├── notes (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

order_items (articles de commande)
├── id (uuid, PK)
├── order_id (uuid, FK → orders.id)
├── product_id (uuid, FK → products.id)
├── quantity (numeric(10,2))
├── unit_price (numeric(10,2)) -- Prix au moment de la commande
├── total_price (numeric(10,2)) -- quantity * unit_price
├── product_name (text) -- Snapshot du nom du produit
├── product_unit (text) -- Snapshot de l'unité
└── created_at (timestamp)

user_favorites (produits favoris)
├── id (uuid, PK)
├── user_id (uuid, FK → users.id)
├── product_id (uuid, FK → products.id)
├── created_at (timestamp)
└── UNIQUE(user_id, product_id)

user_notification_preferences (préférences notifications)
├── id (uuid, PK)
├── user_id (uuid, FK → users.id)
├── cycles_enabled (boolean, default: true)
├── favorites_enabled (boolean, default: true)
├── orders_enabled (boolean, default: true)
├── promotions_enabled (boolean, default: false)
├── push_token (text, nullable) -- Token Expo Push
├── created_at (timestamp)
└── updated_at (timestamp)

invoices (factures - optionnel)
├── id (uuid, PK)
├── order_id (uuid, FK → orders.id)
├── invoice_number (text, unique)
├── pdf_url (text) -- URL dans Supabase Storage
├── amount (numeric(10,2))
├── issued_at (timestamp)
└── created_at (timestamp)
```

### 2.2 Création des Tables (SQL)

Aller dans **SQL Editor** dans Supabase et exécuter le script suivant :

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Cycles Table
CREATE TABLE sales_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  opening_date TIMESTAMP WITH TIME ZONE NOT NULL,
  closing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pickup Locations Table
CREATE TABLE pickup_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('farm', 'depot')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  opening_hours JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  stock_unit TEXT,
  category_id UUID REFERENCES categories(id),
  is_available BOOLEAN DEFAULT true,
  sales_cycle_id UUID REFERENCES sales_cycles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
  pickup_location_id UUID REFERENCES pickup_locations(id) NOT NULL,
  sales_cycle_id UUID REFERENCES sales_cycles(id),
  stripe_payment_intent_id TEXT,
  pickup_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  product_name TEXT NOT NULL,
  product_unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Favorites Table
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- User Notification Preferences Table
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  cycles_enabled BOOLEAN DEFAULT true,
  favorites_enabled BOOLEAN DEFAULT true,
  orders_enabled BOOLEAN DEFAULT true,
  promotions_enabled BOOLEAN DEFAULT false,
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table (optionnel)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  pdf_url TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour les performances
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_cycle ON products(sales_cycle_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_cycle ON orders(sales_cycle_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_sales_cycles_dates ON sales_cycles(opening_date, closing_date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_cycles_updated_at BEFORE UPDATE ON sales_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_locations_updated_at BEFORE UPDATE ON pickup_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔒 Étape 3 : Configuration Row Level Security (RLS)

Supabase utilise Row Level Security pour sécuriser les données. Exécuter ces commandes SQL :

```sql
-- Enable RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies pour user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour sales_cycles (lecture publique)
CREATE POLICY "Sales cycles are viewable by everyone"
  ON sales_cycles FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour pickup_locations (lecture publique)
CREATE POLICY "Pickup locations are viewable by everyone"
  ON pickup_locations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies pour categories (lecture publique)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour products (lecture publique)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour orders (utilisateur voit seulement ses commandes)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour order_items (via orders)
CREATE POLICY "Users can view items of their own orders"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- Policies pour user_favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour user_notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour invoices (utilisateur voit ses propres factures)
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid()
  ));
```

---

## 📦 Étape 4 : Migration des Données Mock

Créer un fichier `supabase/seed.sql` pour peupler la base avec les données actuelles :

```sql
-- Insérer les catégories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Légumes racines', 'legumes-racines', 1),
  ('Légumes feuilles', 'legumes-feuilles', 2),
  ('Légumes fruits', 'legumes-fruits', 3),
  ('Courges', 'courges', 4);

-- Insérer les cycles de vente (Janvier - Mars 2026)
INSERT INTO sales_cycles (name, opening_date, closing_date, description) VALUES
  ('Cycle Janvier #1', '2026-01-20 00:00:00+00', '2026-01-26 23:59:59+00', 'Premier cycle de janvier 2026'),
  ('Cycle Février #1', '2026-02-03 00:00:00+00', '2026-02-09 23:59:59+00', 'Premier cycle de février 2026'),
  ('Cycle Février #2', '2026-02-17 00:00:00+00', '2026-02-23 23:59:59+00', 'Deuxième cycle de février 2026'),
  ('Cycle Mars #1', '2026-03-03 00:00:00+00', '2026-03-09 23:59:59+00', 'Premier cycle de mars 2026');

-- Insérer les points de retrait
INSERT INTO pickup_locations (name, type, address, city, postal_code, latitude, longitude, opening_hours, description, icon, available_days) VALUES
  ('La Ferme', 'farm', 'Lieu-dit Le Potager', 'Batilly-en-puisaye', '45420', 47.6667, 3.1667,
   '[{"day": "Vendredi", "hours": "16h00 - 19h00"}, {"day": "Samedi", "hours": "09h00 - 12h00"}]',
   'Retrait directement à la ferme. Venez découvrir notre exploitation et rencontrer les producteurs !',
   '🚜', ARRAY['Vendredi', 'Samedi']),

  ('Dépôt Centre-Ville', 'depot', '12 Place de la Mairie', 'Batilly-en-puisaye', '45420', 47.6700, 3.1650,
   '[{"day": "Mercredi", "hours": "17h00 - 19h00"}, {"day": "Vendredi", "hours": "17h00 - 19h00"}, {"day": "Samedi", "hours": "10h00 - 12h00"}]',
   'Point de retrait en centre-ville, proche de tous les commerces.',
   '🏪', ARRAY['Mercredi', 'Vendredi', 'Samedi']),

  ('Dépôt Gare SNCF', 'depot', 'Parvis de la Gare', 'Batilly-en-puisaye', '45420', 47.6650, 3.1680,
   '[{"day": "Mardi", "hours": "18h00 - 20h00"}, {"day": "Jeudi", "hours": "18h00 - 20h00"}, {"day": "Samedi", "hours": "09h00 - 13h00"}]',
   'Point de retrait pratique à la gare, idéal pour les navetteurs.',
   '🚉', ARRAY['Mardi', 'Jeudi', 'Samedi']);

-- Récupérer les IDs des catégories pour les produits
DO $$
DECLARE
  cat_racines UUID;
  cat_feuilles UUID;
  cat_fruits UUID;
  cat_courges UUID;
  cycle_actuel UUID;
BEGIN
  SELECT id INTO cat_racines FROM categories WHERE slug = 'legumes-racines';
  SELECT id INTO cat_feuilles FROM categories WHERE slug = 'legumes-feuilles';
  SELECT id INTO cat_fruits FROM categories WHERE slug = 'legumes-fruits';
  SELECT id INTO cat_courges FROM categories WHERE slug = 'courges';
  SELECT id INTO cycle_actuel FROM sales_cycles WHERE name = 'Cycle Janvier #1';

  -- Insérer les produits
  INSERT INTO products (name, description, price, unit, image_url, stock, category_id, is_available, sales_cycle_id) VALUES
    ('Carottes Bio', 'Carottes bio fraîchement récoltées', 2.50, 'kg', '🥕', 25, cat_racines, true, cycle_actuel),
    ('Pommes de Terre', 'Variété Charlotte, parfaites pour la cuisson', 1.80, 'kg', '🥔', 50, cat_racines, true, cycle_actuel),
    ('Poireaux', 'Poireaux tendres et savoureux', 3.20, 'kg', '🥬', 15, cat_feuilles, true, cycle_actuel),
    ('Tomates Grappe', 'Tomates en grappe bien mûres', 4.50, 'kg', '🍅', 3, cat_fruits, true, cycle_actuel),
    ('Courgettes', 'Courgettes fraîches du jour', 2.90, 'kg', '🥒', 20, cat_fruits, true, cycle_actuel),
    ('Salades Mélangées', 'Mélange de salades de saison', 2.00, 'pièce', '🥗', 12, cat_feuilles, true, cycle_actuel),
    ('Betteraves Rouges', 'Betteraves rouges cuites sous vide', 3.50, 'kg', '🫐', 8, cat_racines, true, cycle_actuel),
    ('Oignons Jaunes', 'Oignons jaunes de conservation', 1.50, 'kg', '🧅', 0, cat_racines, false, cycle_actuel),
    ('Haricots Verts', 'Haricots verts extra-fins', 5.00, 'kg', '🫘', 2, cat_fruits, true, cycle_actuel),
    ('Courge Butternut', 'Courge butternut entière', 2.80, 'kg', '🎃', 30, cat_courges, true, cycle_actuel);
END $$;
```

Exécuter ce script dans **SQL Editor** de Supabase.

---

## 🔐 Étape 5 : Configuration de l'Authentification

### 5.1 Activer les fournisseurs d'authentification

Dans Supabase Dashboard :
1. Aller dans **Authentication > Providers**
2. Activer "Email" (déjà activé par défaut)
3. Configurer les templates d'emails (optionnel) :
   - Confirmation email
   - Reset password email
   - Magic link email

### 5.2 Configuration des URLs

Dans **Authentication > URL Configuration** :
- **Site URL:** `https://votre-domaine.com` (production) ou `exp://localhost:8081` (dev)
- **Redirect URLs:** Ajouter les URLs autorisées pour les redirections

---

## 📱 Étape 6 : Intégration avec l'App React Native

### 6.1 Installer le client Supabase

```bash
npm install @supabase/supabase-js
```

### 6.2 Créer le fichier de configuration

Créer `services/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 6.3 Configurer les variables d'environnement

Créer `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Ajouter `.env` dans `.gitignore` !

### 6.4 Installer AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## ✅ Étape 7 : Validation du Setup

### 7.1 Tester la connexion

Créer un fichier `test-supabase.ts` :

```typescript
import { supabase } from './services/supabase';

async function testConnection() {
  // Test 1: Récupérer les cycles de vente
  const { data: cycles, error: cyclesError } = await supabase
    .from('sales_cycles')
    .select('*');

  console.log('Cycles:', cycles);
  console.log('Error:', cyclesError);

  // Test 2: Récupérer les produits
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, categories(name)');

  console.log('Products:', products);
  console.log('Error:', productsError);
}

testConnection();
```

---

## 🔧 Prochaines Étapes

1. ✅ **Setup Supabase** : Créer projet, tables, RLS
2. 🔜 **Migration de l'app** : Remplacer mock data par Supabase
3. 🔜 **Tests** : Valider tous les flows (cycles, produits, panier)
4. 🔜 **Intégration Stripe** : Ajouter le paiement
5. 🔜 **Auth UI** : Créer les écrans de connexion/inscription

---

**Date de création:** 26 Janvier 2026
**Prochaine mise à jour:** Après intégration complète dans l'app
