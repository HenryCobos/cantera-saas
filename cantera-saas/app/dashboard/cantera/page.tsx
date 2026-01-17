import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Database } from '@/lib/supabase/database.types';

type Cantera = Database['public']['Tables']['canteras']['Row'];

async function getCanteras(): Promise<Cantera[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('canteras')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching canteras (puede ser RLS):', error.message || error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Error inesperado al obtener canteras:', err);
    return [];
  }
}

export default async function CanteraPage() {
  const canteras = await getCanteras();

  return (
    <>
      <Header title="Gestión de Cantera" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Canteras</h2>
          <Link
            href="/dashboard/cantera/nueva"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Nueva Cantera
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
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {canteras.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay canteras registradas
                  </td>
                </tr>
              ) : (
                canteras.map((cantera) => (
                  <tr key={cantera.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {cantera.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cantera.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cantera.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cantera.email || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/cantera/${cantera.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
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

