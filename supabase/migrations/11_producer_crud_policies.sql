-- Migration 11: Add INSERT/DELETE policies for producers on products and full CRUD on sales_cycles
-- Required for admin dashboard product creation/deletion and sales cycle management

-- ============================================================================
-- PRODUCTS: Allow producers to create and delete products
-- ============================================================================

CREATE POLICY "Producers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

CREATE POLICY "Producers can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

-- ============================================================================
-- SALES_CYCLES: Allow producers to manage sales cycles
-- ============================================================================

CREATE POLICY "Producers can insert sales cycles"
  ON sales_cycles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

CREATE POLICY "Producers can update sales cycles"
  ON sales_cycles FOR UPDATE
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

CREATE POLICY "Producers can delete sales cycles"
  ON sales_cycles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );

-- ============================================================================
-- ORDERS: Allow producers to delete orders (for cleanup)
-- ============================================================================

CREATE POLICY "Producers can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'producer'
    )
  );
