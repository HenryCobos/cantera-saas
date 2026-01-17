# 🔐 Sistema de Permisos y Roles

## 📋 Roles Disponibles

El sistema tiene 5 roles diferentes, cada uno con permisos específicos:

### 1. **Admin** (Administrador)
**Acceso completo al sistema**

- ✅ **Cantera**: Leer, escribir, eliminar
- ✅ **Producción**: Leer, escribir, eliminar
- ✅ **Inventario**: Leer, escribir, eliminar
- ✅ **Transporte**: Leer, escribir, eliminar
- ✅ **Ventas**: Leer, escribir, eliminar
- ✅ **Clientes**: Leer, escribir, eliminar
- ✅ **Pagos**: Leer, escribir, eliminar
- ✅ **Gastos**: Leer, escribir, eliminar
- ✅ **Reportes**: Leer
- ✅ **Usuarios**: Gestionar usuarios de la organización

### 2. **Supervisor**
**Gestión de operaciones**

- ✅ **Cantera**: Leer, escribir
- ✅ **Producción**: Leer, escribir, eliminar
- ✅ **Inventario**: Leer, escribir
- ✅ **Transporte**: Leer, escribir
- ✅ **Ventas**: Leer, escribir
- ✅ **Clientes**: Leer, escribir
- ❌ **Pagos**: Solo leer
- ✅ **Gastos**: Leer, escribir
- ✅ **Reportes**: Leer
- ❌ **Usuarios**: Sin acceso

### 3. **Operador**
**Registro de producción e inventario**

- ✅ **Cantera**: Solo leer
- ✅ **Producción**: Leer, escribir
- ✅ **Inventario**: Leer, escribir
- ✅ **Transporte**: Solo leer
- ✅ **Ventas**: Solo leer
- ✅ **Clientes**: Solo leer
- ❌ **Pagos**: Sin acceso
- ✅ **Gastos**: Solo leer
- ❌ **Reportes**: Sin acceso
- ❌ **Usuarios**: Sin acceso

### 4. **Ventas**
**Gestión de ventas, clientes y transporte**

- ✅ **Cantera**: Solo leer
- ❌ **Producción**: Solo leer
- ✅ **Inventario**: Solo leer
- ✅ **Transporte**: Leer, escribir
- ✅ **Ventas**: Leer, escribir
- ✅ **Clientes**: Leer, escribir
- ✅ **Pagos**: Leer, escribir
- ❌ **Gastos**: Sin acceso
- ✅ **Reportes**: Solo leer
- ❌ **Usuarios**: Sin acceso

### 5. **Contabilidad**
**Acceso a finanzas, pagos y gastos**

- ✅ **Cantera**: Solo leer
- ❌ **Producción**: Solo leer
- ✅ **Inventario**: Solo leer
- ✅ **Transporte**: Solo leer
- ✅ **Ventas**: Solo leer
- ✅ **Clientes**: Solo leer
- ✅ **Pagos**: Leer, escribir
- ✅ **Gastos**: Leer, escribir
- ✅ **Reportes**: Solo leer
- ❌ **Usuarios**: Sin acceso

## 🔒 Implementación de Permisos

Los permisos están implementados en `lib/permissions.ts` y se aplican automáticamente en:

1. **Sidebar** (`components/layout/Sidebar.tsx`): Muestra solo los módulos a los que el usuario tiene acceso
2. **Dashboard Layout** (`app/dashboard/layout.tsx`): Verifica permisos antes de permitir acceso
3. **Módulos individuales**: Verifican permisos antes de permitir acciones (crear, editar, eliminar)

## 📊 Tabla de Permisos

| Módulo | Admin | Supervisor | Operador | Ventas | Contabilidad |
|--------|-------|------------|----------|--------|--------------|
| **Cantera** | ✅ RW/D | ✅ R/W | ✅ R | ✅ R | ✅ R |
| **Producción** | ✅ RW/D | ✅ RW/D | ✅ R/W | ✅ R | ✅ R |
| **Inventario** | ✅ RW/D | ✅ R/W | ✅ R/W | ✅ R | ✅ R |
| **Transporte** | ✅ RW/D | ✅ R/W | ✅ R | ✅ R/W | ✅ R |
| **Ventas** | ✅ RW/D | ✅ R/W | ✅ R | ✅ R/W | ✅ R |
| **Clientes** | ✅ RW/D | ✅ R/W | ✅ R | ✅ R/W | ✅ R |
| **Pagos** | ✅ RW/D | ✅ R | ❌ | ✅ R/W | ✅ R/W |
| **Gastos** | ✅ RW/D | ✅ R/W | ✅ R | ❌ | ✅ R/W |
| **Reportes** | ✅ R | ✅ R | ❌ | ✅ R | ✅ R |
| **Usuarios** | ✅ | ❌ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ R = Leer
- ✅ W = Escribir/Crear
- ✅ D = Eliminar
- ❌ = Sin acceso

## 🚀 Uso en el Código

### Verificar Permiso

```typescript
import { hasPermission } from '@/lib/permissions';

// Verificar si el usuario puede leer un módulo
const canRead = hasPermission(userRole, 'ventas', 'read');

// Verificar si el usuario puede escribir en un módulo
const canWrite = hasPermission(userRole, 'ventas', 'write');

// Verificar si el usuario puede eliminar en un módulo
const canDelete = hasPermission(userRole, 'ventas', 'delete');
```

### Verificar Acceso a Módulo

```typescript
import { canAccessModule } from '@/lib/permissions';

// Verificar si el usuario puede acceder a un módulo
const canAccess = canAccessModule(userRole, 'ventas');
```

## 📝 Notas Importantes

1. **Admin tiene acceso total**: Los administradores pueden hacer todo en el sistema
2. **Usuarios solo para Admin**: Solo los administradores pueden gestionar usuarios
3. **Permisos granulares**: Los permisos se verifican en cada acción (leer, escribir, eliminar)
4. **Límites de plan**: Los límites de plan se aplican independientemente de los permisos de rol

## 🔧 Configuración

Los permisos se pueden modificar en `lib/permissions.ts`. Cualquier cambio afectará a todos los usuarios con ese rol.

