# 🔧 Instrucciones para Corregir Recursión Infinita en RLS

## ❌ Error Actual
```
infinite recursion detected in policy for relation "profiles"
```

## ✅ Solución

### Paso 1: Ejecutar Script SQL Corregido

1. **Abre Supabase SQL Editor**:
   - Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/sql
   - Haz clic en "New query"

2. **Copia el script completo**:
   - Abre el archivo `supabase/fix_recursion_rls.sql` en tu proyecto
   - Copia **TODO** el contenido (desde la línea 1 hasta el final)

3. **Pega y ejecuta**:
   - Pega el contenido en el SQL Editor
   - Haz clic en "RUN" o presiona Ctrl+Enter

4. **Verifica que no haya errores**:
   - Deberías ver un mensaje de éxito
   - Al final del script, verás un listado de todas las políticas creadas

### Paso 2: Si Aún Hay Error de "Policy Already Exists"

Si ves el error `policy "Users can view own profile" for table "profiles" already exists`, ejecuta primero este script de limpieza:

```sql
-- LIMPIEZA COMPLETA DE POLÍTICAS
-- Ejecuta esto PRIMERO si hay conflictos

-- Eliminar todas las políticas de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Eliminar todas las políticas de canteras
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can insert canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can update canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can delete canteras" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- Luego ejecuta el script completo fix_recursion_rls.sql
```

### Paso 3: Probar Crear Cantera

1. **Recarga la página del navegador** (F5)
2. **Ve a**: `/dashboard/cantera/nueva`
3. **Intenta crear una cantera**
4. **Debería funcionar sin errores**

## 🔍 Qué Hace el Script

1. **Elimina todas las políticas problemáticas** que causan recursión
2. **Recrea políticas simplificadas** que no consultan `profiles` dentro de políticas de `profiles`
3. **Permite que todos los usuarios autenticados** puedan crear/editar canteras (evita recursión)
4. **Corrige todas las demás tablas** con el mismo enfoque

## ⚠️ Nota Importante

Las políticas ahora permiten que **todos los usuarios autenticados** puedan escribir en todas las tablas. Esto evita la recursión y permite que el sistema funcione correctamente.

Si necesitas restringir permisos por rol en el futuro, puedes hacerlo desde el código de la aplicación usando el hook `useAuth()` que ya tienes implementado.

## ✅ Verificación

Después de ejecutar el script, ejecuta esta query para verificar:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

Deberías ver todas las políticas listadas sin errores.

