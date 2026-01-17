import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

async function getVentas() {
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
    .from('ventas')
    .select(`
      *,
      cliente:clientes(*)
    `)
    .eq('cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching ventas:', error);
    return [];
  }

  const ventas = data || [];

  // Calcular estado real basado en pagos para cada venta
  const ventasConEstadoCorregido = await Promise.all(
    ventas.map(async (venta: any) => {
      // Obtener pagos de la venta
      const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .eq('venta_id', venta.id);

      const totalPagado = (pagos || []).reduce((sum: number, pago: any) => sum + (pago.monto || 0), 0);
      const saldoPendiente = venta.total - totalPagado;
      
      // Calcular estado basado en pagos (igual que en el detalle)
      const estadoPagoCalculado = saldoPendiente <= 0.01 
        ? 'pagado' 
        : totalPagado > 0 
        ? 'parcial' 
        : 'pendiente';

      return {
        ...venta,
        estado_pago: estadoPagoCalculado, // Usar el estado calculado en lugar del de la BD
      };
    })
  );

  return ventasConEstadoCorregido;
}

function getEstadoPagoColor(estado: string) {
  switch (estado) {
    case 'pagado':
      return 'bg-green-100 text-green-800';
    case 'parcial':
      return 'bg-yellow-100 text-yellow-800';
    case 'pendiente':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function VentasPage() {
  const ventas = await getVentas();

  return (
    <>
      <Header title="Ventas" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Registro de Ventas</h2>
          <Link
            href="/dashboard/ventas/nuevo"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Nueva Venta
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo de Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                ventas.map((venta: any) => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {venta.numero_factura}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(venta.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {venta.cliente?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 capitalize">
                      {venta.tipo_pago}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${venta.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getEstadoPagoColor(
                          venta.estado_pago
                        )}`}
                      >
                        {venta.estado_pago}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/ventas/${venta.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalles
                      </Link>
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

