-- ============================================
-- FIX: Error al Registrar Nuevos Usuarios
-- ============================================
-- Este script resuelve el error "Database error saving new user"
-- Problemas identificados:
-- 1. Falta política RLS para INSERT en organizations
-- 2. Referencia circular en el trigger (organizations.owner_id -> profiles.id)
-- 3. El trigger necesita poder insertar sin restricciones RLS
--
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- 1. PERMITIR INSERT EN ORGANIZATIONS PARA EL TRIGGER
-- ============================================
-- Agregar política que permite insertar organizaciones durante el registro
-- (el trigger usa SECURITY DEFINER pero aún necesita pasar RLS)
DROP POLICY IF EXISTS "Trigger can insert organizations" ON organizations;

CREATE POLICY "Trigger can insert organizations" ON organizations
  FOR INSERT 
  WITH CHECK (true); -- Permite insertar cualquier organización (el trigger controla la seguridad)

-- ============================================
-- 2. HACER LA REFERENCIA OWNER_ID DEFERRABLE
-- ============================================
-- Esto permite que el trigger cree la organización antes que el perfil
-- y luego se valide la foreign key al final de la transacción

-- Primero eliminar la constraint existente si existe
-- Buscar por nombre común o por columna
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- Buscar la constraint de owner_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conrelid = 'organizations'::regclass 
  AND contype = 'f'
  AND EXISTS (
    SELECT 1 FROM pg_attribute 
    WHERE attrelid = conrelid 
    AND attname = 'owner_id' 
    AND attnum = ANY(conkey)
  )
  LIMIT 1;
  
  -- Eliminar si existe
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE organizations DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
  END IF;
END $$;

-- Crear la constraint como DEFERRABLE para permitir orden flexible
ALTER TABLE organizations
ADD CONSTRAINT organizations_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES profiles(id) 
ON DELETE RESTRICT 
DEFERRABLE INITIALLY DEFERRED;

-- ============================================
-- 3. ACTUALIZAR EL TRIGGER PARA MEJOR MANEJO DE ERRORES
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Crear organización automáticamente para el nuevo usuario
  -- Con DEFERRABLE INITIALLY DEFERRED, podemos crear la org primero
  -- aunque owner_id referencia profiles.id que aún no existe
  -- La validación de la foreign key se pospone hasta el final de la transacción
  INSERT INTO public.organizations (name, owner_id, plan, status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mi Organización'),
    NEW.id, -- El owner_id será validado al final de la transacción
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error para debugging
    RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.id, SQLERRM;
    -- Re-lanzar el error para que Supabase lo capture
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. VERIFICAR QUE EL TRIGGER EXISTA
-- ============================================
-- Asegurar que el trigger esté creado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. VERIFICACIÓN (OPCIONAL - EJECUTAR PARA TESTING)
-- ============================================
-- Verificar que las políticas estén correctas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('organizations', 'profiles')
ORDER BY tablename, policyname;

