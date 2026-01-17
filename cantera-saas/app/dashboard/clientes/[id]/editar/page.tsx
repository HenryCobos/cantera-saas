'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'persona' as 'constructora' | 'ferreteria' | 'persona',
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
    limite_credito: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  useEffect(() => {
    loadClienteData();
  }, [id]);

  const loadClienteData = async () => {
    if (!id) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const clienteData = (data as any);
      if (!clienteData) {
        setError('Cliente no encontrado');
        setLoadingData(false);
        return;
      }

      setFormData({
        tipo: (clienteData.tipo as 'constructora' | 'ferreteria' | 'persona') || 'persona',
        nombre: clienteData.nombre || '',
        documento: clienteData.documento || '',
        telefono: clienteData.telefono || '',
        email: clienteData.email || '',
        direccion: clienteData.direccion || '',
        limite_credito: clienteData.limite_credito?.toString() || '',
        estado: (clienteData.estado as 'activo' | 'inactivo') || 'activo',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del cliente');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        tipo: formData.tipo,
        nombre: formData.nombre,
        documento: formData.documento || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        direccion: formData.direccion || null,
        limite_credito: parseFloat(formData.limite_credito) || 0,
        estado: formData.estado,
      };
      
      const { error: updateError } = await (supabase
        .from('clientes')
        .update(updateData as never)
        .eq('id', id));

      if (updateError) {
        throw updateError;
      }

      router.push('/dashboard/clientes');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el cliente');
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
        <Header title="Editar Cliente" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Cliente" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Editar Cliente</h2>
            <p className="mt-1 text-sm text-gray-500">Modifica la información del cliente</p>
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
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                    Tipo de Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    required
                    value={formData.tipo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="persona">Persona</option>
                    <option value="constructora">Constructora</option>
                    <option value="ferreteria">Ferretería</option>
                  </select>
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
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre o Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Constructora ABC S.A."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
                    Documento / RUC
                  </label>
                  <input
                    type="text"
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: 12345678901"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: +1234567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="cliente@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  rows={3}
                  value={formData.direccion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label htmlFor="limite_credito" className="block text-sm font-medium text-gray-700">
                  Límite de Crédito
                </label>
                <input
                  type="number"
                  id="limite_credito"
                  name="limite_credito"
                  step="0.01"
                  min="0"
                  value={formData.limite_credito}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">Monto máximo de crédito permitido para este cliente</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/clientes"
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

