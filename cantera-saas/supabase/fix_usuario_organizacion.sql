-- ============================================
-- CORREGIR ORGANIZACIÓN DE USUARIOS CREADOS
-- ============================================
-- Este script ayuda a corregir usuarios que tienen una organización incorrecta

-- 1. Ver usuarios con sus organizaciones
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.role,
  p.organization_id as perfil_org_id,
  o.id as org_id,
  o.name as org_name,
  o.owner_id as org_owner_id,
  CASE 
    WHEN p.id = o.owner_id THEN 'Es propietario'
    ELSE 'No es propietario'
  END as es_propietario
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY p.created_at DESC;

-- 2. Encontrar usuarios que deberían estar en otra organización
-- (usuarios que tienen una organización diferente a su admin creador)
SELECT 
  p1.id as usuario_id,
  p1.email as usuario_email,
  p1.organization_id as usuario_org_id,
  o1.name as usuario_org_nombre,
  p2.id as admin_creador_id,
  p2.email as admin_creador_email,
  p2.organization_id as admin_org_id,
  o2.name as admin_org_nombre
FROM profiles p1
INNER JOIN organizations o1 ON p1.organization_id = o1.id
INNER JOIN organizations o2 ON o2.id IN (
  SELECT organization_id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1
)
LEFT JOIN profiles p2 ON o2.owner_id = p2.id
WHERE p1.id != p1.organization_id 
  AND p1.role != 'admin'
  AND o1.owner_id != p1.id
ORDER BY p1.created_at DESC;

-- 3. CORRECCIÓN: Actualizar organization_id de usuarios creados manualmente
-- IMPORTANTE: Reemplaza 'ORGANIZATION_ID_DEL_ADMIN' con el ID real de tu organización
-- Puedes obtenerlo ejecutando:
-- SELECT id, name, owner_id FROM organizations WHERE owner_id = (SELECT id FROM profiles WHERE email = 'tu-email@admin.com');

-- Ejemplo: Actualizar un usuario específico a la organización del admin
-- UPDATE profiles
-- SET organization_id = 'ORGANIZATION_ID_DEL_ADMIN'
-- WHERE email = 'usuario@ejemplo.com';

-- 4. Para corregir todos los usuarios que tienen organización incorrecta (SOLO EJECUTAR SI ES NECESARIO)
-- Esto moverá todos los usuarios no-admin a la primera organización de admin que encuentre
-- COMENTADO POR SEGURIDAD - Descomentar solo si estás seguro

-- DO $$
-- DECLARE
--   admin_org_id UUID;
-- BEGIN
--   -- Obtener la organización del primer admin
--   SELECT organization_id INTO admin_org_id
--   FROM profiles
--   WHERE role = 'admin'
--   ORDER BY created_at
--   LIMIT 1;
--   
--   -- Actualizar todos los usuarios no-admin que no son propietarios de su organización
--   UPDATE profiles p
--   SET organization_id = admin_org_id
--   FROM organizations o
--   WHERE p.organization_id = o.id
--     AND o.owner_id != p.id
--     AND p.role != 'admin';
--     
--   RAISE NOTICE 'Usuarios actualizados a organización: %', admin_org_id;
-- END $$;

-- 5. Verificar usuarios después de la corrección
SELECT 
  p.email,
  p.full_name,
  p.role,
  o.name as organizacion,
  o.owner_id = p.id as es_propietario
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY p.created_at DESC;

