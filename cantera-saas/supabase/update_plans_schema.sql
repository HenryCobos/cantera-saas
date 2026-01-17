-- ============================================
-- ACTUALIZACIÓN DE PLANES A NUEVA ESTRUCTURA
-- ============================================
-- Este script actualiza los planes de 'gratuito', 'basico', 'premium' 
-- a 'free', 'starter', 'profesional', 'business'

-- 1. Eliminar el constraint antiguo (si existe)
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_plan_check;

-- 2. Migrar valores existentes ANTES de agregar el nuevo constraint
-- Esto actualiza todos los valores antiguos a los nuevos
UPDATE organizations 
SET plan = CASE 
  WHEN plan = 'gratuito' THEN 'free'
  WHEN plan = 'basico' THEN 'starter'
  WHEN plan = 'premium' THEN 'profesional'
  WHEN plan NOT IN ('free', 'starter', 'profesional', 'business') THEN 'free'
  ELSE plan
END;

-- 3. Ahora agregar el nuevo constraint con los valores correctos
ALTER TABLE organizations 
ADD CONSTRAINT organizations_plan_check 
CHECK (plan IN ('free', 'starter', 'profesional', 'business'));

-- 4. Actualizar valor por defecto
ALTER TABLE organizations 
ALTER COLUMN plan SET DEFAULT 'free';

-- 5. Actualizar función handle_new_user para usar 'free'
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
    'free',
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

-- 6. Verificar migración
SELECT 
  plan,
  COUNT(*) as cantidad
FROM organizations
GROUP BY plan
ORDER BY plan;

