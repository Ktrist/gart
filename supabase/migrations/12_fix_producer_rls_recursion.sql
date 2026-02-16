-- Migration 12: Fix recursive RLS policies causing 500 errors
-- The "Producers can view user profiles" policy queries user_profiles from within
-- a user_profiles SELECT policy, causing infinite recursion.
-- Fix: use a SECURITY DEFINER function to check producer role without triggering RLS.

-- Create a helper function that bypasses RLS to check if user is a producer
CREATE OR REPLACE FUNCTION is_producer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'producer'
  );
$$;

-- ============================================================================
-- Drop all producer policies that use the recursive subquery pattern
-- ============================================================================

DROP POLICY IF EXISTS "Producers can view all orders" ON orders;
DROP POLICY IF EXISTS "Producers can update order status" ON orders;
DROP POLICY IF EXISTS "Producers can delete orders" ON orders;
DROP POLICY IF EXISTS "Producers can update products" ON products;
DROP POLICY IF EXISTS "Producers can insert products" ON products;
DROP POLICY IF EXISTS "Producers can delete products" ON products;
DROP POLICY IF EXISTS "Producers can view user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Producers can view all order items" ON order_items;
DROP POLICY IF EXISTS "Producers can insert sales cycles" ON sales_cycles;
DROP POLICY IF EXISTS "Producers can update sales cycles" ON sales_cycles;
DROP POLICY IF EXISTS "Producers can delete sales cycles" ON sales_cycles;

-- ============================================================================
-- Recreate all producer policies using is_producer() function
-- ============================================================================

-- ORDERS
CREATE POLICY "Producers can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_producer());

CREATE POLICY "Producers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_producer())
  WITH CHECK (is_producer());

CREATE POLICY "Producers can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (is_producer());

-- PRODUCTS
CREATE POLICY "Producers can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_producer())
  WITH CHECK (is_producer());

CREATE POLICY "Producers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_producer());

CREATE POLICY "Producers can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_producer());

-- USER_PROFILES
CREATE POLICY "Producers can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_producer());

-- ORDER_ITEMS
CREATE POLICY "Producers can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
    OR is_producer()
  );

-- SALES_CYCLES
CREATE POLICY "Producers can insert sales cycles"
  ON sales_cycles FOR INSERT
  TO authenticated
  WITH CHECK (is_producer());

CREATE POLICY "Producers can update sales cycles"
  ON sales_cycles FOR UPDATE
  TO authenticated
  USING (is_producer())
  WITH CHECK (is_producer());

CREATE POLICY "Producers can delete sales cycles"
  ON sales_cycles FOR DELETE
  TO authenticated
  USING (is_producer());
