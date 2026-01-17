import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { 
  PlusIcon, 
  CubeIcon, 
  RectangleStackIcon, 
  Squares2X2Icon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

async function getInventario() {
  const supabase = await createClient();
  
  // Obtener organization_id usando función helper
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };

  if (!orgId) {
    return [];
  }

  // Obtener cantera de la organización
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1);

  const canteraId = (canteras?.[0] as { id: string } | undefined)?.id;
  if (!canteraId) {
    return [];
  }

  const { data, error } = await supabase
    .from('inventario')
    .select(`
      *,
      tipo_agregado:tipos_agregados(*)
    `)
    .eq('cantera_id', canteraId)
    .order('cantidad', { ascending: true });

  if (error) {
    console.error('Error fetching inventario:', error);
    return [];
  }

  return data || [];
}

// Función para obtener icono y colores según el tipo de agregado
function getAgregadoStyle(nombre: string) {
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('grava')) {
    return {
      icon: CubeIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100/50',
      textColor: 'text-purple-900',
      borderClass: 'border-purple-200',
      iconBg: 'bg-purple-500',
      accentColor: 'text-purple-600',
    };
  } else if (nombreLower.includes('ripio') || nombreLower.includes('piedra')) {
    return {
      icon: RectangleStackIcon,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100/50',
      textColor: 'text-amber-900',
      borderClass: 'border-amber-200',
      iconBg: 'bg-amber-500',
      accentColor: 'text-amber-600',
    };
  } else if (nombreLower.includes('arena') || nombreLower.includes('sand')) {
    return {
      icon: Squares2X2Icon,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-100/50',
      textColor: 'text-cyan-900',
      borderClass: 'border-cyan-200',
      iconBg: 'bg-cyan-500',
      accentColor: 'text-cyan-600',
    };
  } else {
    // Estilo por defecto
    return {
      icon: CubeIcon,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100/50',
      textColor: 'text-gray-900',
      borderClass: 'border-gray-200',
      iconBg: 'bg-gray-500',
      accentColor: 'text-gray-600',
    };
  }
}

export default async function InventarioPage() {
  const inventario = await getInventario();

  return (
    <>
      <Header title="Inventario" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Actual</h2>
            <p className="mt-1 text-sm text-gray-500">
              Estado actual del inventario por tipo de agregado
            </p>
          </div>
          <Link
            href="/dashboard/inventario/ajustar"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Ajustar Inventario
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inventario.length === 0 ? (
            <div className="col-span-full rounded-lg bg-white p-6 shadow">
              <p className="text-center text-sm text-gray-500">
                No hay registros de inventario
              </p>
            </div>
          ) : (
            inventario.map((inv: any) => {
              const isLowStock = inv.cantidad < inv.cantidad_minima;
              const agregadoNombre = inv.tipo_agregado?.nombre || 'Desconocido';
              const style = getAgregadoStyle(agregadoNombre);
              const IconComponent = style.icon;
              
              return (
                <div
                  key={inv.id}
                  className={`group relative overflow-hidden rounded-xl border-2 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isLowStock 
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100/30' 
                      : `${style.borderClass} bg-gradient-to-br ${style.bgGradient}`
                  }`}
                >
                  {/* Decoración de fondo */}
                  <div className={`absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br ${style.gradient} opacity-10 blur-2xl`}></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${style.iconBg} shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${style.textColor}`}>
                            {agregadoNombre}
                          </h3>
                          <span className="text-xs text-gray-500">Tipo de agregado</span>
                        </div>
                      </div>
                      {isLowStock && (
                        <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 border border-red-200">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-semibold text-red-800">
                            Stock Bajo
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-gray-600">Stock Actual</span>
                        <span className={`text-3xl font-extrabold ${style.textColor} tracking-tight`}>
                          {parseFloat(inv.cantidad).toLocaleString('es-ES', { 
                            minimumFractionDigits: 1, 
                            maximumFractionDigits: 1 
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${style.accentColor}`}>
                          {inv.tipo_agregado?.unidad_medida || ''}
                        </span>
                      </div>
                      
                      {inv.cantidad_minima > 0 && (
                        <div className="pt-3 border-t border-gray-200/50">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock Mínimo</span>
                            <span className={`text-base font-semibold ${style.accentColor}`}>
                              {parseFloat(inv.cantidad_minima).toLocaleString('es-ES', { 
                                minimumFractionDigits: 1, 
                                maximumFractionDigits: 1 
                              })} {inv.tipo_agregado?.unidad_medida || ''}
                            </span>
                          </div>
                          {/* Barra de progreso visual */}
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLowStock 
                                  ? 'bg-gradient-to-r from-red-400 to-red-500' 
                                  : `bg-gradient-to-r ${style.gradient}`
                              }`}
                              style={{ 
                                width: `${Math.min(100, (inv.cantidad / inv.cantidad_minima) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 rounded-lg bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Movimientos Recientes</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Los movimientos de inventario se registran automáticamente cuando se registra producción o ventas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

