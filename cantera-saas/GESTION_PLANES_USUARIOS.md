# 📋 Gestión de Planes de Usuarios Existentes

## Situación Actual

Si tienes usuarios creados antes de implementar el nuevo sistema de planes, necesitas verificar y actualizar sus planes según la nueva estructura.

## Planes Anteriores vs Nuevos

| Plan Anterior | Plan Nuevo | Descripción |
|---------------|------------|-------------|
| `gratuito` | `free` | Plan gratuito (por defecto) |
| `basico` | `starter` | Plan básico ($29/mes) |
| `premium` | `profesional` | Plan profesional ($79/mes) |

## Pasos para Verificar y Actualizar

### 1. Ejecutar Script de Migración

Si aún no lo has hecho, ejecuta `supabase/update_plans_schema.sql` que:
- ✅ Actualiza automáticamente los planes antiguos a los nuevos
- ✅ Establece el constraint correcto
- ✅ Migra todos los usuarios existentes

### 2. Verificar Estado Actual

Ejecuta el script `supabase/verificar_planes_usuarios.sql` para ver:
- Todas las organizaciones y sus planes actuales
- Resumen por plan
- Usuarios por organización
- Organizaciones que necesitan actualización

### 3. Verificación Manual de Planes

Si tienes 4 usuarios, puedes verificar sus planes ejecutando en Supabase SQL Editor:

```sql
-- Ver todas las organizaciones con sus planes
SELECT 
  o.name as organizacion,
  o.plan,
  o.status,
  p.email as owner_email,
  p.full_name as owner_name
FROM organizations o
LEFT JOIN profiles p ON o.owner_id = p.id
ORDER BY o.created_at;
```

### 4. Actualizar Planes Manualmente (Si es necesario)

Si algún usuario tiene un plan inválido o quieres cambiar su plan manualmente:

```sql
-- Actualizar plan de una organización específica
UPDATE organizations 
SET plan = 'starter'  -- o 'free', 'profesional', 'business'
WHERE id = 'uuid-de-la-organizacion';
```

## Límites por Plan

### Plan Free (Gratuito)
- ✅ 1 cantera
- ✅ Hasta 3 usuarios
- ✅ 50 registros de producción/mes
- ✅ 30 ventas/mes
- ✅ 20 clientes
- ✅ Reportes básicos (últimos 3 meses)
- ❌ Sin exportación PDF

### Plan Starter ($29/mes)
- ✅ 1 cantera
- ✅ Hasta 5 usuarios
- ✅ Producción ilimitada
- ✅ Ventas ilimitadas
- ✅ Clientes ilimitados
- ✅ Exportación PDF
- ✅ Reportes completos (12 meses)

### Plan Profesional ($79/mes)
- ✅ Hasta 3 canteras
- ✅ Hasta 15 usuarios
- ✅ Todo del Starter
- ✅ Exportación PDF/Excel
- ✅ Reportes avanzados
- ✅ API básica

### Plan Business ($149/mes)
- ✅ Canteras ilimitadas
- ✅ Usuarios ilimitados
- ✅ Todo del Profesional
- ✅ Integraciones
- ✅ API completa
- ✅ Soporte dedicado

## Verificación de Límites

Los límites están implementados en:

1. **Crear Cantera** - Verifica límite de canteras
2. **Agregar Usuario** - Verifica límite de usuarios
3. **Registrar Producción** - Verifica límite mensual de producción
4. **Registrar Venta** - Verifica límite mensual de ventas
5. **Agregar Cliente** - Verifica límite de clientes
6. **Exportar PDF** - Verifica si el plan permite exportación

### Probar Límites (Solo Desarrollo)

Puedes probar los límites accediendo a:
```
GET /api/limits/test
```

Esto mostrará el plan actual y los resultados de todas las verificaciones.

## Recomendaciones

1. **Usuarios existentes**: Todos deberían tener plan `free` por defecto después de la migración
2. **Actualización manual**: Si quieres asignar planes superiores a usuarios existentes, hazlo manualmente desde Supabase
3. **Verificación**: Ejecuta el script de verificación periódicamente para asegurar que los planes sean correctos

## Próximos Pasos

1. Ejecuta `supabase/update_plans_schema.sql` si aún no lo has hecho
2. Ejecuta `supabase/verificar_planes_usuarios.sql` para ver el estado
3. Verifica que los límites funcionen correctamente probando crear registros
4. Asigna planes superiores manualmente si es necesario

