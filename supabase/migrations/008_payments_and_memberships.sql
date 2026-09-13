-- ==========================================
-- PLAZA DANCE APP — MIGRATION 008: PAYMENTS & MEMBERSHIPS
-- Planes de membresía, bonos de clases, pagos "a cuenta", saldo pendiente y RLS.
-- ==========================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.membership_type AS ENUM ('monthly_subscription', 'class_pack', 'drop_in');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'depleted', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'transfer', 'stripe');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('completed', 'partial', 'pending', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLA: MEMBERSHIP_PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type public.membership_type NOT NULL DEFAULT 'monthly_subscription',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  class_credits INT CHECK (class_credits IS NULL OR class_credits > 0), -- NULL = ilimitado
  validity_days INT DEFAULT 30 CHECK (validity_days > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: USER_MEMBERSHIPS (Membresías / Bonos del Usuario)
CREATE TABLE IF NOT EXISTS public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  credits_remaining INT, -- NULL = ilimitado
  status public.membership_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: PAYMENTS (Registro de Pagos y Pagos "A Cuenta")
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

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_plans_org ON public.membership_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_mem_user ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mem_org ON public.user_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);

-- 6. POLÍTICAS RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans viewable by authenticated users"
  ON public.membership_plans FOR SELECT TO authenticated USING (true);

CREATE POLICY "Plans manageable by org admins/owners"
  ON public.membership_plans FOR ALL TO authenticated
  USING (public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.org_role[]));

CREATE POLICY "User memberships viewable by user or org staff"
  ON public.user_memberships FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'reception']::public.org_role[])
  );

CREATE POLICY "Payments viewable by user or org staff"
  ON public.payments FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_org_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'reception']::public.org_role[])
  );

-- 7. RPC ATÓMICO: DEDUCCIÓN DE CRÉDITO DE BONO
CREATE OR REPLACE FUNCTION public.use_membership_credit_atomic(
  p_membership_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_mem RECORD;
BEGIN
  SELECT * INTO v_mem
  FROM public.user_memberships
  WHERE id = p_membership_id AND user_id = p_user_id
  FOR UPDATE;

  IF v_mem.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membresía/Bono no encontrado.');
  END IF;

  IF v_mem.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'El bono no está activo o ha caducado.');
  END IF;

  IF v_mem.end_date < NOW() THEN
    UPDATE public.user_memberships SET status = 'expired', updated_at = NOW() WHERE id = p_membership_id;
    RETURN jsonb_build_object('success', false, 'error', 'El bono ha caducado.');
  END IF;

  -- Si los créditos no son ilimitados (NOT NULL)
  IF v_mem.credits_remaining IS NOT NULL THEN
    IF v_mem.credits_remaining <= 0 THEN
      UPDATE public.user_memberships SET status = 'depleted', updated_at = NOW() WHERE id = p_membership_id;
      RETURN jsonb_build_object('success', false, 'error', 'Has agotado los créditos de este bono.');
    END IF;

    UPDATE public.user_memberships
    SET credits_remaining = credits_remaining - 1,
        status = CASE WHEN credits_remaining - 1 <= 0 THEN 'depleted'::public.membership_status ELSE 'active'::public.membership_status END,
        updated_at = NOW()
    WHERE id = p_membership_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Crédito consumido con éxito.',
    'credits_remaining', CASE WHEN v_mem.credits_remaining IS NULL THEN NULL ELSE v_mem.credits_remaining - 1 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
