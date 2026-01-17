-- ============================================
-- SCRIPT DE VERIFICACIÓN MULTI-TENANT
-- ============================================
-- Ejecuta este script para verificar si la migración multi-tenant
-- se completó correctamente

-- 1. Verificar si existe la tabla organizations
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations')
    THEN '✓ Tabla organizations existe'
    ELSE '✗ Tabla organizations NO existe - Ejecuta multi_tenant_schema.sql'
  END as verificacion_tabla;

-- 2. Verificar si profiles tiene organization_id
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'organization_id'
    )
    THEN '✓ Columna organization_id existe en profiles'
    ELSE '✗ Columna organization_id NO existe en profiles - Ejecuta multi_tenant_schema.sql'
  END as verificacion_columna_profiles;

-- 3. Verificar si canteras tiene organization_id
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'canteras' AND column_name = 'organization_id'
    )
    THEN '✓ Columna organization_id existe en canteras'
    ELSE '✗ Columna organization_id NO existe en canteras - Ejecuta multi_tenant_schema.sql'
  END as verificacion_columna_canteras;

-- 4. Verificar perfiles sin organization_id
SELECT 
  COUNT(*) as perfiles_sin_organizacion,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Todos los perfiles tienen organization_id'
    ELSE '✗ Hay ' || COUNT(*) || ' perfiles sin organization_id - Ejecuta multi_tenant_schema.sql'
  END as estado
FROM profiles 
WHERE organization_id IS NULL;

-- 5. Verificar canteras sin organization_id
SELECT 
  COUNT(*) as canteras_sin_organizacion,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ Todas las canteras tienen organization_id'
    ELSE '✗ Hay ' || COUNT(*) || ' canteras sin organization_id - Ejecuta multi_tenant_schema.sql'
  END as estado
FROM canteras 
WHERE organization_id IS NULL;

-- 6. Listar todas las organizaciones
SELECT 
  o.id,
  o.name,
  p.email as owner_email,
  o.plan,
  (SELECT COUNT(*) FROM profiles WHERE organization_id = o.id) as total_usuarios,
  (SELECT COUNT(*) FROM canteras WHERE organization_id = o.id) as total_canteras
FROM organizations o
LEFT JOIN profiles p ON o.owner_id = p.id
ORDER BY o.created_at;

-- 7. Verificar políticas RLS
SELECT 
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (tablename = 'organizations' OR tablename = 'profiles' OR tablename = 'canteras')
GROUP BY tablename
ORDER BY tablename;

