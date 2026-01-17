import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ReportesClient from './ReportesClient';

async function getReportesData() {
  const supabase = await createClient();
  
  // Obtener organization_id
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };
  
  if (!orgId) {
    return {
      canteraId: null,
      totalProduccion: 0,
      totalVentas: 0,
      totalGastos: 0,
      totalPagos: 0,
      utilidad: 0,
    };
  }
  
  // Obtener cantera_id
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1) as { data: Array<{ id: string }> | null };
  const canteraId = canteras && canteras.length > 0 ? canteras[0].id : null;

  if (!canteraId) {
    return {
      canteraId: null,
      totalProduccion: 0,
      totalVentas: 0,
      totalGastos: 0,
      totalPagos: 0,
      utilidad: 0,
    };
  }

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  // Producción del mes
  const { data: produccion } = await supabase
    .from('produccion')
    .select('cantidad')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const totalProduccion = produccion?.reduce((sum: number, p: { cantidad: number }) => sum + (p.cantidad || 0), 0) || 0;

  // Ventas del mes
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const totalVentas = ventas?.reduce((sum: number, v: { total: number }) => sum + (v.total || 0), 0) || 0;

  // Gastos del mes
  const { data: gastos } = await supabase
    .from('gastos')
    .select('monto')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const totalGastos = gastos?.reduce((sum: number, g: { monto: number }) => sum + (g.monto || 0), 0) || 0;

  // Pagos del mes
  const { data: pagos } = await supabase
    .from('pagos')
    .select('monto, venta:ventas(cantera_id)')
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const totalPagos =
    pagos?.filter((p: any) => p.venta?.cantera_id === canteraId).reduce((sum: number, p: { monto: number }) => sum + (p.monto || 0), 0) || 0;

  return {
    canteraId,
    totalProduccion,
    totalVentas,
    totalGastos,
    totalPagos,
    utilidad: totalVentas - totalGastos,
  };
}

export default async function ReportesPage() {
  const { canteraId, totalProduccion, totalVentas, totalGastos, totalPagos, utilidad } = await getReportesData();

  const cards = [
    {
      name: 'Producción del Mes',
      value: totalProduccion.toFixed(2),
      unit: 'm³',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Ventas del Mes',
      value: totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
      unit: '$',
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Gastos del Mes',
      value: totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 }),
      unit: '$',
      icon: ChartBarIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Utilidad Neta',
      value: (utilidad || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }),
      unit: '$',
      icon: ChartBarIcon,
      color: (utilidad || 0) >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
  ];

  return (
    <>
      <Header title="Reportes y Análisis" />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reporte Mensual</h2>
          <p className="mt-1 text-sm text-gray-500">
            Resumen del mes actual: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.name} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`${card.color} rounded-md p-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {card.unit} {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Indicadores Clave</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Margen de Utilidad</span>
                  <span className="font-semibold text-gray-900">
                    {totalVentas > 0 ? (((utilidad || 0) / totalVentas) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pagos vs Ventas</span>
                  <span className="font-semibold text-gray-900">
                    {totalVentas > 0 ? ((totalPagos / totalVentas) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {canteraId && (
          <div className="mt-8">
            <ReportesClient
              canteraId={canteraId}
              initialData={{
                totalProduccion,
                totalVentas,
                totalGastos,
                totalPagos,
                utilidad,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

