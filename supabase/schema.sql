-- Habilitar extensión pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Usuarios (Extensión de auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear usuario en public.users cuando se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Tabla de Workspaces (Empresas / Negocios)
CREATE TABLE public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Miembros del Workspace (B2B/Equipos)
CREATE TABLE public.workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- 4. Tabla de vCards (Perfiles Digitales)
CREATE TABLE public.vcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Dueño de la tarjeta
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL, -- Opcional, si pertenece a una empresa
  slug TEXT UNIQUE NOT NULL, -- URL amigable, ej: omnitag.com/v/juan-perez
  first_name TEXT NOT NULL,
  last_name TEXT,
  job_title TEXT,
  company_name TEXT,
  bio TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb, -- Teléfono, email, redes sociales
  theme JSONB DEFAULT '{"color": "#000000"}'::jsonb, -- Opciones de personalización
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Dispositivos / Hardware (NFC, QRs - Tap-to-Rate)
CREATE TABLE public.devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id TEXT UNIQUE NOT NULL, -- El ID interno impreso/grabado en el NFC (ej: OT-1234)
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL, -- Empresa dueña
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Usuario que activó el dispositivo
  device_type TEXT NOT NULL CHECK (device_type IN ('tap_to_rate', 'vcard', 'generic')),
  vcard_id UUID REFERENCES public.vcards(id) ON DELETE SET NULL, -- Si redirecciona a una vCard
  redirect_url TEXT, -- Si es Tap-to-Rate, aquí va la URL (Google Reviews Place ID)
  is_active BOOLEAN DEFAULT false, -- Inicialmente falso hasta que el cliente lo active escaneando
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Analítica (Tracking simple)
CREATE TABLE public.scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  os TEXT, -- iOS, Android, etc.
  country TEXT
);
