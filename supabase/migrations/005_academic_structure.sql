-- ==========================================
-- PLAZA DANCE APP — MIGRATION 005: ACADEMIC STRUCTURE
-- Programas, Niveles, Subniveles, Grupos y Sesiones (con timestamptz).
-- ==========================================

-- 1. ENUM: SESSION STATUS
DO $$ BEGIN
  CREATE TYPE public.session_status AS ENUM ('scheduled', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA: PROGRAMS
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: LEVELS
CREATE TABLE IF NOT EXISTS public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: SUBLEVELS
CREATE TABLE IF NOT EXISTS public.sublevels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: GROUPS (Clase / Grupo Recurrente)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sublevel_id UUID REFERENCES public.sublevels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  capacity_total INT NOT NULL CHECK (capacity_total > 0),
  capacity_leaders INT DEFAULT NULL CHECK (capacity_leaders IS NULL OR capacity_leaders >= 0),
  capacity_followers INT DEFAULT NULL CHECK (capacity_followers IS NULL OR capacity_followers >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: SESSIONS (Sesión Concreta de Fecha/Hora)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity_total INT NOT NULL CHECK (capacity_total > 0),
  capacity_leaders INT DEFAULT NULL CHECK (capacity_leaders IS NULL OR capacity_leaders >= 0),
  capacity_followers INT DEFAULT NULL CHECK (capacity_followers IS NULL OR capacity_followers >= 0),
  status public.session_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_session_dates CHECK (end_time > start_time)
);

-- 7. ÍNDICES DE RENDIMIENTO Y CONCURRENCIA
CREATE INDEX IF NOT EXISTS idx_programs_org ON public.programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_levels_program ON public.levels(program_id);
CREATE INDEX IF NOT EXISTS idx_sublevels_level ON public.sublevels(level_id);
CREATE INDEX IF NOT EXISTS idx_groups_org ON public.groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_org ON public.sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_group ON public.sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON public.sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

-- 8. POLÍTICAS RLS MULTI-TENANT
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sublevels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Programs RLS
CREATE POLICY "Programs viewable by org members or superadmins"
  ON public.programs FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Programs manageable by org admins/owners"
  ON public.programs FOR ALL TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[]));

-- Levels & Sublevels RLS
CREATE POLICY "Levels viewable by org members"
  ON public.levels FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.programs p
    WHERE p.id = level_id AND public.has_org_role(auth.uid(), p.organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[])
  ));

CREATE POLICY "Sublevels viewable by org members"
  ON public.sublevels FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.levels l
    JOIN public.programs p ON p.id = l.program_id
    WHERE l.id = sublevel_id AND public.has_org_role(auth.uid(), p.organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[])
  ));

-- Groups RLS
CREATE POLICY "Groups viewable by org members"
  ON public.groups FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Groups manageable by org admins/owners"
  ON public.groups FOR ALL TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[]));

-- Sessions RLS
CREATE POLICY "Sessions viewable by org members"
  ON public.sessions FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Sessions manageable by org admins/owners or assigned teacher"
  ON public.sessions FOR ALL TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[])
    OR (teacher_id = auth.uid() AND public.has_org_role(auth.uid(), organization_id, ARRAY['teacher']::public.org_role[]))
  );
