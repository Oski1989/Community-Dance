-- ==========================================
-- PLAZA DANCE APP — MIGRATION 003: BOOTSTRAP SUPERADMIN
-- Script seguro para crear el primer superadmin del sistema (sección 51).
-- Solo ejecutar mediante service_role_key, nunca desde el frontend.
-- ==========================================

-- Este script se ejecuta UNA SOLA VEZ con la service_role_key.
-- El email del superadmin debe estar previamente registrado en auth.users
-- a través del flujo normal de registro.

-- Actualizar el global_role del primer superadmin.
-- El email debe coincidir con la variable de entorno INITIAL_SUPERADMIN_EMAIL.
-- Ejemplo: 'admin@plazadance.com'

-- INSTRUCCIONES DE USO:
-- 1. Registrar el usuario con el email elegido mediante el formulario de registro normal.
-- 2. Ejecutar este script desde el SQL Editor de Supabase o mediante CLI con service_role_key.
-- 3. Reemplazar 'SUPERADMIN_EMAIL_HERE' por el email real del superadmin.

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'SUPERADMIN_EMAIL_HERE'; -- ← REEMPLAZAR con el email real
BEGIN
  -- Buscar el user_id del email en profile_private
  SELECT user_id INTO target_user_id
  FROM public.profile_private
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado. Regístralo primero.', target_email;
  END IF;

  -- Promover a superadmin
  UPDATE public.profiles
  SET global_role = 'superadmin', updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Usuario % promovido a superadmin correctamente.', target_email;
END $$;
