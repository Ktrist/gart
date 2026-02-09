/**
 * Migration Complète pour l'Authentification
 *
 * Exécutez ce fichier dans Supabase SQL Editor
 * Il combine les migrations 05 et 06
 */

-- ============================================================================
-- PARTIE 1: Mise à jour de la table user_profiles
-- ============================================================================

-- Ajouter les colonnes manquantes
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Créer un index sur email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- PARTIE 2: RLS Policies pour l'authentification
-- ============================================================================

-- ORDERS: Permettre aux utilisateurs de créer et voir leurs commandes
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON orders;

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- ORDER_ITEMS: Permettre la gestion des items de commande
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- USER_PROFILES: Gestion des profils utilisateurs
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON POLICY "Users can create their own orders" ON orders IS
  'Permet aux utilisateurs authentifiés de créer leurs propres commandes';

COMMENT ON POLICY "Users can view their own orders" ON orders IS
  'Permet aux utilisateurs de voir uniquement leurs propres commandes';

COMMENT ON POLICY "Users can update their own pending orders" ON orders IS
  'Permet aux utilisateurs de modifier leurs commandes en attente uniquement';

-- ============================================================================
-- PARTIE 3: Auto-création du profil utilisateur
-- ============================================================================

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après la création d'un utilisateur dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TERMINÉ
-- ============================================================================

-- Si vous voyez ce message, la migration a réussi ! ✅
SELECT 'Migration completed successfully! ✅' AS status;
