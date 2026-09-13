-- ==========================================
-- PLAZA DANCE APP — MIGRATION 001: DATABASE FOUNDATION
-- Extensiones, Perfiles, Perfiles Privados, Organizaciones, Membresías y Roles Multi-Tenant.
-- ==========================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS DE ROLES Y ESTADOS
DO $$ BEGIN
  CREATE TYPE public.global_role AS ENUM ('user', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'teacher', 'reception', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dance_role_preference AS ENUM ('leader', 'follower', 'both', 'unspecified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: PROFILES (Pública)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  global_role public.global_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: PROFILE_PRIVATE (Datos Sensibles protegidos por RGPD)
CREATE TABLE IF NOT EXISTS public.profile_private (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  dance_role_preference public.dance_role_preference NOT NULL DEFAULT 'unspecified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: ORGANIZATIONS (Multi-Tenant Organizations / Escuelas)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  branding_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: ORGANIZATION_MEMBERS (Roles por Organización)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_per_org UNIQUE(organization_id, user_id)
);

-- 7. ÍNDICES DE RENDIMIENTO Y MULTI-TENANCY
CREATE INDEX IF NOT EXISTS idx_profiles_global_role ON public.profiles(global_role);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_user ON public.organization_members(organization_id, user_id);

-- 8. FUNCIONES AUXILIARES DE SEGURIDAD (SECURITY DEFINER + search_path seguro)
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND global_role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_org_role(
  p_user_id UUID,
  p_organization_id UUID,
  p_roles public.org_role[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Permite acceso si es Superadmin Global
  IF public.is_superadmin(p_user_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_organization_id
      AND role = ANY(p_roles)
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. TRIGGER TRANSACCIONAL DE CREACIÓN DE PERFIL AL REGISTRARSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_assigned_global_role public.global_role;
BEGIN
  -- Extraer nombre sin confiar en metadatos para asignación de roles privilegiados
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- El rol por defecto NUNCA puede ser superadmin vía metadata del cliente (Seguridad Sección 8 & 51)
  v_assigned_global_role := 'user';

  -- Crear perfil público
  INSERT INTO public.profiles (id, full_name, global_role)
  VALUES (NEW.id, v_full_name, v_assigned_global_role)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Crear perfil privado
  INSERT INTO public.profile_private (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Policies for public.profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own public profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for public.profile_private
CREATE POLICY "Users can view their own private profile"
  ON public.profile_private FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_superadmin(auth.uid()));

CREATE POLICY "Users can update their own private profile"
  ON public.profile_private FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for public.organizations
CREATE POLICY "Organizations are viewable by members or superadmins"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    public.is_superadmin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.organizations.id
        AND user_id = auth.uid()
        AND is_active = TRUE
    )
  );

CREATE POLICY "Superadmins or Owners/Admins can update organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), id, ARRAY['owner', 'admin']::public.org_role[])
  );

-- Policies for public.organization_members
CREATE POLICY "Members viewable by org admins/owners or superadmins"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[])
  );

CREATE POLICY "Only Owners/Admins or Superadmins can manage members"
  ON public.organization_members FOR ALL
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[])
  );
