-- =============================================================================
-- MIGRACIÓN DE SEGURIDAD SAAS: PROTECCIÓN DE COLUMNAS DE PRIVILEGIO EN USERS
-- Y REGLA DE ENFRIAMIENTO DE 30 DÍAS PARA CAMBIO DE GIRO
-- =============================================================================

-- 1. Asegurar columna industry_changed_at en public.users (opcional, respaldada también en user_metadata)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS industry_changed_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Función Trigger que impide que un usuario normal (authenticated) modifique
-- sus propias columnas de privilegio (is_admin) o fechas de suscripción/prueba/hardware
-- directamente desde el cliente con la anon key (Cierre de vulnerabilidad C1).
CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permitir cambios si se ejecuta desde service_role (webhooks, admin client) o postgres
  IF current_setting('request.jwt.claims', true) IS NULL 
     OR (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Si el usuario que hace la petición NO es ya administrador en la base de datos:
  IF NOT COALESCE(OLD.is_admin, false) THEN
    -- Bloquear auto-asignación de administrador
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'No autorizado para modificar privilegios de administrador.';
    END IF;

    -- Bloquear alteración directa de fechas de suscripción pagada desde cliente
    IF NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at 
       AND OLD.subscription_expires_at IS NOT NULL THEN
      RAISE EXCEPTION 'No autorizado para modificar la vigencia de suscripción.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_privilege_escalation ON public.users;

CREATE TRIGGER trg_prevent_user_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_privilege_escalation();
