'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TipoAgregado } from '@/types';
import PlanLimitAlert from '@/components/PlanLimitAlert';

export default function NuevaProduccionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiposAgregados, setTiposAgregados] = useState<TipoAgregado[]>([]);
  const [canteraId, setCanteraId] = useState<string | null>(null);
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [formData, setFormData] = useState({
    tipo_agregado_id: '',
    fecha: new Date().toISOString().split('T')[0],
    cantidad: '',
    maquina: '',
    operador_id: '',
    merma: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Obtener organization_id del usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        setLoadingData(false);
        return;
      }

      // Obtener organization_id del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single() as { data: { organization_id: string } | null };

      if (!profile?.organization_id) {
        setError('No se pudo obtener la organización. Asegúrate de que el script multi_tenant_schema.sql se haya ejecutado.');
        setLoadingData(false);
        return;
      }

      // Obtener primera cantera de la organización
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

      // Obtener tipos de agregados
      const { data: tipos, error: tiposError } = await supabase
        .from('tipos_agregados')
        .select('*')
        .eq('cantera_id', currentCanteraId)
        .order('nombre', { ascending: true });

      if (tiposError) {
        throw tiposError;
      }

      if (!tipos || tipos.length === 0) {
        // Si no hay tipos de agregados, agregarlos automáticamente
        try {
          const response = await fetch('/api/cantera/agregar-tipos-comunes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cantera_id: currentCanteraId }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Error al agregar tipos comunes');
          }

          // Recargar tipos de agregados después de agregarlos
          const { data: tiposAgregados, error: tiposError2 } = await supabase
            .from('tipos_agregados')
            .select('*')
            .eq('cantera_id', currentCanteraId)
            .order('nombre', { ascending: true });

          if (tiposError2) {
            throw tiposError2;
          }

          if (!tiposAgregados || tiposAgregados.length === 0) {
            throw new Error('No se pudieron agregar los tipos de agregados comunes');
          }

          setTiposAgregados(tiposAgregados);
        } catch (err: any) {
          setError(err.message || 'Error al agregar tipos de agregados comunes. Por favor crea al menos un tipo de agregado desde la sección de Cantera.');
        }
        setLoadingData(false);
        return;
      }

      setTiposAgregados(tipos);
      
      // Verificar límites del plan
      try {
        const response = await fetch('/api/limits/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register_produccion' }),
        });
        const limitData = await response.json();
        setLimitCheck(limitData);
      } catch (err) {
        console.error('Error checking limits:', err);
      }
      
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

      const { error: insertError } = await supabase
        .from('produccion')
        .insert({
          cantera_id: canteraId,
          tipo_agregado_id: formData.tipo_agregado_id,
          fecha: formData.fecha,
          cantidad: parseFloat(formData.cantidad) || 0,
          maquina: formData.maquina || null,
          operador_id: formData.operador_id || null,
          merma: parseFloat(formData.merma) || 0,
          created_by: user.id,
        } as never);

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/produccion');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la producción');
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
        <Header title="Nueva Producción" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nueva Producción" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/produccion"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Producción
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Registrar Producción</h2>
            <p className="mt-1 text-sm text-gray-500">Registra la producción diaria de agregados</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {limitCheck && !limitCheck.allowed && (
              <div className="mb-6">
                <PlanLimitAlert message={limitCheck.reason || 'Límite alcanzado'} />
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('Error al agregar tipos de agregados comunes') && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-red-700">
                      <strong>Opción alternativa:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/cantera/${canteraId}`}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Ir a Cantera y Crear Tipo de Agregado
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
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
                <label htmlFor="tipo_agregado_id" className="block text-sm font-medium text-gray-700">
                  Tipo de Agregado <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo_agregado_id"
                  name="tipo_agregado_id"
                  required
                  value={formData.tipo_agregado_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Selecciona un tipo de agregado</option>
                  {tiposAgregados.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre} ({tipo.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                    Cantidad Producida <span className="text-red-500">*</span>
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
                </div>

                <div>
                  <label htmlFor="merma" className="block text-sm font-medium text-gray-700">
                    Merma
                  </label>
                  <input
                    type="number"
                    id="merma"
                    name="merma"
                    step="0.01"
                    min="0"
                    value={formData.merma}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maquina" className="block text-sm font-medium text-gray-700">
                  Máquina
                </label>
                <input
                  type="text"
                  id="maquina"
                  name="maquina"
                  value={formData.maquina}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Excavadora #1"
                />
              </div>
            </div>

            <div className="mt-6 rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> El inventario se actualizará automáticamente cuando guardes este registro.
                La cantidad neta será: Cantidad - Merma
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/produccion"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || (limitCheck !== null && !limitCheck.allowed)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Registrar Producción'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

