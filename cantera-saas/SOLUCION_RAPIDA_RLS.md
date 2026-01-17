# 🔧 Solución Rápida para Error de Políticas RLS

## ❌ Error Actual
```
ERROR: 42710: policy "Users can view canteras in own organization" for table "canteras" already exists
```

## ✅ Solución (2 Opciones)

### Opción 1: Ejecutar Script de Limpieza Primero (RECOMENDADO)

1. **Ejecuta primero** el script de limpieza:
   ```
   supabase/limpiar_politicas_multi_tenant.sql
   ```
   Este script elimina TODAS las políticas multi-tenant existentes.

2. **Luego ejecuta** el script RLS:
   ```
   supabase/multi_tenant_rls.sql
   ```
   Este script crea las políticas nuevas.

### Opción 2: Usar el Script Corregido

El script `multi_tenant_rls.sql` ahora incluye más `DROP POLICY IF EXISTS`, pero si ya ejecutaste partes del script, es mejor usar la Opción 1.

## 📋 Orden Correcto de Ejecución

```
1. supabase/limpiar_politicas_multi_tenant.sql  ← PRIMERO (limpia todo)
2. supabase/multi_tenant_rls.sql                ← SEGUNDO (crea políticas nuevas)
```

## ⚠️ Nota

Si ya ejecutaste `multi_tenant_rls.sql` parcialmente, algunas políticas ya existen. Por eso es mejor ejecutar el script de limpieza primero para empezar desde cero.

