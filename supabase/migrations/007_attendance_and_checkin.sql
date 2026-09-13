-- ==========================================
-- PLAZA DANCE APP — MIGRATION 007: ATTENDANCE & CHECK-IN
-- Registro de asistencia, QR check-in, marcas de tiempo y permisos.
-- ==========================================

-- 1. ENUM: ATTENDANCE STATUS
DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('pending', 'attended', 'absent', 'excused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA: ATTENDANCES
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

-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_attendances_session ON public.attendances(session_id);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON public.attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_org ON public.attendances(organization_id);

-- 4. POLÍTICAS RLS
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Alumnos pueden ver su propio historial de asistencia
CREATE POLICY "Students can view their own attendance"
  ON public.attendances FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[])
  );

-- Profesores asignados, recepción y admins pueden registrar o modificar asistencia
CREATE POLICY "Staff can manage attendance"
  ON public.attendances FOR ALL TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[])
  );

-- 5. RPC ATÓMICO: REGISTRO / CHECK-IN DE ASISTENCIA
CREATE OR REPLACE FUNCTION public.record_attendance_atomic(
  p_session_id UUID,
  p_user_id UUID,
  p_status public.attendance_status,
  p_recorded_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_session RECORD;
  v_res_id UUID;
  v_att_id UUID;
  v_checkin_time TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  -- 1. Obtener la sesión
  SELECT * INTO v_session
  FROM public.sessions
  WHERE id = p_session_id;

  IF v_session.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'La sesión no existe.');
  END IF;

  -- 2. Verificar si existe reserva confirmada
  SELECT id INTO v_res_id
  FROM public.reservations
  WHERE session_id = p_session_id AND user_id = p_user_id AND status = 'confirmed';

  -- Si se marca como asistido, establecer fecha de check-in
  IF p_status = 'attended' THEN
    v_checkin_time := NOW();
  END IF;

  -- 3. Upsert en attendances
  INSERT INTO public.attendances (
    organization_id, session_id, user_id, reservation_id, status, checked_in_at, checked_in_by, notes
  ) VALUES (
    v_session.organization_id, p_session_id, p_user_id, v_res_id, p_status, v_checkin_time, p_recorded_by, p_notes
  )
  ON CONFLICT (session_id, user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    checked_in_at = CASE WHEN EXCLUDED.status = 'attended' THEN NOW() ELSE public.attendances.checked_in_at END,
    checked_in_by = EXCLUDED.checked_in_by,
    notes = COALESCE(EXCLUDED.notes, public.attendances.notes),
    updated_at = NOW()
  RETURNING id INTO v_att_id;

  RETURN jsonb_build_object(
    'success', true,
    'attendance_id', v_att_id,
    'status', p_status,
    'message', 'Asistencia registrada correctamente.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
