'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NuevoTipoAgregadoPage() {
  const router = useRouter();
  const params = useParams();
  const canteraId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    unidad_medida: 'm3',
    precio_base: '',
  });

  const unidadesMedida = ['m3', 'ton', 'kg', 'unidad'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase.from('tipos_agregados') as any).insert([
        {
          cantera_id: canteraId,
          nombre: formData.nombre,
          unidad_medida: formData.unidad_medida,
          precio_base: parseFloat(formData.precio_base) || 0,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      router.push(`/dashboard/cantera/${canteraId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear el tipo de agregado');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Header title="Nuevo Tipo de Agregado" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href={`/dashboard/cantera/${canteraId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Cantera
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Crear Tipo de Agregado</h2>
            <p className="mt-1 text-sm text-gray-500">Define un nuevo tipo de agregado para esta cantera</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Agregado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Arena, Grava, Piedra Triturada"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="unidad_medida" className="block text-sm font-medium text-gray-700">
                    Unidad de Medida <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unidad_medida"
                    name="unidad_medida"
                    required
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {unidadesMedida.map((unidad) => (
                      <option key={unidad} value={unidad}>
                        {unidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="precio_base" className="block text-sm font-medium text-gray-700">
                    Precio Base <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="precio_base"
                    name="precio_base"
                    required
                    step="0.01"
                    min="0"
                    value={formData.precio_base}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href={`/dashboard/cantera/${canteraId}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Tipo de Agregado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

