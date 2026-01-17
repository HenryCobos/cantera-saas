# 🔧 Solución: Error de Recursión Infinita en Profiles

## ❌ Error Actual
```
Error: infinite recursion detected in policy for relation "profiles"
```

## ✅ Solución Aplicada

El problema era que las políticas de `profiles` estaban consultando `profiles` dentro de sus propias políticas, causando recursión infinita.

### Correcciones Realizadas:

1. **Funciones Helper con SECURITY DEFINER**:
   - `get_user_organization_id_helper()`: Obtiene `organization_id` sin causar recursión
   - `check_is_admin()`: Verifica si el usuario es admin sin causar recursión

2. **Políticas de Profiles Corregidas**:
   - Ahora usan las funciones helper en lugar de consultar `profiles` directamente
   - Esto evita la recursión infinita

3. **Políticas de Organizations Corregidas**:
   - También usan la función helper para consistencia

## 📋 Pasos para Aplicar la Solución

### Paso 1: Ejecutar Script de Limpieza
```sql
-- Ejecuta: supabase/limpiar_politicas_multi_tenant.sql
```
Esto elimina todas las políticas existentes que pueden estar causando problemas.

### Paso 2: Ejecutar Script RLS Corregido
```sql
-- Ejecuta: supabase/multi_tenant_rls.sql (ya corregido)
```
Este script ahora incluye:
- Funciones helper para evitar recursión
- Políticas corregidas que no consultan `profiles` directamente

### Paso 3: Verificar
Después de ejecutar, intenta crear una cantera nuevamente. El error debería estar resuelto.

## 🔍 Qué Causaba el Problema

Cuando una política RLS de `profiles` hace un `SELECT` sobre `profiles`, PostgreSQL intenta aplicar RLS a esa consulta también, lo que a su vez dispara la misma política, creando un loop infinito.

## ✅ La Solución

Las funciones con `SECURITY DEFINER` se ejecutan con privilegios elevados y **no están sujetas a RLS**, por lo que pueden consultar `profiles` sin disparar las políticas RLS, rompiendo el ciclo de recursión.

