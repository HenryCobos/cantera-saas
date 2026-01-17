-- ============================================
-- CORREGIR USUARIO OPERADOR CON ORGANIZACIÓN INCORRECTA
-- ============================================
-- Este script corrige usuarios que fueron creados con una organización incorrecta

-- 1. Ver todos los usuarios y sus organizaciones
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as organizacion_nombre,
  o.owner_id as org_owner_id,
  CASE 
    WHEN p.id = o.owner_id THEN 'SÍ - Es propietario'
    ELSE 'NO - No es propietario'
  END as es_propietario_org
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY p.created_at DESC;

-- 2. Encontrar usuarios que deberían estar en otra organización
-- (usuarios que tienen una organización diferente a la del admin)
SELECT 
  p.email as usuario_email,
  p.full_name as usuario_nombre,
  p.role as usuario_rol,
  o1.name as organizacion_actual,
  o2.name as organizacion_admin,
  o2.id as organizacion_correcta_id
FROM profiles p
INNER JOIN organizations o1 ON p.organization_id = o1.id
INNER JOIN profiles p_admin ON p_admin.role = 'admin'
INNER JOIN organizations o2 ON p_admin.organization_id = o2.id
WHERE p.role != 'admin'
  AND o1.id != o2.id
  AND p.id != o1.owner_id
ORDER BY p.created_at DESC;

-- 3. CORRECCIÓN MANUAL: Actualizar un usuario específico a la organización correcta
-- Reemplaza 'EMAIL_DEL_USUARIO' con el email del usuario que quieres corregir
-- Ejemplo:
-- UPDATE profiles
-- SET organization_id = (
--   SELECT organization_id 
--   FROM profiles 
--   WHERE role = 'admin' 
--   ORDER BY created_at 
--   LIMIT 1
-- )
-- WHERE email = 'valeria151730@gmail.com';

-- 4. CORRECCIÓN AUTOMÁTICA: Mover todos los usuarios no-admin a la organización del admin
-- Esto moverá todos los usuarios que no son propietarios de su organización
-- a la organización del primer admin que encuentre
-- ⚠️ ADVERTENCIA: Solo ejecutar si estás seguro de que quieres mover todos los usuarios

DO $$
DECLARE
  admin_org_id UUID;
  usuario_record RECORD;
  usuarios_actualizados INTEGER := 0;
BEGIN
  -- Obtener la organización del primer admin (el más antiguo)
  SELECT organization_id INTO admin_org_id
  FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at
  LIMIT 1;
  
  IF admin_org_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún administrador con organización';
  END IF;
  
  RAISE NOTICE 'Organización del admin encontrada: %', admin_org_id;
  
  -- Actualizar todos los usuarios que no son propietarios de su organización
  -- y que tienen una organización diferente a la del admin
  FOR usuario_record IN
    SELECT p.id, p.email, p.organization_id
    FROM profiles p
    INNER JOIN organizations o ON p.organization_id = o.id
    WHERE p.role != 'admin'
      AND o.owner_id != p.id
      AND p.organization_id != admin_org_id
  LOOP
    -- Actualizar el usuario a la organización del admin
    UPDATE profiles
    SET organization_id = admin_org_id
    WHERE id = usuario_record.id;
    
    usuarios_actualizados := usuarios_actualizados + 1;
    RAISE NOTICE 'Usuario actualizado: % (ID: %)', usuario_record.email, usuario_record.id;
  END LOOP;
  
  RAISE NOTICE 'Total de usuarios actualizados: %', usuarios_actualizados;
END $$;

-- 5. Verificar usuarios después de la corrección
SELECT 
  p.email,
  p.full_name,
  p.role,
  o.name as organizacion,
  CASE 
    WHEN p.id = o.owner_id THEN 'SÍ'
    ELSE 'NO'
  END as es_propietario
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY o.name, p.role, p.created_at;

