-- Script pour corriger le trigger de création de profil utilisateur
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modifier la fonction pour qu'elle soit plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name TEXT;
  last_name TEXT;
  user_email TEXT;
  debug_info TEXT;
BEGIN
  -- Log pour débogage
  RAISE NOTICE 'Trigger handle_new_user déclenché pour l''utilisateur: %', NEW.id;
  
  -- Extraire les valeurs des métadonnées avec des valeurs par défaut sécurisées
  first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'given_name',
    'Utilisateur'
  );
  
  last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'lastName',
    NEW.raw_user_meta_data->>'family_name',
    'Ensemble'
  );
  
  user_email := COALESCE(NEW.email, 'utilisateur@exemple.com');
  
  -- Log des informations extraites
  debug_info := format('Métadonnées extraites - Prénom: %s, Nom: %s, Email: %s', first_name, last_name, user_email);
  RAISE NOTICE '%', debug_info;

  -- Vérifier si un profil existe déjà pour cet utilisateur
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE NOTICE 'Un profil existe déjà pour l''utilisateur: %', NEW.id;
    
    -- Mettre à jour le profil existant
    UPDATE public.profiles
    SET 
      first_name = first_name,
      last_name = last_name,
      email = user_email,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Profil mis à jour pour l''utilisateur: %', NEW.id;
  ELSE
    -- Insérer le profil avec des valeurs sécurisées
    INSERT INTO public.profiles (id, first_name, last_name, email, created_at, updated_at)
    VALUES (
      NEW.id,
      first_name,
      last_name,
      user_email,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Nouveau profil créé pour l''utilisateur: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur pour le débogage
    RAISE NOTICE 'Erreur lors de la création/mise à jour du profil: % - %', SQLERRM, SQLSTATE;
    -- Enregistrer l'erreur dans une table de logs si elle existe
    BEGIN
      INSERT INTO public.error_logs (error_type, error_message, user_id, created_at)
      VALUES ('trigger_error', SQLERRM, NEW.id, NOW());
    EXCEPTION WHEN OTHERS THEN
      -- Ignorer si la table n'existe pas
    END;
    RETURN NEW; -- Continuer malgré l'erreur pour ne pas bloquer l'inscription
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Créer la table de logs d'erreurs si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.error_logs (
  id SERIAL PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter des permissions RLS à la table error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Créer une politique permettant uniquement aux administrateurs de voir les logs
CREATE POLICY "Admins can view error logs" ON public.error_logs
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.family_members WHERE role = 'admin'
  ));

-- Vérifier que la table profiles existe et a la bonne structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_url TEXT,
      preferences JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Ajouter RLS à la table profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Créer une politique permettant aux utilisateurs de voir leur propre profil
    CREATE POLICY "Users can view their own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
      
    -- Créer une politique permettant aux utilisateurs de mettre à jour leur propre profil
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
      
    RAISE NOTICE 'Table profiles créée avec succès';
  ELSE
    RAISE NOTICE 'Table profiles existe déjà';
  END IF;
END $$;
