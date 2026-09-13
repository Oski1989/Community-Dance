-- ==========================================
-- PLAZA DANCE APP — MIGRATION 009: QUESTS & COMMUNITY
-- Retos de disciplina, progreso del alumno, aprobación por profesor y muro comunitario.
-- ==========================================

-- 1. ENUM: QUEST SUBMISSION STATUS
DO $$ BEGIN
  CREATE TYPE public.quest_submission_status AS ENUM ('in_progress', 'submitted', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLA: QUESTS (Retos / Misiones)
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

-- 3. TABLA: USER_QUEST_PROGRESS (Entregas y Puntos de Alumnos)
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

-- 4. TABLA: COMMUNITY_POSTS (Muro / Feed Comunitario)
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

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_quests_org ON public.quests(organization_id);
CREATE INDEX IF NOT EXISTS idx_quests_program ON public.quests(program_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_user ON public.user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_status ON public.user_quest_progress(status);
CREATE INDEX IF NOT EXISTS idx_community_org ON public.community_posts(organization_id);

-- 6. POLÍTICAS RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests viewable by org members"
  ON public.quests FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Quests manageable by teachers, admins or owners"
  ON public.quests FOR ALL TO authenticated
  USING (
    created_by_teacher_id = auth.uid()
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher']::public.org_role[])
  );

CREATE POLICY "Users can view their quest progress or teachers view all"
  ON public.user_quest_progress FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher']::public.org_role[])
  );

CREATE POLICY "Community posts viewable by org members"
  ON public.community_posts FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception', 'student']::public.org_role[]));

CREATE POLICY "Users can create community posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. RPC ATÓMICO: ENTREGA DE PRUEBA DE RETO
CREATE OR REPLACE FUNCTION public.submit_quest_proof_atomic(
  p_quest_id UUID,
  p_user_id UUID,
  p_submission_url TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_quest RECORD;
  v_progress_id UUID;
BEGIN
  SELECT * INTO v_quest FROM public.quests WHERE id = p_quest_id AND is_active = TRUE;

  IF v_quest.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'El reto no existe o no está activo.');
  END IF;

  INSERT INTO public.user_quest_progress (
    organization_id, quest_id, user_id, status, submission_url
  ) VALUES (
    v_quest.organization_id, p_quest_id, p_user_id, 'submitted', p_submission_url
  )
  ON CONFLICT (quest_id, user_id)
  DO UPDATE SET
    status = 'submitted',
    submission_url = EXCLUDED.submission_url,
    updated_at = NOW()
  RETURNING id INTO v_progress_id;

  RETURN jsonb_build_object(
    'success', true,
    'progress_id', v_progress_id,
    'message', 'Entrega del reto enviada para revisión del profesor.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. RPC ATÓMICO: REVISIÓN Y OTORGAMIENTO DE PUNTOS
CREATE OR REPLACE FUNCTION public.review_quest_submission_atomic(
  p_progress_id UUID,
  p_reviewer_id UUID,
  p_approved BOOLEAN,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_prog RECORD;
  v_quest RECORD;
  v_earned INT := 0;
  v_new_status public.quest_submission_status;
BEGIN
  SELECT * INTO v_prog FROM public.user_quest_progress WHERE id = p_progress_id FOR UPDATE;

  IF v_prog.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Entrega no encontrada.');
  END IF;

  SELECT * INTO v_quest FROM public.quests WHERE id = v_prog.quest_id;

  IF p_approved THEN
    v_new_status := 'approved';
    v_earned := v_quest.points_reward;
  ELSE
    v_new_status := 'rejected';
    v_earned := 0;
  END IF;

  UPDATE public.user_quest_progress
  SET status = v_new_status,
      reviewed_by = p_reviewer_id,
      points_earned = v_earned,
      reviewer_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_progress_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'points_earned', v_earned,
    'message', CASE WHEN p_approved THEN 'Reto aprobado y puntos otorgados.' ELSE 'Reto rechazado con observaciones.' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
