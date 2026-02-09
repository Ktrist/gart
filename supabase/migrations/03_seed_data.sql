-- Seed initial data for Gart application

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

-- Insérer les produits (avec référence au cycle actuel et catégories)
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

  -- Insérer les 10 produits
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
