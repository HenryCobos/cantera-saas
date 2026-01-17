'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NuevoPagoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    venta_id: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    metodo_pago: 'efectivo',
    referencia: '',
    observaciones: '',
  });

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      // Obtener organization_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single() as { data: { organization_id: string } | null };

      if (!profile?.organization_id) return;

      // Obtener cantera de la organización
      const { data: canteras } = await supabase
        .from('canteras')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .limit(1);

      const canteraId = (canteras?.[0] as { id: string } | undefined)?.id;
      if (!canteraId) return;

      // Cargar todas las ventas y calcular monto_pagado
      const { data: ventasData } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(nombre),
          pagos(monto)
        `)
        .eq('cantera_id', canteraId)
        .order('fecha', { ascending: false });

      if (ventasData) {
        // Calcular monto_pagado y filtrar ventas con saldo pendiente
        const ventasConPago = (ventasData as any[]).map((venta: any) => {
          const pagosArray = Array.isArray(venta.pagos) ? venta.pagos : [];
          const montoPagado = pagosArray.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
          const ventaSinPagos = { ...venta };
          delete ventaSinPagos.pagos;
          return {
            ...ventaSinPagos,
            monto_pagado: montoPagado,
          };
        }).filter((venta: any) => {
          // Incluir solo ventas que tengan saldo pendiente
          const saldoPendiente = venta.total - (venta.monto_pagado || 0);
          return saldoPendiente > 0;
        });
        
        setVentas(ventasConPago);
      }
    } catch (err: any) {
      console.error('Error loading ventas:', err);
    }
  };

  const handleVentaChange = (ventaId: string) => {
    const venta = ventas.find(v => v.id === ventaId);
    if (venta) {
      // Calcular monto pendiente
      const montoPendiente = venta.total - (venta.monto_pagado || 0);
      setFormData({
        ...formData,
        venta_id: ventaId,
        monto: montoPendiente > 0 ? montoPendiente : 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.venta_id) {
        setError('Debes seleccionar una venta');
        setLoading(false);
        return;
      }

      if (formData.monto <= 0) {
        setError('El monto debe ser mayor a cero');
        setLoading(false);
        return;
      }

      const venta = ventas.find(v => v.id === formData.venta_id);
      if (!venta) {
        setError('Venta no encontrada');
        setLoading(false);
        return;
      }

      const montoPendiente = venta.total - (venta.monto_pagado || 0);
      if (formData.monto > montoPendiente) {
        setError(`El monto no puede ser mayor al pendiente (${montoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })})`);
        setLoading(false);
        return;
      }

      // Obtener usuario actual para created_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      // Crear pago
      // Nota: La tabla pagos no tiene columna 'observaciones'
      // Combinamos referencia y observaciones en el campo 'referencia' si hay observaciones
      let referenciaFinal = formData.referencia || null;
      if (formData.observaciones && formData.observaciones.trim()) {
        if (referenciaFinal) {
          referenciaFinal = `${referenciaFinal} | ${formData.observaciones}`;
        } else {
          referenciaFinal = formData.observaciones;
        }
      }

      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          venta_id: formData.venta_id,
          fecha: formData.fecha,
          monto: formData.monto,
          metodo_pago: formData.metodo_pago,
          referencia: referenciaFinal,
          created_by: user.id,
        } as any);

      if (pagoError) {
        console.error('Supabase error:', pagoError);
        throw new Error(pagoError.message || 'Error al registrar el pago');
      }

      // El trigger actualizará automáticamente el estado de la venta
      router.push('/dashboard/pagos');
    } catch (err: any) {
      console.error('Error creating pago:', err);
      const errorMessage = err?.message || err?.error?.message || String(err) || 'Error al registrar el pago';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const ventaSeleccionada = ventas.find(v => v.id === formData.venta_id);

  return (
    <>
      <Header title="Registrar Pago" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/pagos"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Pagos
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Información del Pago</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venta *</label>
                  <select
                    required
                    value={formData.venta_id}
                    onChange={(e) => handleVentaChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Selecciona una venta</option>
                    {ventas.map((venta) => {
                      const pendiente = venta.total - (venta.monto_pagado || 0);
                      return (
                        <option key={venta.id} value={venta.id}>
                          {venta.numero_factura || `Venta ${venta.id.slice(0, 8)}`} - {venta.cliente?.nombre || 'Sin cliente'} - 
                          Pendiente: ${pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                {ventaSeleccionada && (
                  <>
                    <div className="rounded-md bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Total de la Venta</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${ventaSeleccionada.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Monto Pagado</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${(ventaSeleccionada.monto_pagado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-md bg-yellow-50 p-4">
                      <p className="text-sm text-gray-500">Pendiente</p>
                      <p className="text-lg font-semibold text-yellow-900">
                        ${((ventaSeleccionada.total - (ventaSeleccionada.monto_pagado || 0))).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto a Pagar *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monto || ''}
                    onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Método de Pago *</label>
                  <select
                    required
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referencia</label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Número de cheque, transferencia, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/pagos"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

