/**
 * Migration 05: RLS Policies pour l'Authentification
 *
 * Met à jour les policies pour permettre aux utilisateurs authentifiés de :
 * - Créer et consulter leurs commandes
 * - Consulter et modifier leur profil
 */

-- ============================================================================
-- ORDERS: Permettre aux utilisateurs de créer et voir leurs commandes
-- ============================================================================

-- Supprimer toutes les anciennes policies sur orders
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON orders;

-- Nouvelle policy: Les utilisateurs peuvent créer des commandes
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Nouvelle policy: Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Nouvelle policy: Les utilisateurs peuvent mettre à jour leurs propres commandes (statut pending uniquement)
CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ORDER_ITEMS: Permettre la gestion des items de commande
-- ============================================================================

-- Supprimer les anciennes policies sur order_items
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

-- Les utilisateurs peuvent créer des order_items pour leurs commandes
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

-- Les utilisateurs peuvent voir les items de leurs commandes
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

-- ============================================================================
-- USER_PROFILES: Gestion des profils utilisateurs
-- ============================================================================

-- Supprimer les anciennes policies sur user_profiles
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Les policies existantes pour les produits, catégories, etc. restent inchangées
-- car elles permettent déjà la lecture publique

COMMENT ON POLICY "Users can create their own orders" ON orders IS
  'Permet aux utilisateurs authentifiés de créer leurs propres commandes';

COMMENT ON POLICY "Users can view their own orders" ON orders IS
  'Permet aux utilisateurs de voir uniquement leurs propres commandes';

COMMENT ON POLICY "Users can update their own pending orders" ON orders IS
  'Permet aux utilisateurs de modifier leurs commandes en attente uniquement';
