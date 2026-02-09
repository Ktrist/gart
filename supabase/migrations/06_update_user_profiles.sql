/**
 * Migration 06: Mise à jour de la table user_profiles
 *
 * Ajoute les colonnes manquantes pour l'authentification
 */

-- Ajouter la colonne email (utile pour l'affichage)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Ajouter la colonne full_name
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Ajouter la colonne city
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS city TEXT;

-- Ajouter la colonne postal_code
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Supprimer first_name et last_name si elles existent (on utilise full_name maintenant)
-- Note: Si vous avez déjà des données, vous devriez migrer first_name + last_name vers full_name avant de supprimer

-- Créer un index sur email pour les recherches
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

COMMENT ON COLUMN user_profiles.email IS 'Email de l''utilisateur (copie de auth.users.email pour facilité d''accès)';
COMMENT ON COLUMN user_profiles.full_name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN user_profiles.city IS 'Ville de résidence';
COMMENT ON COLUMN user_profiles.postal_code IS 'Code postal';
