-- ==============================================================================
-- TABLA DE COMANDAS, PEDIDOS Y REGISTRO DE VENTAS (RESTAURANTES & BARES)
-- Ejecuta este script en Supabase -> SQL Editor (en 1 clic)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number SERIAL,
  daily_order_number INTEGER DEFAULT 1,
  table_number TEXT,
  order_type TEXT DEFAULT 'table', -- 'table', 'takeout', 'delivery'
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'HNL',
  applied_coupon_code TEXT,
  applied_coupon_label TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  payment_method TEXT, -- 'cash', 'card', 'transfer', 'other'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_user_id ON public.restaurant_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_menu_id ON public.restaurant_orders(menu_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_created_at ON public.restaurant_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON public.restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_payment ON public.restaurant_orders(payment_status);

-- Habilitar RLS
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;

-- Permisos de acceso
GRANT ALL ON TABLE public.restaurant_orders TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Users can manage their restaurant orders" ON public.restaurant_orders;
CREATE POLICY "Users can manage their restaurant orders"
  ON public.restaurant_orders
  FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can insert orders" ON public.restaurant_orders;
CREATE POLICY "Public can insert orders"
  ON public.restaurant_orders
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view their order status" ON public.restaurant_orders;
CREATE POLICY "Public can view their order status"
  ON public.restaurant_orders
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Agregar a Realtime para actualización instantánea en pantalla de cocina
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_orders;
