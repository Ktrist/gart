-- Migration: Add Chronofresh delivery support
-- This migration adds support for cold-chain delivery as an alternative to pickup locations

-- Add weight to products for shipping calculation
ALTER TABLE products ADD COLUMN weight_grams INTEGER DEFAULT NULL;

-- Add delivery fields to orders
ALTER TABLE orders ADD COLUMN delivery_type TEXT DEFAULT 'pickup'
  CHECK (delivery_type IN ('pickup', 'chronofresh'));
ALTER TABLE orders ADD COLUMN delivery_address JSONB DEFAULT NULL;
ALTER TABLE orders ADD COLUMN shipping_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN total_weight_grams INTEGER DEFAULT NULL;
ALTER TABLE orders ADD COLUMN chronofresh_tracking_number TEXT DEFAULT NULL;

-- Make pickup_location_id nullable (not required for delivery orders)
ALTER TABLE orders ALTER COLUMN pickup_location_id DROP NOT NULL;

-- Shipping zones for rate calculation
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  postal_code_prefix TEXT NOT NULL,
  base_rate NUMERIC(10,2) NOT NULL,
  rate_per_kg NUMERIC(10,2) NOT NULL,
  min_weight_grams INTEGER DEFAULT 0,
  max_weight_grams INTEGER DEFAULT 30000,
  estimated_days_min INTEGER DEFAULT 1,
  estimated_days_max INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for shipping_zones updated_at
CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON shipping_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for postal code lookup
CREATE INDEX idx_shipping_zones_postal ON shipping_zones(postal_code_prefix);
CREATE INDEX idx_shipping_zones_active ON shipping_zones(is_active);

-- Index for delivery type orders
CREATE INDEX idx_orders_delivery_type ON orders(delivery_type);

-- Enable RLS on shipping_zones
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to shipping zones (needed for rate calculation)
CREATE POLICY "Allow anonymous read access to shipping_zones"
  ON shipping_zones FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Default shipping zones for France
-- Ile-de-France (closest to farm, lower rates)
INSERT INTO shipping_zones (name, postal_code_prefix, base_rate, rate_per_kg, estimated_days_min, estimated_days_max) VALUES
  ('Ile-de-France', '75,77,78,91,92,93,94,95', 8.90, 2.50, 1, 2);

-- Zone 1: Surrounding regions
INSERT INTO shipping_zones (name, postal_code_prefix, base_rate, rate_per_kg, estimated_days_min, estimated_days_max) VALUES
  ('Zone 1 - Centre-Est', '45,89,58,21,10,51,52,54,55,57,67,68,88', 9.90, 3.00, 1, 2);

-- Zone 2: France métropolitaine (catch-all for other postal codes)
INSERT INTO shipping_zones (name, postal_code_prefix, base_rate, rate_per_kg, estimated_days_min, estimated_days_max) VALUES
  ('France métropolitaine', '', 12.90, 3.50, 2, 3);

-- Add default weights to existing products based on unit
-- Products sold by kg get 1000g default, pieces get 200g default
UPDATE products SET weight_grams = 1000 WHERE unit = 'kg' AND weight_grams IS NULL;
UPDATE products SET weight_grams = 500 WHERE unit = 'botte' AND weight_grams IS NULL;
UPDATE products SET weight_grams = 200 WHERE unit = 'pièce' AND weight_grams IS NULL;
UPDATE products SET weight_grams = 300 WHERE weight_grams IS NULL;

COMMENT ON COLUMN products.weight_grams IS 'Product weight in grams for shipping calculation';
COMMENT ON COLUMN orders.delivery_type IS 'Type of delivery: pickup (at location) or chronofresh (cold-chain delivery)';
COMMENT ON COLUMN orders.delivery_address IS 'JSON containing delivery address: {name, street, postalCode, city, phone, instructions}';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in euros for chronofresh delivery';
COMMENT ON COLUMN orders.total_weight_grams IS 'Total weight of order in grams';
COMMENT ON COLUMN orders.chronofresh_tracking_number IS 'Tracking number from Chronofresh carrier';
COMMENT ON TABLE shipping_zones IS 'Shipping zones with rates for Chronofresh delivery calculation';
