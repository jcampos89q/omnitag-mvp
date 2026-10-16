-- ==============================================================================
-- FIX CRÍTICO DE PERMISOS RLS: ESCANEOS NFC, NOTIFICACIONES Y PUSH ALERTS
-- Ejecuta este script en Supabase -> SQL Editor para desbloquear de inmediato
-- el registro de visitas, reseñas y el envío de notificaciones.
-- ==============================================================================

-- 1. TABLA SCANS (Escaneos NFC y visitas de clientes públicos)
GRANT ALL ON TABLE public.scans TO anon, authenticated, service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir insercion publica de escaneos" ON public.scans;
DROP POLICY IF EXISTS "Permitir insertar escaneos" ON public.scans;
DROP POLICY IF EXISTS "scans_insert_policy" ON public.scans;

CREATE POLICY "Permitir insercion publica de escaneos" 
  ON public.scans 
  FOR INSERT 
  TO anon, authenticated, service_role 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de escaneos" ON public.scans;
DROP POLICY IF EXISTS "scans_select_policy" ON public.scans;

CREATE POLICY "Permitir lectura de escaneos" 
  ON public.scans 
  FOR SELECT 
  TO authenticated, service_role 
  USING (
    target_user_id = auth.uid() 
    OR device_id IN (SELECT id FROM public.devices WHERE user_id = auth.uid())
    OR vcard_id IN (SELECT id FROM public.vcards WHERE user_id = auth.uid())
    OR menu_id IN (SELECT id FROM public.menus WHERE user_id = auth.uid())
    OR loyalty_program_id IN (SELECT id FROM public.loyalty_programs WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- 2. TABLA PRIVATE_FEEDBACKS (Quejas privadas de clientes 1-3 estrellas)
GRANT ALL ON TABLE public.private_feedbacks TO anon, authenticated, service_role;
ALTER TABLE public.private_feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir insercion de quejas privadas" ON public.private_feedbacks;
DROP POLICY IF EXISTS "feedbacks_insert_policy" ON public.private_feedbacks;

CREATE POLICY "Permitir insercion de quejas privadas" 
  ON public.private_feedbacks 
  FOR INSERT 
  TO anon, authenticated, service_role 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir ver quejas privadas" ON public.private_feedbacks;
DROP POLICY IF EXISTS "feedbacks_select_policy" ON public.private_feedbacks;

CREATE POLICY "Permitir ver quejas privadas" 
  ON public.private_feedbacks 
  FOR SELECT 
  TO authenticated, service_role 
  USING (
    device_id IN (SELECT id FROM public.devices WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- 3. TABLA NOTIFICATIONS (Notificaciones en la campana para usuarios y admins)
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir insercion de notificaciones" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;

CREATE POLICY "Permitir insercion de notificaciones" 
  ON public.notifications 
  FOR INSERT 
  TO anon, authenticated, service_role 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir ver notificaciones propias" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;

CREATE POLICY "Permitir ver notificaciones propias" 
  ON public.notifications 
  FOR SELECT 
  TO authenticated, service_role 
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Permitir actualizar notificaciones propias" ON public.notifications;
CREATE POLICY "Permitir actualizar notificaciones propias" 
  ON public.notifications 
  FOR UPDATE 
  TO authenticated, service_role 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. PUSH SUBSCRIPTIONS Y FUNCIÓN RPC DE ENVÍO
GRANT ALL ON TABLE public.push_subscriptions TO anon, authenticated, service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir gestionar suscripciones propias" ON public.push_subscriptions;
CREATE POLICY "Permitir gestionar suscripciones propias" 
  ON public.push_subscriptions 
  FOR ALL 
  TO authenticated, service_role 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Función con SECURITY DEFINER para enviar Web Push de forma segura sin bloqueos
CREATE OR REPLACE FUNCTION public.get_user_push_subscriptions(p_user_id UUID)
RETURNS SETOF public.push_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.push_subscriptions
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_push_subscriptions(UUID) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.delete_expired_push_subscription(p_endpoint TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.push_subscriptions
  WHERE endpoint = p_endpoint;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_expired_push_subscription(TEXT) TO anon, authenticated, service_role;
