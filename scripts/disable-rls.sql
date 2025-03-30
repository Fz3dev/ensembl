-- Script SQL pour désactiver temporairement RLS et supprimer toutes les politiques
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver RLS sur toutes les tables
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invitation_codes DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres familles" ON public.families;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les familles auxquelles ils appartiennent" ON public.families;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres membres de famille" ON public.family_members;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les membres des familles auxquelles ils appartiennent" ON public.family_members;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres enfants" ON public.children;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les enfants des familles auxquelles ils appartiennent" ON public.children;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres événements" ON public.events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les événements des familles auxquelles ils appartiennent" ON public.events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir et modifier leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Tout le monde peut voir les modèles d'événements" ON public.event_templates;

-- 3. Supprimer toutes les autres politiques potentielles (approche générique)
DO $$
DECLARE
    policies RECORD;
BEGIN
    FOR policies IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policies.policyname, 
                      policies.tablename);
    END LOOP;
END $$;
