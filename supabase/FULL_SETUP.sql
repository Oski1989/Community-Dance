-- ============================================================================
-- PLAZA DANCE APP — SCRIPT DE CONFIGURACIÓN COMPLETO PARA SUPABASE (FASES 1 - 10)
-- Pega este script en el SQL Editor de tu proyecto de Supabase para inicializar
-- la base de datos completa con tablas, RLS, funciones atómicas y tipos.
-- ============================================================================

-- 0. LIMPIEZA DE TABLAS ANTIGUAS (Necesario si existía APP MASTER u otro proyecto previo)
-- Se eliminan en orden inverso de dependencia para evitar conflictos de FK.
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.user_quest_progress CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.user_memberships CASCADE;
DROP TABLE IF EXISTS public.membership_plans CASCADE;
DROP TABLE IF EXISTS public.attendances CASCADE;
DROP TABLE IF EXISTS public.waitlists CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.sublevels CASCADE;
DROP TABLE IF EXISTS public.levels CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.organization_invitations CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpiar tipos antiguos si existen con definición diferente
DROP TYPE IF EXISTS public.org_role CASCADE;
DROP TYPE IF EXISTS public.system_role CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.reservation_status CASCADE;
DROP TYPE IF EXISTS public.dance_role_used CASCADE;
DROP TYPE IF EXISTS public.attendance_status CASCADE;
DROP TYPE IF EXISTS public.membership_type CASCADE;
DROP TYPE IF EXISTS public.membership_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.quest_submission_status CASCADE;

-- Limpiar funciones antiguas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_superadmin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_org_role(UUID, UUID, public.org_role[]) CASCADE;
DROP FUNCTION IF EXISTS public.reserve_session_atomic(UUID, UUID, public.dance_role_used) CASCADE;
DROP FUNCTION IF EXISTS public.cancel_reservation_atomic(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.record_attendance_atomic(UUID, UUID, public.attendance_status, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.use_membership_credit_atomic(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.submit_quest_proof_atomic(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.review_quest_submission_atomic(UUID, UUID, BOOLEAN, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event_atomic(UUID, UUID, TEXT, TEXT, JSONB, INET) CASCADE;
DROP FUNCTION IF EXISTS public.accept_org_invitation(TEXT, UUID) CASCADE;

-- 1. EXTENSIONES Y ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'teacher', 'reception', 'student'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.system_role AS ENUM ('superadmin', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'waitlist', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.dance_role_used AS ENUM ('leader', 'follower', 'unspecified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.attendance_status AS ENUM ('pending', 'attended', 'absent', 'excused'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.membership_type AS ENUM ('monthly_subscription', 'class_pack', 'drop_in'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'depleted', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'transfer', 'stripe'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.payment_status AS ENUM ('completed', 'partial', 'pending', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.quest_submission_status AS ENUM ('in_progress', 'submitted', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLAS BASE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  system_role public.system_role NOT NULL DEFAULT 'user',
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  gdpr_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.org_role NOT NULL DEFAULT 'student',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discipline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sublevels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sublevel_id UUID REFERENCES public.sublevels(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  capacity_total INT NOT NULL DEFAULT 20 CHECK (capacity_total > 0),
  capacity_leaders INT CHECK (capacity_leaders IS NULL OR capacity_leaders >= 0),
  capacity_followers INT CHECK (capacity_followers IS NULL OR capacity_followers >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity_total INT NOT NULL CHECK (capacity_total > 0),
  capacity_leaders INT,
  capacity_followers INT,
  status public.session_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_session_times CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dance_role_used public.dance_role_used NOT NULL DEFAULT 'unspecified',
  status public.reservation_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_reservation
  ON public.reservations (session_id, user_id) WHERE status IN ('confirmed', 'waitlist');

CREATE TABLE IF NOT EXISTS public.waitlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dance_role_used public.dance_role_used NOT NULL DEFAULT 'unspecified',
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_waitlist UNIQUE (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  status public.attendance_status NOT NULL DEFAULT 'pending',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_session_user_attendance UNIQUE (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type public.membership_type NOT NULL DEFAULT 'monthly_subscription',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  class_credits INT CHECK (class_credits IS NULL OR class_credits > 0),
  validity_days INT DEFAULT 30 CHECK (validity_days > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  credits_remaining INT,
  status public.membership_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.user_memberships(id) ON DELETE SET NULL,
  amount_total DECIMAL(10, 2) NOT NULL CHECK (amount_total >= 0),
  amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid >= 0),
  pending_balance DECIMAL(10, 2) GENERATED ALWAYS AS (amount_total - amount_paid) STORED,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  status public.payment_status NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  created_by_teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_reward INT NOT NULL DEFAULT 10 CHECK (points_reward > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.quest_submission_status NOT NULL DEFAULT 'in_progress',
  submission_url TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  points_earned INT DEFAULT 0,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_quest UNIQUE (quest_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  likes_count INT DEFAULT 0 CHECK (likes_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details_json JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sublevels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. FUNCIONES RPC AUXILIARES DE SEGURIDAD
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND system_role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_org_role(
  user_id UUID,
  org_id UUID,
  required_roles public.org_role[]
)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_superadmin(user_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = user_id AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. DISPARADOR DE REGISTRO NUEVO USUARIO (Asigna siempre 'user')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, avatar_url, system_role,
    terms_accepted, terms_accepted_at, privacy_accepted, privacy_accepted_at, gdpr_version
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user',
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, FALSE),
    CASE WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean THEN NOW() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'privacy_accepted')::boolean, FALSE),
    CASE WHEN (NEW.raw_user_meta_data->>'privacy_accepted')::boolean THEN NOW() ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'gdpr_version', 'v1.0')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RPC RESERVA ATÓMICA (FOR UPDATE CON CONCURRENCIA CONTROLADA)
CREATE OR REPLACE FUNCTION public.reserve_session_atomic(
  p_session_id UUID,
  p_user_id UUID,
  p_dance_role public.dance_role_used
)
RETURNS JSONB AS $$
DECLARE
  v_session RECORD;
  v_existing_active UUID;
  v_confirmed_count INT;
  v_role_count INT;
  v_waitlist_pos INT;
  v_new_res_id UUID;
  v_is_confirmed BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_session FROM public.sessions WHERE id = p_session_id FOR UPDATE;

  IF v_session.id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'La sesión no existe.'); END IF;
  IF v_session.start_time <= NOW() THEN RETURN jsonb_build_object('success', false, 'error', 'No se pueden hacer reservas para clases pasadas.'); END IF;

  SELECT id INTO v_existing_active FROM public.reservations
  WHERE session_id = p_session_id AND user_id = p_user_id AND status IN ('confirmed', 'waitlist');

  IF v_existing_active IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya tienes una reserva activa o en lista de espera.');
  END IF;

  SELECT COUNT(*) INTO v_confirmed_count FROM public.reservations WHERE session_id = p_session_id AND status = 'confirmed';

  IF p_dance_role != 'unspecified' THEN
    SELECT COUNT(*) INTO v_role_count FROM public.reservations
    WHERE session_id = p_session_id AND status = 'confirmed' AND dance_role_used = p_dance_role;
  END IF;

  IF v_confirmed_count < v_session.capacity_total THEN
    IF p_dance_role = 'leader' AND v_session.capacity_leaders IS NOT NULL AND v_role_count >= v_session.capacity_leaders THEN v_is_confirmed := FALSE;
    ELSIF p_dance_role = 'follower' AND v_session.capacity_followers IS NOT NULL AND v_role_count >= v_session.capacity_followers THEN v_is_confirmed := FALSE;
    ELSE v_is_confirmed := TRUE; END IF;
  ELSE v_is_confirmed := FALSE; END IF;

  IF v_is_confirmed THEN
    INSERT INTO public.reservations (organization_id, session_id, user_id, dance_role_used, status)
    VALUES (v_session.organization_id, p_session_id, p_user_id, p_dance_role, 'confirmed')
    RETURNING id INTO v_new_res_id;

    RETURN jsonb_build_object('success', true, 'status', 'confirmed', 'reservation_id', v_new_res_id, 'message', 'Reserva confirmada.');
  ELSE
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_waitlist_pos FROM public.waitlists WHERE session_id = p_session_id;

    INSERT INTO public.reservations (organization_id, session_id, user_id, dance_role_used, status)
    VALUES (v_session.organization_id, p_session_id, p_user_id, p_dance_role, 'waitlist')
    RETURNING id INTO v_new_res_id;

    INSERT INTO public.waitlists (organization_id, session_id, user_id, dance_role_used, position)
    VALUES (v_session.organization_id, p_session_id, p_user_id, p_dance_role, v_waitlist_pos);

    RETURN jsonb_build_object('success', true, 'status', 'waitlist', 'reservation_id', v_new_res_id, 'position', v_waitlist_pos, 'message', 'Añadido a lista de espera.');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. POLÍTICAS RLS GENERALES
CREATE POLICY "Public profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Organizations viewable by members" ON public.organizations FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Memberships viewable by member or org staff" ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[]));

CREATE POLICY "Programs viewable by org members" ON public.programs FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Sessions viewable by org members" ON public.sessions FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Reservations viewable by user or org staff" ON public.reservations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[]));

-- Finalización de script
