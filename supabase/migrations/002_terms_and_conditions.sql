-- ==========================================
-- PLAZA DANCE APP — MIGRATION 002: TERMS & CONDITIONS
-- Registro de aceptación de términos (RGPD sección 52 & 57).
-- ==========================================

-- 1. TABLA: TERMS_VERSIONS (Versiones de Términos y Condiciones)
CREATE TABLE IF NOT EXISTS public.terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL,                -- e.g. 'v1.0', 'v2.0'
  title TEXT NOT NULL,
  content TEXT NOT NULL,                        -- Full legal text
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT FALSE,            -- Only one should be TRUE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: USER_TERMS_ACCEPTANCE (Registro de aceptación por usuario)
CREATE TABLE IF NOT EXISTS public.user_terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES public.terms_versions(id) ON DELETE RESTRICT,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,                              -- IP de aceptación para registro legal
  user_agent TEXT,                              -- Navigator user agent
  CONSTRAINT unique_user_terms UNIQUE(user_id, terms_version_id)
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_terms_current ON public.terms_versions(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_terms_user ON public.user_terms_acceptance(user_id);

-- 4. RLS
ALTER TABLE public.terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Terms versions are publicly readable
CREATE POLICY "Terms versions are publicly readable"
  ON public.terms_versions FOR SELECT
  TO authenticated
  USING (true);

-- Only superadmins can manage terms versions
CREATE POLICY "Only superadmins can manage terms versions"
  ON public.terms_versions FOR ALL
  TO authenticated
  USING (public.is_superadmin(auth.uid()));

-- Users can view their own acceptance records
CREATE POLICY "Users can view their own terms acceptance"
  ON public.user_terms_acceptance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_superadmin(auth.uid()));

-- Users can insert their own acceptance
CREATE POLICY "Users can accept terms"
  ON public.user_terms_acceptance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. SEED: Initial Terms Version (v1.0)
INSERT INTO public.terms_versions (version, title, content, is_current)
VALUES (
  'v1.0',
  'Términos y Condiciones de Plaza Dance',
  'Al utilizar Plaza Dance, aceptas las condiciones de uso de la plataforma. ' ||
  'Tus datos personales serán tratados conforme al RGPD (Reglamento General de Protección de Datos). ' ||
  'Puedes ejercer tus derechos de acceso, rectificación y supresión contactando con el administrador de la plataforma. ' ||
  'La práctica de actividades físicas como el baile conlleva riesgos inherentes. ' ||
  'Cada organización puede establecer condiciones adicionales específicas.',
  TRUE
)
ON CONFLICT (version) DO NOTHING;
