-- Migration 10: Add role column to user_profiles for admin access
-- Roles: 'user' (default), 'producer' (admin dashboard access)

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'producer'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- RLS: allow producers to read all orders (for admin dashboard)
CREATE POLICY "Producers can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

-- RLS: allow producers to update any order status
CREATE POLICY "Producers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

-- RLS: allow producers to update any product (stock, price, availability)
CREATE POLICY "Producers can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

-- RLS: allow producers to read all user profiles (for order details)
CREATE POLICY "Producers can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'producer'
    )
  );

-- RLS: allow producers to read all order items
CREATE POLICY "Producers can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

COMMENT ON COLUMN user_profiles.role IS 'User role: user (default) or producer (admin access)';
