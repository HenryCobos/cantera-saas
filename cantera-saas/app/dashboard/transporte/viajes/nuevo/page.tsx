'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Camion, Chofer, Venta } from '@/types';

export default function NuevoViajePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canteraId, setCanteraId] = useState<string | null>(null);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [formData, setFormData] = useState({
    cantera_id: '',
    camion_id: '',
    chofer_id: '',
    venta_id: '',
    fecha: new Date().toISOString().split('T')[0],
    cantidad_metros: '',
    costo_combustible: '',
    costo_peaje: '',
    otros_costos: '',
    destino: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Obtener cantera
      const { data: canteras } = await supabase
        .from('canteras')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .limit(1) as { data: Array<{ id: string }> | null };

      const currentCanteraId = canteras?.[0]?.id;
      if (!currentCanteraId) {
        setError('No hay cantera configurada.');
        setLoadingData(false);
        return;
      }

      setCanteraId(currentCanteraId);
      setFormData(prev => ({ ...prev, cantera_id: currentCanteraId }));

      // Cargar datos en paralelo
      const [camionesResult, choferesResult, ventasResult] = await Promise.all([
        supabase
          .from('camiones')
          .select('*')
          .eq('cantera_id', currentCanteraId)
          .eq('estado', 'activo')
          .order('placa', { ascending: true }),
        supabase
          .from('choferes')
          .select('*')
          .eq('cantera_id', currentCanteraId)
          .eq('estado', 'activo')
          .order('nombre', { ascending: true }),
        supabase
          .from('ventas')
          .select('id, numero_factura, fecha, cliente:clientes(nombre)')
          .eq('cantera_id', currentCanteraId)
          .eq('estado_pago', 'pendiente')
          .order('fecha', { ascending: false })
          .limit(50),
      ]);

      if (camionesResult.error) throw camionesResult.error;
      if (choferesResult.error) throw choferesResult.error;
      if (ventasResult.error) throw ventasResult.error;

      setCamiones(camionesResult.data || []);
      setChoferes(choferesResult.data || []);
      setVentas(ventasResult.data || []);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error: insertError } = await supabase.from('viajes').insert({
        cantera_id: canteraId,
        camion_id: formData.camion_id || null,
        chofer_id: formData.chofer_id || null,
        venta_id: formData.venta_id || null,
        fecha: formData.fecha,
        cantidad_metros: parseFloat(formData.cantidad_metros) || 0,
        costo_combustible: parseFloat(formData.costo_combustible) || 0,
        costo_peaje: parseFloat(formData.costo_peaje) || 0,
        otros_costos: parseFloat(formData.otros_costos) || 0,
        destino: formData.destino,
        created_by: user.id,
      } as never);

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/transporte');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el viaje');
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
        <Header title="Nuevo Viaje" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nuevo Viaje" />
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
            <h2 className="text-lg font-medium text-gray-900">Registrar Nuevo Viaje</h2>
            <p className="mt-1 text-sm text-gray-500">Registra un viaje de transporte</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
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

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="camion_id" className="block text-sm font-medium text-gray-700">
                    Camión <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="camion_id"
                    name="camion_id"
                    required
                    value={formData.camion_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Selecciona un camión</option>
                    {camiones.map((camion) => (
                      <option key={camion.id} value={camion.id}>
                        {camion.placa} - {camion.capacidad_metros} m³
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="chofer_id" className="block text-sm font-medium text-gray-700">
                    Chofer <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="chofer_id"
                    name="chofer_id"
                    required
                    value={formData.chofer_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Selecciona un chofer</option>
                    {choferes.map((chofer) => (
                      <option key={chofer.id} value={chofer.id}>
                        {chofer.nombre} {chofer.licencia && `- ${chofer.licencia}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="venta_id" className="block text-sm font-medium text-gray-700">
                  Venta Asociada (Opcional)
                </label>
                <select
                  id="venta_id"
                  name="venta_id"
                  value={formData.venta_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Ninguna (viaje independiente)</option>
                  {ventas.map((venta: any) => (
                    <option key={venta.id} value={venta.id}>
                      {venta.numero_factura} - {venta.cliente?.nombre || 'Cliente'} - {new Date(venta.fecha).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700">
                  Destino <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="destino"
                  name="destino"
                  required
                  value={formData.destino}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Obra Calle Principal #123"
                />
              </div>

              <div>
                <label htmlFor="cantidad_metros" className="block text-sm font-medium text-gray-700">
                  Cantidad Transportada (m³) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="cantidad_metros"
                  name="cantidad_metros"
                  required
                  step="0.01"
                  min="0"
                  value={formData.cantidad_metros}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="costo_combustible" className="block text-sm font-medium text-gray-700">
                    Costo Combustible
                  </label>
                  <input
                    type="number"
                    id="costo_combustible"
                    name="costo_combustible"
                    step="0.01"
                    min="0"
                    value={formData.costo_combustible}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="costo_peaje" className="block text-sm font-medium text-gray-700">
                    Costo Peaje
                  </label>
                  <input
                    type="number"
                    id="costo_peaje"
                    name="costo_peaje"
                    step="0.01"
                    min="0"
                    value={formData.costo_peaje}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="otros_costos" className="block text-sm font-medium text-gray-700">
                    Otros Costos
                  </label>
                  <input
                    type="number"
                    id="otros_costos"
                    name="otros_costos"
                    step="0.01"
                    min="0"
                    value={formData.otros_costos}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
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
                {loading ? 'Guardando...' : 'Registrar Viaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

