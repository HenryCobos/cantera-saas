'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditarCamionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    placa: '',
    capacidad_metros: '',
    estado: 'activo' as 'activo' | 'mantenimiento' | 'inactivo',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('camiones')
        .select('*')
        .eq('id', id)
        .single() as { data: { placa: string; capacidad_metros: number | null; estado: string } | null; error: any };

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const estadoValido = (data.estado === 'activo' || data.estado === 'mantenimiento' || data.estado === 'inactivo') 
          ? data.estado 
          : 'activo' as 'activo' | 'mantenimiento' | 'inactivo';
        
        setFormData({
          placa: data.placa || '',
          capacidad_metros: data.capacidad_metros?.toString() || '',
          estado: estadoValido,
        });
      }

      setLoadingData(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del camión');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await (supabase
        .from('camiones')
        .update({
          placa: formData.placa.toUpperCase(),
          capacidad_metros: parseFloat(formData.capacidad_metros) || 0,
          estado: formData.estado,
        } as never)
        .eq('id', id));

      if (updateError) {
        throw updateError;
      }

      router.push('/dashboard/transporte');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el camión');
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
        <Header title="Editar Camión" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Camión" />
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
            <h2 className="text-lg font-medium text-gray-900">Editar Camión</h2>
            <p className="mt-1 text-sm text-gray-500">Modifica la información del camión</p>
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
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
