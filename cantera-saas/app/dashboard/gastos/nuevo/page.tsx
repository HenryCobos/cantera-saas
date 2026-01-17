'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NuevoGastoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canteraId, setCanteraId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoria: 'otro' as 'combustible' | 'mantenimiento' | 'sueldos' | 'repuestos' | 'otro',
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    referencia: '',
  });

  useEffect(() => {
    loadCanteraId();
  }, []);

  const loadCanteraId = async () => {
    try {
      // Obtener organization_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        setLoadingData(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single() as { data: { organization_id: string } | null };

      if (!profile?.organization_id) {
        setError('No se pudo obtener la organización.');
        setLoadingData(false);
        return;
      }

      // Obtener cantera de la organización
      const { data: canteras } = await supabase
        .from('canteras')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .limit(1) as { data: Array<{ id: string }> | null };

      const currentCanteraId = canteras?.[0]?.id;

      if (!currentCanteraId) {
        setError('No hay cantera configurada. Por favor crea una cantera primero.');
        setLoadingData(false);
        return;
      }

      setCanteraId(currentCanteraId);
      setLoadingData(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canteraId) {
      setError('No hay cantera configurada');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const gastoInsert = {
        cantera_id: canteraId,
        categoria: formData.categoria,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto) || 0,
        fecha: formData.fecha,
        proveedor: formData.proveedor || null,
        referencia: formData.referencia || null,
        created_by: user.id,
      } as const;

      const { error: insertError } = await supabase.from('gastos').insert(gastoInsert as any);

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/gastos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el gasto');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loadingData) {
    return (
      <>
        <Header title="Nuevo Gasto" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nuevo Gasto" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/gastos"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Gastos
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Registrar Nuevo Gasto</h2>
            <p className="mt-1 text-sm text-gray-500">Registra un gasto operativo</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    required
                    value={formData.fecha}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    required
                    value={formData.categoria}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="combustible">Combustible</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="sueldos">Sueldos</option>
                    <option value="repuestos">Repuestos</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                  Concepto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="concepto"
                  name="concepto"
                  required
                  value={formData.concepto}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Combustible para excavadora"
                />
              </div>

              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                  Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  required
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    id="proveedor"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: Gasolinera ABC"
                  />
                </div>

                <div>
                  <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
                    Referencia / Factura #
                  </label>
                  <input
                    type="text"
                    id="referencia"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: FAC-12345"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/gastos"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Registrar Gasto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

