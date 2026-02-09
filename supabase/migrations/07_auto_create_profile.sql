/**
 * Migration 07: Auto-création du profil utilisateur
 *
 * Crée automatiquement un profil utilisateur quand un nouveau user s'inscrit
 * Cela évite les problèmes de RLS pendant l'inscription
 */

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

-- Mettre à jour la policy pour permettre l'insert initial via le trigger
-- (le trigger utilise SECURITY DEFINER donc il bypass les RLS)

COMMENT ON FUNCTION public.handle_new_user() IS
  'Crée automatiquement un profil utilisateur lors de l''inscription';
