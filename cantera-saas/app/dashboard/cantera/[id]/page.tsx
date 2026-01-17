import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { notFound } from 'next/navigation';
import AgregarTiposComunesButton from './AgregarTiposComunesButton';

async function getCantera(id: string) {
  const supabase = await createClient();
  
  // Obtener organization_id del usuario primero
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single() as { data: { organization_id: string } | null };

  if (!profile?.organization_id) {
    return null;
  }

  // Buscar cantera que pertenezca a la organización del usuario
  const { data, error } = await supabase
    .from('canteras')
    .select('*')
    .eq('id', id)
    .eq('organization_id', profile.organization_id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
  } | null;
}

async function getTiposAgregados(canteraId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tipos_agregados')
    .select('*')
    .eq('cantera_id', canteraId)
    .order('nombre', { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}

export default async function CanteraDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cantera = await getCantera(id);
  const tiposAgregados = cantera ? await getTiposAgregados(id) : [];

  if (!cantera) {
    notFound();
  }

  return (
    <>
      <Header title={cantera.name} />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/cantera"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Cantera
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información de la Cantera */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Información General</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cantera.name}</dd>
                </div>
                {cantera.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cantera.address}</dd>
                  </div>
                )}
                {cantera.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cantera.phone}</dd>
                  </div>
                )}
                {cantera.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cantera.email}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Tipos de Agregados */}
          <div className="rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Tipos de Agregados</h2>
              <div className="flex gap-2">
                {tiposAgregados.length === 0 && (
                  <AgregarTiposComunesButton canteraId={cantera.id} />
                )}
                <Link
                  href={`/dashboard/cantera/${cantera.id}/tipos-agregados/nuevo`}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Nuevo Tipo
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {tiposAgregados.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  No hay tipos de agregados registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {tiposAgregados.map((tipo: any) => (
                    <div
                      key={tipo.id}
                      className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tipo.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {tipo.unidad_medida} - ${tipo.precio_base.toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

