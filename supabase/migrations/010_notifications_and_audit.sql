-- ==========================================
-- PLAZA DANCE APP — MIGRATION 010: NOTIFICATIONS & AUDIT LOGS
-- Logs de auditoría de seguridad, notificaciones in-app y RLS estricto.
-- ==========================================

-- 1. TABLA: AUDIT_LOGS
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

-- 2. TABLA: NOTIFICATIONS (In-App)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_audit_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id) WHERE is_read = FALSE;

-- 4. POLÍTICAS RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Solo Owners de organización o Superadmins pueden ver los audit logs de la escuela
CREATE POLICY "Org owners or Superadmins view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    public.is_superadmin(auth.uid())
    OR (organization_id IS NOT NULL AND public.has_org_role(auth.uid(), organization_id, ARRAY['owner']::public.org_role[]))
  );

-- Los usuarios solo ven sus propias notificaciones
CREATE POLICY "Users view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications read state"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 5. RPC ATÓMICO: LOG DE AUDITORÍA CON SANITIZACIÓN
CREATE OR REPLACE FUNCTION public.log_audit_event_atomic(
  p_org_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    organization_id, user_id, action, resource, details_json, ip_address
  ) VALUES (
    p_org_id, p_user_id, p_action, p_resource, p_details, p_ip
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
