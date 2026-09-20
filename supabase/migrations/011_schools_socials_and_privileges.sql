-- ============================================================================
-- MIGRATION 011: ESCUELAS, EVENTOS SOCIALES, CHECK-INS Y PRIVILEGIOS
-- ============================================================================

-- 1. Actualizar tabla profiles con preferencias de alumno y privacidad
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dance_role TEXT DEFAULT 'unspecified',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS show_in_rankings BOOLEAN DEFAULT TRUE;

-- 2. Crear tabla de Escuelas (Privilegio dentro de una Organización/Tenant)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  director_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de Eventos Sociales / Fiestas SBK
CREATE TABLE IF NOT EXISTS public.social_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT FALSE,
  capacity INT DEFAULT 100 CHECK (capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de Check-ins en Sociales (Rachas de Alumnos)
CREATE TABLE IF NOT EXISTS public.social_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.social_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_event_checkin UNIQUE (event_id, user_id)
);

-- 5. Crear tablas de Planes SaaS y Suscripciones de Organizaciones
CREATE TABLE IF NOT EXISTS public.saas_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  max_monthly_posts INT NOT NULL DEFAULT 4,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Habilitar RLS en las nuevas tablas
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS
-- Escuelas: Visibles por miembros autenticados de la organización
CREATE POLICY "Schools viewable by all authenticated users" 
ON public.schools FOR SELECT TO authenticated USING (true);

-- Eventos Sociales: Visibles públicamente
CREATE POLICY "Social events viewable publicly" 
ON public.social_events FOR SELECT USING (true);

CREATE POLICY "Social events editable by staff or teacher" 
ON public.social_events FOR ALL TO authenticated 
USING (
  public.is_superadmin(auth.uid()) OR 
  (teacher_id IS NOT NULL AND teacher_id = auth.uid()) OR
  (organization_id IS NOT NULL AND public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'teacher']::public.org_role[]))
);

-- Social Checkins: Usuario ve sus propios check-ins, staff ve todos
CREATE POLICY "Social checkins viewable by owner or staff" 
ON public.social_checkins FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.is_superadmin(auth.uid()));

-- RPC para check-in atómico en evento social
CREATE OR REPLACE FUNCTION public.record_social_checkin_atomic(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_event RECORD;
  v_count INT;
  v_user_checkins INT;
BEGIN
  SELECT * INTO v_event FROM public.social_events WHERE id = p_event_id FOR UPDATE;
  
  IF v_event.id IS NULL THEN 
    RETURN jsonb_build_object('success', false, 'error', 'El evento no existe.'); 
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.social_checkins WHERE event_id = p_event_id;

  IF v_count >= v_event.capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aforo máximo alcanzado para este evento.');
  END IF;

  INSERT INTO public.social_checkins (event_id, user_id)
  VALUES (p_event_id, p_user_id)
  ON CONFLICT (event_id, user_id) DO NOTHING;

  SELECT COUNT(*) INTO v_user_checkins FROM public.social_checkins WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Check-in registrado con éxito.',
    'total_user_checkins', v_user_checkins,
    'reward_unlocked', (v_user_checkins % 4 = 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
