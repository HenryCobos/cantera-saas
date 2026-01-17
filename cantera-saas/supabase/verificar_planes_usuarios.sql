-- ============================================
-- VERIFICACIÓN DE PLANES Y ESTADO DE USUARIOS
-- ============================================
-- Este script muestra el estado actual de todas las organizaciones
-- y sus planes después de la migración

-- 1. Mostrar todas las organizaciones con sus planes
SELECT 
  o.id as organization_id,
  o.name as organizacion_nombre,
  o.plan,
  o.status,
  o.owner_id,
  p.email as owner_email,
  p.full_name as owner_name,
  (SELECT COUNT(*) FROM profiles WHERE organization_id = o.id) as total_usuarios,
  (SELECT COUNT(*) FROM canteras WHERE organization_id = o.id) as total_canteras,
  o.created_at
FROM organizations o
LEFT JOIN profiles p ON o.owner_id = p.id
ORDER BY o.created_at;

-- 2. Resumen por plan
SELECT 
  plan,
  COUNT(*) as cantidad_organizaciones,
  SUM((SELECT COUNT(*) FROM profiles WHERE organization_id = o.id)) as total_usuarios,
  SUM((SELECT COUNT(*) FROM canteras WHERE organization_id = o.id)) as total_canteras
FROM organizations o
GROUP BY plan
ORDER BY plan;

-- 3. Verificar que todos los planes sean válidos
SELECT 
  CASE 
    WHEN plan IN ('free', 'starter', 'profesional', 'business') THEN '✓ Válido'
    ELSE '✗ Inválido - necesita actualización'
  END as estado,
  plan,
  COUNT(*) as cantidad
FROM organizations
GROUP BY plan
ORDER BY plan;

-- 4. Mostrar organizaciones que necesitan actualización (si hay)
SELECT 
  id,
  name,
  plan as plan_actual,
  'free' as plan_recomendado,
  owner_id,
  created_at
FROM organizations
WHERE plan NOT IN ('free', 'starter', 'profesional', 'business')
ORDER BY created_at;

-- 5. Detalle de usuarios por organización
SELECT 
  o.name as organizacion,
  o.plan,
  p.email,
  p.full_name,
  p.role,
  p.created_at as fecha_registro
FROM organizations o
INNER JOIN profiles p ON p.organization_id = o.id
ORDER BY o.plan, o.name, p.created_at;

