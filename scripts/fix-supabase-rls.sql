-- Script SQL pour corriger les politiques RLS dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS sur toutes les tables pour faciliter les corrections
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes qui causent la récursion infinie
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres familles" ON public.families;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres membres de famille" ON public.family_members;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres enfants" ON public.children;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres événements" ON public.events;

-- 3. Créer de nouvelles politiques simplifiées et efficaces

-- Politique pour profiles
CREATE POLICY "Les utilisateurs peuvent voir et modifier leur propre profil"
ON public.profiles
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour families
CREATE POLICY "Les utilisateurs peuvent voir les familles auxquelles ils appartiennent"
ON public.families
USING (
  EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_members.family_id = families.id
    AND family_members.user_id = auth.uid()
  )
);

-- Politique pour family_members
CREATE POLICY "Les utilisateurs peuvent voir les membres des familles auxquelles ils appartiennent"
ON public.family_members
USING (
  EXISTS (
    SELECT 1 FROM public.family_members AS fm
    WHERE fm.family_id = family_members.family_id
    AND fm.user_id = auth.uid()
  )
);

-- Politique pour children
CREATE POLICY "Les utilisateurs peuvent voir les enfants des familles auxquelles ils appartiennent"
ON public.children
USING (
  EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_members.family_id = children.family_id
    AND family_members.user_id = auth.uid()
  )
);

-- Politique pour events
CREATE POLICY "Les utilisateurs peuvent voir les événements des familles auxquelles ils appartiennent"
ON public.events
USING (
  EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_members.family_id = events.family_id
    AND family_members.user_id = auth.uid()
  )
);

-- Politique pour event_templates (accès global en lecture, modification par admin seulement)
CREATE POLICY "Tout le monde peut voir les modèles d'événements"
ON public.event_templates
FOR SELECT
USING (true);

-- 4. Réactiver RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

-- 5. S'assurer que toutes les tables ont RLS activé
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.families FORCE ROW LEVEL SECURITY;
ALTER TABLE public.family_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.children FORCE ROW LEVEL SECURITY;
ALTER TABLE public.events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates FORCE ROW LEVEL SECURITY;
