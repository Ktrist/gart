-- Fix RLS Policies to allow anonymous access
-- Les utilisateurs non connectés doivent pouvoir voir les produits, cycles, et points de retrait

-- Drop les anciennes policies
DROP POLICY IF EXISTS "Sales cycles are viewable by everyone" ON sales_cycles;
DROP POLICY IF EXISTS "Pickup locations are viewable by everyone" ON pickup_locations;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- Recréer les policies avec accès public (anon + authenticated)
CREATE POLICY "Sales cycles are viewable by everyone"
  ON sales_cycles FOR SELECT
  USING (true);

CREATE POLICY "Pickup locations are viewable by everyone"
  ON pickup_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);
