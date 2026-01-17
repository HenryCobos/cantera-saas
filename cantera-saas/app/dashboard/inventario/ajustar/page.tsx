'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Inventario, TipoAgregado } from '@/types';

export default function AjustarInventarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventarioItems, setInventarioItems] = useState<(Inventario & { tipo_agregado: TipoAgregado })[]>([]);
  const [selectedInventarioId, setSelectedInventarioId] = useState<string>('');
  const [formData, setFormData] = useState({
    inventario_id: '',
    tipo: 'ajuste' as 'entrada' | 'salida' | 'ajuste',
    cantidad: '',
    motivo: '',
  });

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      // Obtener organization_id del usuario
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

      const canteraId = canteras?.[0]?.id;
      if (!canteraId) {
        setError('No hay cantera configurada.');
        setLoadingData(false);
        return;
      }

      // Obtener inventario con tipos de agregados
      const { data: inventario, error: inventarioError } = await supabase
        .from('inventario')
        .select(`
          *,
          tipo_agregado:tipos_agregados(*)
        `)
        .eq('cantera_id', canteraId)
        .order('cantidad', { ascending: true });

      if (inventarioError) {
        throw inventarioError;
      }

      setInventarioItems(inventario || []);
      setLoadingData(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar inventario');
      setLoadingData(false);
    }
  };

  const handleInventarioChange = (inventarioId: string) => {
    setSelectedInventarioId(inventarioId);
    setFormData({ ...formData, inventario_id: inventarioId });
    
    // Obtener cantidad actual para referencia
    const item = inventarioItems.find(i => i.id === inventarioId);
    if (item) {
      setFormData(prev => ({ ...prev, cantidad: item.cantidad.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const inventarioItem = inventarioItems.find(i => i.id === formData.inventario_id);
      if (!inventarioItem) {
        throw new Error('Item de inventario no encontrado');
      }

      const cantidadAjuste = parseFloat(formData.cantidad) || 0;
      const cantidadActual = inventarioItem.cantidad;
      let cantidadMovimiento = 0;
      let tipoMovimiento: 'entrada' | 'salida' | 'ajuste' = formData.tipo;

      if (formData.tipo === 'ajuste') {
        cantidadMovimiento = cantidadAjuste - cantidadActual;
        tipoMovimiento = cantidadMovimiento >= 0 ? 'entrada' : 'salida';
        cantidadMovimiento = Math.abs(cantidadMovimiento);
      } else {
        cantidadMovimiento = cantidadAjuste;
      }

      // Crear movimiento de inventario
      const { error: movimientoError } = await supabase
        .from('movimientos_inventario')
        .insert([
          {
            inventario_id: formData.inventario_id,
            tipo: tipoMovimiento,
            cantidad: cantidadMovimiento,
            motivo: formData.motivo || `Ajuste manual - ${formData.tipo}`,
            referencia_tipo: 'ajuste_manual',
            created_by: user.id,
          },
        ] as any);

      if (movimientoError) {
        throw movimientoError;
      }

      // Actualizar inventario
      const nuevaCantidad = formData.tipo === 'ajuste' 
        ? cantidadAjuste 
        : formData.tipo === 'entrada' 
          ? cantidadActual + cantidadAjuste 
          : cantidadActual - cantidadAjuste;

      const { error: updateError } = await (supabase
        .from('inventario')
        .update({ cantidad: nuevaCantidad } as never)
        .eq('id', formData.inventario_id));

      if (updateError) {
        throw updateError;
      }

      router.push('/dashboard/inventario');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al ajustar inventario');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedItem = inventarioItems.find(i => i.id === selectedInventarioId);

  if (loadingData) {
    return (
      <>
        <Header title="Ajustar Inventario" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Ajustar Inventario" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/inventario"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Inventario
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Ajustar Inventario</h2>
            <p className="mt-1 text-sm text-gray-500">Realiza ajustes manuales al inventario</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="inventario_id" className="block text-sm font-medium text-gray-700">
                  Tipo de Agregado <span className="text-red-500">*</span>
                </label>
                <select
                  id="inventario_id"
                  name="inventario_id"
                  required
                  value={formData.inventario_id}
                  onChange={(e) => handleInventarioChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Selecciona un tipo de agregado</option>
                  {inventarioItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tipo_agregado?.nombre || 'Desconocido'} - Stock actual: {item.cantidad} {item.tipo_agregado?.unidad_medida || ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Stock actual:</strong> {selectedItem.cantidad} {selectedItem.tipo_agregado?.unidad_medida || ''}
                    {selectedItem.cantidad_minima > 0 && (
                      <span className="ml-2">
                        | <strong>Mínimo:</strong> {selectedItem.cantidad_minima} {selectedItem.tipo_agregado?.unidad_medida || ''}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Ajuste <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={formData.tipo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ajuste">Ajuste a cantidad específica</option>
                  <option value="entrada">Entrada (agregar cantidad)</option>
                  <option value="salida">Salida (restar cantidad)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.tipo === 'ajuste' && 'Establece la cantidad total que debe haber en stock'}
                  {formData.tipo === 'entrada' && 'Agrega la cantidad especificada al stock actual'}
                  {formData.tipo === 'salida' && 'Resta la cantidad especificada del stock actual'}
                </p>
              </div>

              <div>
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                  {formData.tipo === 'ajuste' ? 'Nueva Cantidad' : 'Cantidad'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  required
                  step="0.01"
                  min="0"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
                {selectedItem && formData.tipo !== 'ajuste' && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.tipo === 'entrada' 
                      ? `Cantidad final será: ${selectedItem.cantidad + (parseFloat(formData.cantidad) || 0)} ${selectedItem.tipo_agregado?.unidad_medida || ''}`
                      : `Cantidad final será: ${Math.max(0, selectedItem.cantidad - (parseFloat(formData.cantidad) || 0))} ${selectedItem.tipo_agregado?.unidad_medida || ''}`
                    }
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
                  Motivo del Ajuste <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  required
                  rows={3}
                  value={formData.motivo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Corrección de inventario físico, Pérdida por rotura, etc."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/inventario"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Aplicar Ajuste'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

