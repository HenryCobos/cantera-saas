import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

async function getProduccion() {
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
    .from('produccion')
    .select(`
      *,
      tipo_agregado:tipos_agregados(*)
    `)
    .eq('cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching produccion:', error);
    return [];
  }

  return data || [];
}

export default async function ProduccionPage() {
  const produccion = await getProduccion();

  return (
    <>
      <Header title="Producción" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Registro de Producción</h2>
          <Link
            href="/dashboard/produccion/nuevo"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Nueva Producción
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
                  Tipo de Agregado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Máquina
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Merma
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {produccion.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros de producción
                  </td>
                </tr>
              ) : (
                produccion.map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(prod.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {prod.tipo_agregado?.nombre || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      {prod.cantidad} {prod.tipo_agregado?.unidad_medida || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{prod.maquina || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {prod.merma || 0}
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

