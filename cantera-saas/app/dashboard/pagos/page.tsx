import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ActionsCell from '@/components/transporte/ActionsCell';

async function getPagos() {
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
    .from('pagos')
    .select(`
      *,
      venta:ventas!inner(
        id,
        numero_factura,
        cantera_id,
        cliente:clientes(nombre)
      )
    `)
    .eq('venta.cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching pagos:', error);
    return [];
  }

  return data || [];
}

function getMetodoPagoColor(metodo: string) {
  switch (metodo) {
    case 'efectivo':
      return 'bg-green-100 text-green-800';
    case 'transferencia':
      return 'bg-blue-100 text-blue-800';
    case 'cheque':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function PagosPage() {
  const pagos = await getPagos();

  const totalPagos = pagos.reduce((sum, pago: any) => sum + (pago.monto || 0), 0);

  return (
    <>
      <Header title="Pagos y Cobranzas" />
      <div className="p-6">
        <div className="mb-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Resumen</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ${totalPagos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-sm text-gray-500">Total en pagos registrados</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos</h2>
          <Link
            href="/dashboard/pagos/nuevo"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Registrar Pago
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
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Referencia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                pagos.map((pago: any) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(pago.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {pago.venta?.numero_factura || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {pago.venta?.cliente?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${pago.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getMetodoPagoColor(
                          pago.metodo_pago
                        )}`}
                      >
                        {pago.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{pago.referencia || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <ActionsCell 
                        type="pago" 
                        id={pago.id} 
                        identifier={`${pago.venta?.numero_factura || ''} - $${pago.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`} 
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

