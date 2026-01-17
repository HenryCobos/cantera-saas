import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import ActionsCell from '@/components/transporte/ActionsCell';

async function getTransporteData() {
  const supabase = await createClient();
  
  // Obtener organization_id usando función helper
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };

  if (!orgId) {
    return { camiones: [], choferes: [], viajes: [] };
  }

  // Obtener cantera de la organización
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1) as { data: Array<{ id: string }> | null };

  const canteraId = canteras?.[0]?.id;

  if (!canteraId) {
    return { camiones: [], choferes: [], viajes: [] };
  }

  const [camionesResult, choferesResult, viajesResult] = await Promise.all([
    supabase.from('camiones').select('*').eq('cantera_id', canteraId).eq('estado', 'activo'),
    supabase.from('choferes').select('*').eq('cantera_id', canteraId).eq('estado', 'activo'),
    supabase
      .from('viajes')
      .select(`
        *,
        camion:camiones(*),
        chofer:choferes(*)
      `)
      .eq('cantera_id', canteraId)
      .order('fecha', { ascending: false })
      .limit(20),
  ]);

  return {
    camiones: camionesResult.data || [],
    choferes: choferesResult.data || [],
    viajes: viajesResult.data || [],
  };
}

export default async function TransportePage() {
  const { camiones, choferes, viajes } = await getTransporteData();

  return (
    <>
      <Header title="Transporte" />
      <div className="p-6 space-y-6">
        {/* Resumen */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Camiones Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{camiones.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Choferes Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{choferes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Viajes Recientes</p>
                <p className="text-2xl font-semibold text-gray-900">{viajes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Camiones */}
        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Camiones</h3>
            <Link
              href="/dashboard/transporte/camiones/nuevo"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Camión
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Placa
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Capacidad
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
                {camiones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay camiones registrados
                    </td>
                  </tr>
                ) : (
                  camiones.map((camion: any) => (
                    <tr key={camion.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {camion.placa}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                        {camion.capacidad_metros} m³
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 capitalize">
                          {camion.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <ActionsCell type="camion" id={camion.id} identifier={camion.placa} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Choferes */}
        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Choferes</h3>
            <Link
              href="/dashboard/transporte/choferes/nuevo"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Chofer
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Licencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teléfono
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
                {choferes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay choferes registrados
                    </td>
                  </tr>
                ) : (
                  choferes.map((chofer: any) => (
                    <tr key={chofer.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {chofer.nombre}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {chofer.licencia || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {chofer.telefono || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 capitalize">
                          {chofer.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <ActionsCell type="chofer" id={chofer.id} identifier={chofer.nombre} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Viajes Recientes */}
        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Viajes Recientes</h3>
            <Link
              href="/dashboard/transporte/viajes/nuevo"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Viaje
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Camión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Chofer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {viajes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay viajes registrados
                    </td>
                  </tr>
                ) : (
                  viajes.map((viaje: any) => (
                    <tr key={viaje.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {new Date(viaje.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {viaje.camion?.placa || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {viaje.chofer?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{viaje.destino}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                        {viaje.cantidad_metros} m³
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <ActionsCell 
                          type="viaje" 
                          id={viaje.id} 
                          identifier={`Viaje del ${new Date(viaje.fecha).toLocaleDateString('es-ES')}`} 
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

