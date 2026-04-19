-- PostgreSQL / Supabase migration (NOT MSSQL)
-- Adds photos column to profiles (array of image URLs)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
