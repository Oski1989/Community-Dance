-- ==========================================
-- PLAZA DANCE APP — MIGRATION 006: RESERVATIONS & CONCURRENCY
-- Reservas atómicas, bloqueo FOR UPDATE, roles de baile, idempotencia y promoción de lista de espera.
-- ==========================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'waitlist', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dance_role_used AS ENUM ('leader', 'follower', 'unspecified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA: RESERVATIONS
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

-- 3. CONSTRAINT DE IDEMPOTENCIA (Sección 54)
-- Un usuario solo puede tener una reserva activa (confirmada o en espera) por sesión.
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_reservation
  ON public.reservations (session_id, user_id)
  WHERE status IN ('confirmed', 'waitlist');

-- 4. TABLA: WAITLISTS (Lista de Espera Transaccional)
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

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_reservations_session ON public.reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_org ON public.reservations(organization_id);
CREATE INDEX IF NOT EXISTS idx_waitlists_session_pos ON public.waitlists(session_id, position);

-- 6. POLÍTICAS RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations or admins/teachers view all"
  ON public.reservations FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[])
  );

CREATE POLICY "Users can view waitlists"
  ON public.waitlists FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher', 'reception']::public.org_role[])
  );

-- 7. RPC ATÓMICO DE RESERVA (SECCIONES 16, 17 Y 54)
-- Ejecuta la transacción con bloqueo FOR UPDATE en la sesión para prevenir sobreventas en peticiones concurrentes.
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
  -- 1. Bloqueo FOR UPDATE sobre la sesión concreta
  SELECT * INTO v_session
  FROM public.sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF v_session.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'La sesión no existe.');
  END IF;

  -- 2. Validar que la sesión sea futura (Sección 14)
  IF v_session.start_time <= NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'No se pueden hacer reservas para clases pasadas.');
  END IF;

  -- 3. Validar estado de la sesión
  IF v_session.status != 'scheduled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'La sesión no está activa.');
  END IF;

  -- 4. Comprobar Idempotencia: Verificar que no tenga ya reserva activa
  SELECT id INTO v_existing_active
  FROM public.reservations
  WHERE session_id = p_session_id
    AND user_id = p_user_id
    AND status IN ('confirmed', 'waitlist');

  IF v_existing_active IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya tienes una reserva activa o en lista de espera para esta sesión.');
  END IF;

  -- 5. Contar reservas confirmadas totales
  SELECT COUNT(*) INTO v_confirmed_count
  FROM public.reservations
  WHERE session_id = p_session_id AND status = 'confirmed';

  -- 6. Contar reservas por rol si aplica
  IF p_dance_role != 'unspecified' THEN
    SELECT COUNT(*) INTO v_role_count
    FROM public.reservations
    WHERE session_id = p_session_id AND status = 'confirmed' AND dance_role_used = p_dance_role;
  END IF;

  -- 7. Evaluar aforos (Aforo Total y Aforo por Rol)
  IF v_confirmed_count < v_session.capacity_total THEN
    IF p_dance_role = 'leader' AND v_session.capacity_leaders IS NOT NULL AND v_role_count >= v_session.capacity_leaders THEN
      v_is_confirmed := FALSE;
    ELSIF p_dance_role = 'follower' AND v_session.capacity_followers IS NOT NULL AND v_role_count >= v_session.capacity_followers THEN
      v_is_confirmed := FALSE;
    ELSE
      v_is_confirmed := TRUE;
    END IF;
  ELSE
    v_is_confirmed := FALSE;
  END IF;

  -- 8. Procesar confirmación o lista de espera
  IF v_is_confirmed THEN
    INSERT INTO public.reservations (
      organization_id, session_id, user_id, dance_role_used, status
    ) VALUES (
      v_session.organization_id, p_session_id, p_user_id, p_dance_role, 'confirmed'
    ) RETURNING id INTO v_new_res_id;

    RETURN jsonb_build_object(
      'success', true,
      'status', 'confirmed',
      'reservation_id', v_new_res_id,
      'message', 'Reserva confirmada con éxito.'
    );
  ELSE
    -- Calcular posición en lista de espera
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_waitlist_pos
    FROM public.waitlists
    WHERE session_id = p_session_id;

    INSERT INTO public.reservations (
      organization_id, session_id, user_id, dance_role_used, status
    ) VALUES (
      v_session.organization_id, p_session_id, p_user_id, p_dance_role, 'waitlist'
    ) RETURNING id INTO v_new_res_id;

    INSERT INTO public.waitlists (
      organization_id, session_id, user_id, dance_role_used, position
    ) VALUES (
      v_session.organization_id, p_session_id, p_user_id, p_dance_role, v_waitlist_pos
    );

    RETURN jsonb_build_object(
      'success', true,
      'status', 'waitlist',
      'reservation_id', v_new_res_id,
      'position', v_waitlist_pos,
      'message', 'Aforo completo. Te hemos añadido a la lista de espera.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. RPC ATÓMICO DE CANCELACIÓN Y PROMOCIÓN (SECCIÓN 18 Y 19)
CREATE OR REPLACE FUNCTION public.cancel_reservation_atomic(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_res RECORD;
  v_session RECORD;
  v_next_candidate RECORD;
  v_promoted_user_id UUID := NULL;
BEGIN
  -- 1. Buscar la reserva
  SELECT * INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_res.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'La reserva no existe.');
  END IF;

  -- 2. Validar que la reserva pertenezca al usuario o sea admin
  IF v_res.user_id != p_user_id AND NOT public.is_superadmin(p_user_id) THEN
    IF NOT public.has_org_role(p_user_id, v_res.organization_id, ARRAY['owner', 'admin']::public.org_role[]) THEN
      RETURN jsonb_build_object('success', false, 'error', 'No tienes permiso para cancelar esta reserva.');
    END IF;
  END IF;

  -- 3. Si ya estaba cancelada, salir
  IF v_res.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'La reserva ya estaba cancelada.');
  END IF;

  -- 4. Marcar reserva como cancelada
  UPDATE public.reservations
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_reservation_id;

  -- Si estaba en lista de espera, limpiarla de waitlists
  IF v_res.status = 'waitlist' THEN
    DELETE FROM public.waitlists
    WHERE session_id = v_res.session_id AND user_id = v_res.user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Reserva en lista de espera cancelada.');
  END IF;

  -- 5. Si la reserva estaba confirmada, intentar promocionar al primer candidato de la lista de espera (Sección 19)
  SELECT * INTO v_next_candidate
  FROM public.waitlists
  WHERE session_id = v_res.session_id
  ORDER BY position ASC
  LIMIT 1
  FOR UPDATE;

  IF v_next_candidate.id IS NOT NULL THEN
    -- Actualizar su reserva a confirmada
    UPDATE public.reservations
    SET status = 'confirmed', updated_at = NOW()
    WHERE session_id = v_res.session_id AND user_id = v_next_candidate.user_id;

    -- Eliminar de la lista de espera
    DELETE FROM public.waitlists WHERE id = v_next_candidate.id;

    -- Reordenar posiciones de lista de espera
    UPDATE public.waitlists
    SET position = position - 1
    WHERE session_id = v_res.session_id;

    v_promoted_user_id := v_next_candidate.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Reserva cancelada correctamente.',
    'promoted_user_id', v_promoted_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
