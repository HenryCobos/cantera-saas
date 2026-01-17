import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, UserGroupIcon, CogIcon, BeakerIcon } from '@heroicons/react/24/outline';
import ActionsCell from '@/components/transporte/ActionsCell';

async function getGastos() {
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
    .from('gastos')
    .select('*')
    .eq('cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching gastos:', error);
    return [];
  }

  return data || [];
}

function getCategoriaColor(categoria: string) {
  switch (categoria) {
    case 'combustible':
      return 'bg-red-100 text-red-800';
    case 'mantenimiento':
      return 'bg-blue-100 text-blue-800';
    case 'sueldos':
      return 'bg-green-100 text-green-800';
    case 'repuestos':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getCategoriaStyle(categoria: string) {
  switch (categoria) {
    case 'combustible':
      return {
        icon: BeakerIcon,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100/50',
        textColor: 'text-red-900',
        borderColor: 'border-red-200',
        iconBg: 'bg-red-500',
      };
    case 'mantenimiento':
      return {
        icon: WrenchScrewdriverIcon,
        gradient: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-50 to-blue-100/50',
        textColor: 'text-blue-900',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-500',
      };
    case 'sueldos':
      return {
        icon: UserGroupIcon,
        gradient: 'from-green-500 to-green-600',
        bgGradient: 'from-green-50 to-green-100/50',
        textColor: 'text-green-900',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-500',
      };
    case 'repuestos':
      return {
        icon: CogIcon,
        gradient: 'from-yellow-500 to-orange-600',
        bgGradient: 'from-yellow-50 to-orange-100/50',
        textColor: 'text-yellow-900',
        borderColor: 'border-yellow-200',
        iconBg: 'bg-yellow-500',
      };
    default:
      return {
        icon: CurrencyDollarIcon,
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-50 to-gray-100/50',
        textColor: 'text-gray-900',
        borderColor: 'border-gray-200',
        iconBg: 'bg-gray-500',
      };
  }
}

export default async function GastosPage() {
  const gastos = await getGastos();

  const totalGastos = gastos.reduce((sum, gasto: any) => sum + (gasto.monto || 0), 0);
  const gastosPorCategoria = gastos.reduce((acc: any, gasto: any) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
    return acc;
  }, {});

  return (
    <>
      <Header title="Gastos Operativos" />
      <div className="p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Tarjeta Total */}
          <div className="group relative overflow-hidden rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600">Total Gastos</h3>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  ${totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-md">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Tarjetas por Categoría */}
          {Object.entries(gastosPorCategoria).map(([categoria, monto]: [string, any]) => {
            const style = getCategoriaStyle(categoria);
            const Icon = style.icon;
            return (
              <div
                key={categoria}
                className={`group relative overflow-hidden rounded-xl border-2 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${style.borderColor} bg-gradient-to-br ${style.bgGradient}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${style.textColor} capitalize`}>{categoria}</h3>
                    <p className={`mt-3 text-3xl font-bold ${style.textColor}`}>
                      ${monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Registro de Gastos</h2>
          <Link
            href="/dashboard/gastos/nuevo"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Nuevo Gasto
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Concepto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay gastos registrados
                  </td>
                </tr>
              ) : (
                gastos.map((gasto: any) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getCategoriaColor(
                          gasto.categoria
                        )}`}
                      >
                        {gasto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{gasto.concepto}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${gasto.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{gasto.proveedor || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <ActionsCell 
                        type="gasto" 
                        id={gasto.id} 
                        identifier={`${gasto.concepto} - $${gasto.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`} 
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

