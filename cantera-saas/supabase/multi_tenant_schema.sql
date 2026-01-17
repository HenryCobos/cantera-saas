-- ============================================
-- MIGRACIÓN A MULTI-TENANT (ORGANIZACIONES)
-- ============================================
-- Este script convierte el sistema en un SaaS multi-tenant
-- Ejecuta este script en SQL Editor de Supabase

-- ============================================
-- 1. CREAR TABLA ORGANIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  plan TEXT NOT NULL DEFAULT 'gratuito' CHECK (plan IN ('gratuito', 'basico', 'premium')),
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'suspendida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- ============================================
-- 2. AGREGAR organization_id A PROFILES
-- ============================================
-- Primero hacer nullable para poder migrar datos existentes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);

-- ============================================
-- 3. AGREGAR organization_id A CANTERAS
-- ============================================
ALTER TABLE canteras 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_canteras_organization ON canteras(organization_id);

-- ============================================
-- 4. MIGRAR USUARIOS EXISTENTES
-- ============================================
-- Crear organización para cada usuario existente que no tenga una
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  -- Para cada usuario en profiles que no tenga organization_id
  FOR user_record IN 
    SELECT id, email, full_name, role 
    FROM profiles 
    WHERE organization_id IS NULL
  LOOP
    -- Crear organización para el usuario
    INSERT INTO organizations (name, owner_id, plan, status)
    VALUES (
      COALESCE(user_record.full_name, 'Mi Organización') || ' - ' || COALESCE(user_record.email, 'Usuario'),
      user_record.id,
      'gratuito',
      'activa'
    )
    RETURNING id INTO org_id;
    
    -- Asignar organization_id al perfil
    UPDATE profiles 
    SET organization_id = org_id 
    WHERE id = user_record.id;
    
    -- Si el usuario es admin, asegurar que su perfil tenga role 'admin'
    UPDATE profiles 
    SET role = 'admin' 
    WHERE id = user_record.id AND role IS NULL;
  END LOOP;
END $$;

-- ============================================
-- 5. MIGRAR CANTERAS EXISTENTES
-- ============================================
-- Asignar canteras sin organization_id a la organización del primer admin que las creó
-- O a la primera organización disponible
DO $$
DECLARE
  cantera_record RECORD;
  org_id UUID;
BEGIN
  -- Para cada cantera sin organization_id
  FOR cantera_record IN 
    SELECT c.id, c.name, c.created_at
    FROM canteras c
    WHERE c.organization_id IS NULL
    ORDER BY c.created_at
  LOOP
    -- Obtener la primera organización disponible (o crear una por defecto)
    SELECT id INTO org_id 
    FROM organizations 
    ORDER BY created_at 
    LIMIT 1;
    
    -- Si no hay organizaciones, crear una por defecto
    IF org_id IS NULL THEN
      INSERT INTO organizations (name, owner_id, plan, status)
      SELECT 
        'Organización por Defecto',
        id,
        'gratuito',
        'activa'
      FROM profiles
      ORDER BY created_at
      LIMIT 1
      RETURNING id INTO org_id;
    END IF;
    
    -- Asignar organization_id a la cantera
    UPDATE canteras 
    SET organization_id = org_id 
    WHERE id = cantera_record.id;
  END LOOP;
END $$;

-- ============================================
-- 6. HACER organization_id REQUERIDO (DESPUÉS DE MIGRACIÓN)
-- ============================================
-- Primero verificar que todos los perfiles tengan organization_id
DO $$
BEGIN
  -- Solo hacer NOT NULL si hay perfiles sin organización
  IF EXISTS (SELECT 1 FROM profiles WHERE organization_id IS NULL) THEN
    RAISE NOTICE 'No se puede hacer organization_id NOT NULL: hay perfiles sin organización asignada. Estos deberían haberse migrado en el paso anterior.';
  ELSE
    -- Hacer organization_id NOT NULL en profiles (solo si ya no lo es)
    BEGIN
      ALTER TABLE profiles 
      ALTER COLUMN organization_id SET NOT NULL;
      RAISE NOTICE 'organization_id ahora es NOT NULL en profiles';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'organization_id ya es NOT NULL en profiles o no se pudo cambiar: %', SQLERRM;
    END;
    
    -- Hacer organization_id NOT NULL en canteras (solo si ya no lo es)
    BEGIN
      ALTER TABLE canteras 
      ALTER COLUMN organization_id SET NOT NULL;
      RAISE NOTICE 'organization_id ahora es NOT NULL en canteras';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'organization_id ya es NOT NULL en canteras o no se pudo cambiar: %', SQLERRM;
    END;
  END IF;
END $$;

-- ============================================
-- 7. ACTUALIZAR TRIGGER DE CREACIÓN DE PERFIL
-- ============================================
-- Modificar el trigger para crear organización automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Crear organización automáticamente para el nuevo usuario
  INSERT INTO public.organizations (name, owner_id, plan, status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mi Organización'),
    NEW.id,
    'gratuito',
    'activa'
  )
  RETURNING id INTO new_org_id;
  
  -- Crear perfil con organization_id
  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    'admin',
    new_org_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger ya existe, solo actualizar la función

-- ============================================
-- 8. FUNCIÓN HELPER PARA OBTENER organization_id DEL USUARIO
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 9. VERIFICAR MIGRACIÓN
-- ============================================
-- Verificar que todos los perfiles tengan organization_id
SELECT 
  COUNT(*) as total_profiles,
  COUNT(organization_id) as profiles_with_org,
  COUNT(*) - COUNT(organization_id) as profiles_without_org
FROM profiles;

-- Verificar que todas las canteras tengan organization_id
SELECT 
  COUNT(*) as total_canteras,
  COUNT(organization_id) as canteras_with_org,
  COUNT(*) - COUNT(organization_id) as canteras_without_org
FROM canteras;

-- Listar todas las organizaciones creadas
SELECT 
  o.id,
  o.name,
  o.owner_id,
  p.email as owner_email,
  p.full_name as owner_name,
  o.plan,
  o.status,
  (SELECT COUNT(*) FROM profiles WHERE organization_id = o.id) as total_users,
  (SELECT COUNT(*) FROM canteras WHERE organization_id = o.id) as total_canteras
FROM organizations o
LEFT JOIN profiles p ON o.owner_id = p.id
ORDER BY o.created_at;

