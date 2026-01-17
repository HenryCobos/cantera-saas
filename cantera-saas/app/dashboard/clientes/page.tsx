import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ActionsCell from '@/components/transporte/ActionsCell';
import { Database } from '@/lib/supabase/database.types';

async function getClientes() {
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
    .limit(1) as { data: Array<{ id: string }> | null };

  const canteraId = canteras?.[0]?.id;

  if (!canteraId) {
    return [];
  }

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('cantera_id', canteraId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching clientes:', error);
    return [];
  }

  return data || [];
}

function getTipoClienteColor(tipo: string) {
  switch (tipo) {
    case 'constructora':
      return 'bg-blue-100 text-blue-800';
    case 'ferreteria':
      return 'bg-green-100 text-green-800';
    case 'persona':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <>
      <Header title="Clientes" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Base de Clientes</h2>
          <Link
            href="/dashboard/clientes/nuevo"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Nuevo Cliente
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Límite Crédito
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
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente: any) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {cliente.nombre}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getTipoClienteColor(
                          cliente.tipo
                        )}`}
                      >
                        {cliente.tipo}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {cliente.documento || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {cliente.telefono || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      ${cliente.limite_credito?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                          cliente.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <ActionsCell type="cliente" id={cliente.id} identifier={cliente.nombre} />
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

