-- Migration 09: Cart Persistence
-- Allows logged-in users to save their cart across sessions

CREATE TABLE saved_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  pickup_location_id UUID REFERENCES pickup_locations(id),
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'chronofresh')),
  delivery_address JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_carts_user ON saved_carts(user_id);

CREATE TRIGGER update_saved_carts_updated_at BEFORE UPDATE ON saved_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE saved_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON saved_carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own cart"
  ON saved_carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON saved_carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
  ON saved_carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE saved_carts IS 'Persisted shopping carts for logged-in users';
COMMENT ON COLUMN saved_carts.items IS 'JSON array of cart items: [{productId, quantity, unitPrice, name, unit}]';
