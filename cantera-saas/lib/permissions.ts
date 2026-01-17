import { UserRole } from '@/types';

// Permisos por módulo y rol
export const PERMISSIONS = {
  cantera: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read'],
    ventas: ['read'],
    contabilidad: ['read'],
  },
  produccion: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write', 'delete'],
    operador: ['read', 'write'],
    ventas: ['read'],
    contabilidad: ['read'],
  },
  inventario: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read', 'write'],
    ventas: ['read'],
    contabilidad: ['read'],
  },
  transporte: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read'],
    ventas: ['read', 'write'],
    contabilidad: ['read'],
  },
  ventas: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read'],
    ventas: ['read', 'write'],
    contabilidad: ['read'],
  },
  clientes: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read'],
    ventas: ['read', 'write'],
    contabilidad: ['read'],
  },
  pagos: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read'],
    operador: [],
    ventas: ['read', 'write'],
    contabilidad: ['read', 'write'],
  },
  gastos: {
    admin: ['read', 'write', 'delete'],
    supervisor: ['read', 'write'],
    operador: ['read'],
    ventas: [],
    contabilidad: ['read', 'write'],
  },
  reportes: {
    admin: ['read'],
    supervisor: ['read'],
    operador: [],
    ventas: ['read'],
    contabilidad: ['read'],
  },
} as const;

export function hasPermission(
  role: UserRole,
  module: keyof typeof PERMISSIONS,
  action: 'read' | 'write' | 'delete'
): boolean {
  const permissions = PERMISSIONS[module][role] as readonly ('read' | 'write' | 'delete')[] | undefined;
  return permissions?.includes(action) ?? false;
}

export function canAccessModule(role: UserRole, module: keyof typeof PERMISSIONS): boolean {
  return hasPermission(role, module, 'read');
}

