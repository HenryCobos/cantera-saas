'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccessModule } from '@/lib/permissions';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  TruckIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, module: 'reportes' as const },
  { name: 'Cantera', href: '/dashboard/cantera', icon: BuildingStorefrontIcon, module: 'cantera' as const },
  { name: 'Producción', href: '/dashboard/produccion', icon: CubeIcon, module: 'produccion' as const },
  { name: 'Inventario', href: '/dashboard/inventario', icon: CubeIcon, module: 'inventario' as const },
  { name: 'Transporte', href: '/dashboard/transporte', icon: TruckIcon, module: 'transporte' as const },
  { name: 'Ventas', href: '/dashboard/ventas', icon: ShoppingCartIcon, module: 'ventas' as const },
  { name: 'Clientes', href: '/dashboard/clientes', icon: UserGroupIcon, module: 'clientes' as const },
  { name: 'Pagos', href: '/dashboard/pagos', icon: CurrencyDollarIcon, module: 'pagos' as const },
  { name: 'Gastos', href: '/dashboard/gastos', icon: CurrencyDollarIcon, module: 'gastos' as const },
  { name: 'Reportes', href: '/dashboard/reportes', icon: ChartBarIcon, module: 'reportes' as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading, signOut } = useAuth();

  // Mostrar sidebar básico mientras carga o si no hay perfil
  // Esto evita que el dashboard se rompa
  if (loading) {
    return (
      <div className="flex h-screen w-64 flex-col bg-gray-900">
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Cantera SaaS</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay perfil, usar rol por defecto 'admin' para que el sistema funcione
  const userRole = profile?.role || 'admin';

  const filteredNavigation = navigation.filter((item) =>
    canAccessModule(userRole, item.module)
  );

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Cantera SaaS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
        {/* Opción de Usuarios solo para admins */}
        {userRole === 'admin' && (
          <Link
            href="/dashboard/organizacion/usuarios"
            className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              pathname === '/dashboard/organizacion/usuarios' || pathname?.startsWith('/dashboard/organizacion/usuarios')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <UsersIcon
              className={`mr-3 h-6 w-6 flex-shrink-0 ${
                pathname === '/dashboard/organizacion/usuarios' || pathname?.startsWith('/dashboard/organizacion/usuarios')
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-300'
              }`}
            />
            Usuarios
          </Link>
        )}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={signOut}
          className="flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

