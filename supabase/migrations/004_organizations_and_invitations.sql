-- ==========================================
-- PLAZA DANCE APP — MIGRATION 004: ORGANIZATIONS & INVITATIONS
-- Invitaciones, roles multi-tenant y aislamiento estricto.
-- ==========================================

-- 1. ENUM: INVITATION STATUS
DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA: ORGANIZATION_INVITATIONS
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.org_role NOT NULL DEFAULT 'student',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES DE RENDIMIENTO Y SEGURIDAD
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invitations(token) WHERE status = 'pending';

-- 4. RLS POLICIES FOR INVITATIONS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Admins/Owners of an org or Superadmins can view invitations
CREATE POLICY "Admins or Superadmins view org invitations"
  ON public.organization_invitations FOR SELECT
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[])
    OR email = (SELECT email FROM public.profile_private WHERE user_id = auth.uid())
  );

-- Admins/Owners of an org or Superadmins can create invitations
CREATE POLICY "Admins or Superadmins create org invitations"
  ON public.organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[])
  );

-- Admins/Owners of an org or Superadmins can update invitations
CREATE POLICY "Admins or Superadmins update org invitations"
  ON public.organization_invitations FOR UPDATE
  TO authenticated
  USING (
    public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[])
    OR email = (SELECT email FROM public.profile_private WHERE user_id = auth.uid())
  );

-- 5. FUNCIÓN SECURITY DEFINER: ACEPTAR INVITACIÓN
CREATE OR REPLACE FUNCTION public.accept_org_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
BEGIN
  -- Verificar email del usuario autenticado
  SELECT email INTO v_user_email
  FROM public.profile_private
  WHERE user_id = p_user_id;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado o perfil privado incompleto.';
  END IF;

  -- Buscar la invitación activa
  SELECT * INTO v_invite
  FROM public.organization_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invitación no válida, expirada o ya procesada.';
  END IF;

  -- Verificar que el email de la invitación coincida con el usuario
  IF LOWER(v_invite.email) != LOWER(v_user_email) THEN
    RAISE EXCEPTION 'Esta invitación pertenece a otro correo electrónico.';
  END IF;

  -- Insertar o actualizar membresía en la organización
  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (v_invite.organization_id, p_user_id, v_invite.role, TRUE)
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET role = EXCLUDED.role, is_active = TRUE, updated_at = NOW();

  -- Marcar invitación como aceptada
  UPDATE public.organization_invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE id = v_invite.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
