'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NuevoCamionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canteraId, setCanteraId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    placa: '',
    capacidad_metros: '',
    estado: 'activo' as 'activo' | 'mantenimiento' | 'inactivo',
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
      const { error: insertError } = await supabase.from('camiones').insert({
        cantera_id: canteraId,
        placa: formData.placa.toUpperCase(),
        capacidad_metros: parseFloat(formData.capacidad_metros) || 0,
        estado: formData.estado,
      } as never);

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/transporte');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear el camión');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loadingData) {
    return (
      <>
        <Header title="Nuevo Camión" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nuevo Camión" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/transporte"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Transporte
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Registrar Nuevo Camión</h2>
            <p className="mt-1 text-sm text-gray-500">Agrega un nuevo camión a la flota</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="placa" className="block text-sm font-medium text-gray-700">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="placa"
                  name="placa"
                  required
                  value={formData.placa}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: ABC-123"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label htmlFor="capacidad_metros" className="block text-sm font-medium text-gray-700">
                  Capacidad (m³) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="capacidad_metros"
                  name="capacidad_metros"
                  required
                  step="0.01"
                  min="0"
                  value={formData.capacidad_metros}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: 12.5"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="estado"
                  name="estado"
                  required
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="activo">Activo</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/transporte"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Camión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

