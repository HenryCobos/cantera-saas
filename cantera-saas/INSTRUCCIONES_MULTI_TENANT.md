# Instrucciones: Implementación Multi-Tenant (Organizaciones)

Este documento explica cómo implementar el modelo multi-tenant en tu sistema SaaS.

## 📋 Resumen

La implementación multi-tenant permite que:
- Cada usuario que se registra tenga su propia **organización**
- Cada organización tenga sus propios datos aislados (canteras, clientes, ventas, etc.)
- Los administradores puedan crear usuarios adicionales en su organización
- Cada usuario solo vea los datos de su organización

## 🔄 Cambios en la Base de Datos

### Estructura Nueva

1. **Tabla `organizations`**: Almacena las organizaciones
   - Cada usuario que se registra crea automáticamente su organización
   - El usuario queda como `owner` de la organización

2. **Campo `organization_id` en `profiles`**: Vincula usuarios con organizaciones
   - Todos los usuarios pertenecen a una organización

3. **Campo `organization_id` en `canteras`**: Vincula canteras con organizaciones
   - Todas las canteras pertenecen a una organización

4. **RLS actualizado**: Todas las políticas filtran por `organization_id`
   - Los usuarios solo pueden ver/modificar datos de su organización

## 📝 Pasos para Implementar

### Paso 1: Ejecutar Script de Esquema

1. Ve a **Supabase SQL Editor**:
   - https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/sql

2. Abre el archivo `supabase/multi_tenant_schema.sql`

3. **Copia TODO el contenido** y pégalo en el SQL Editor

4. **Ejecuta el script** (botón RUN o Ctrl+Enter)

5. **Verifica** que se ejecutó sin errores:
   - Deberías ver mensajes de éxito al final
   - El script crea:
     - Tabla `organizations`
     - Campo `organization_id` en `profiles` y `canteras`
     - Organizaciones automáticas para usuarios existentes
     - Migración de canteras existentes a organizaciones

### Paso 2: Ejecutar Script de RLS

1. En el mismo **SQL Editor**, crea una **nueva query** (New query)

2. Abre el archivo `supabase/multi_tenant_rls.sql`

3. **Copia TODO el contenido** y pégalo en el SQL Editor

4. **Ejecuta el script** (botón RUN o Ctrl+Enter)

5. **Verifica** que se ejecutó sin errores:
   - Al final deberías ver un listado de todas las políticas creadas
   - Todas las políticas deben incluir filtros por `organization_id`

### Paso 3: Verificar Migración

Ejecuta esta query para verificar que todo está correcto:

```sql
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

-- Ver todas las organizaciones creadas
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
```

**Resultado esperado:**
- `profiles_without_org` debe ser `0`
- `canteras_without_org` debe ser `0`
- Cada usuario existente debe tener su propia organización

### Paso 4: Probar en la Aplicación

1. **Recarga la aplicación** en el navegador (F5)

2. **Inicia sesión** con uno de tus usuarios existentes

3. **Verifica** que:
   - El dashboard muestra solo tus datos (no los de otros usuarios)
   - Puedes crear canteras normalmente
   - Todas las canteras creadas pertenecen a tu organización

4. **Registra un nuevo usuario**:
   - Ve a `/auth/register`
   - Crea una nueva cuenta
   - Verifica que se crea automáticamente una organización para él
   - Verifica que solo ve sus datos (no los de otros usuarios)

5. **Gestiona usuarios** (solo admins):
   - Inicia sesión como admin
   - Ve a `/dashboard/organizacion/usuarios`
   - Crea un nuevo usuario en tu organización
   - Verifica que el nuevo usuario solo ve los datos de tu organización

## 🔐 Comportamiento Esperado

### Aislamiento de Datos

- **Usuario A** (organización 1) NO puede ver:
  - Canteras de Usuario B (organización 2)
  - Clientes de Usuario B
  - Ventas de Usuario B
  - Ningún dato de Usuario B

- **Usuario A** SOLO puede ver:
  - Sus propias canteras
  - Clientes de sus canteras
  - Ventas de sus canteras
  - Datos de su organización

### Creación de Usuarios (Solo Admins)

- Los **administradores** pueden:
  - Crear usuarios en su organización
  - Asignar roles (operador, supervisor, ventas, contabilidad, admin)
  - Eliminar usuarios de su organización

- Los usuarios creados:
  - Automáticamente pertenecen a la organización del admin que los creó
  - Solo pueden ver los datos de esa organización

## ⚠️ Notas Importantes

1. **Backup**: Antes de ejecutar los scripts, considera hacer un backup de tu base de datos

2. **Usuario Admin en Supabase**: Para crear usuarios programáticamente, necesitas usar `supabase.auth.admin.createUser()`, que requiere privilegios de admin en Supabase. Si no tienes acceso, puedes:
   - Usar la consola de Supabase para crear usuarios manualmente
   - O configurar Service Role Key en tu aplicación (no recomendado para producción)

3. **Trigger Automático**: El trigger `handle_new_user()` ahora crea automáticamente:
   - Una organización para el nuevo usuario
   - Un perfil con `role = 'admin'` y `organization_id` asignado

4. **Migración de Datos Existentes**:
   - Los usuarios existentes obtendrán automáticamente su propia organización
   - Las canteras existentes se asignarán a la primera organización disponible (o la del primer admin)

## 🐛 Solución de Problemas

### Error: "organization_id cannot be null"
- **Causa**: El script de migración no se ejecutó correctamente
- **Solución**: Ejecuta nuevamente `multi_tenant_schema.sql`

### Error: "permission denied for table profiles"
- **Causa**: Las políticas RLS no se aplicaron correctamente
- **Solución**: Ejecuta nuevamente `multi_tenant_rls.sql`

### Los usuarios ven datos de otros usuarios
- **Causa**: Las políticas RLS no están filtrando por `organization_id`
- **Solución**: Verifica que `multi_tenant_rls.sql` se ejecutó correctamente

### No puedo crear usuarios desde la aplicación
- **Causa**: La función `supabase.auth.admin.createUser()` requiere Service Role Key
- **Solución**: 
  - Configura Service Role Key en variables de entorno (solo para servidor)
  - O usa la consola de Supabase para crear usuarios manualmente

## ✅ Checklist de Implementación

- [ ] Ejecutado `multi_tenant_schema.sql` sin errores
- [ ] Ejecutado `multi_tenant_rls.sql` sin errores
- [ ] Verificado que todos los perfiles tienen `organization_id`
- [ ] Verificado que todas las canteras tienen `organization_id`
- [ ] Probado login con usuario existente
- [ ] Probado registro de nuevo usuario
- [ ] Verificado aislamiento de datos entre usuarios
- [ ] Probado creación de usuarios (admin)

## 📚 Archivos Modificados

- `supabase/multi_tenant_schema.sql` - Esquema de base de datos
- `supabase/multi_tenant_rls.sql` - Políticas RLS
- `app/dashboard/cantera/nueva/page.tsx` - Incluye `organization_id` al crear canteras
- `app/dashboard/organizacion/usuarios/page.tsx` - Gestión de usuarios (NUEVO)
- `components/layout/Sidebar.tsx` - Agregado enlace "Usuarios" para admins
- `lib/supabase/get-organization.ts` - Helper para obtener organización (NUEVO)

## 🎉 Resultado Final

Después de implementar estos cambios, tendrás:

✅ **SaaS Multi-Tenant completamente funcional**
✅ **Aislamiento de datos entre organizaciones**
✅ **Cada usuario tiene su propia organización al registrarse**
✅ **Los administradores pueden gestionar usuarios en su organización**
✅ **Todos los datos están filtrados por organización automáticamente**

