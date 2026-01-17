'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PlanLimitAlert from '@/components/PlanLimitAlert';

export default function NuevaVentaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [canteras, setCanteras] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [tiposAgregados, setTiposAgregados] = useState<any[]>([]);
  const [canteraId, setCanteraId] = useState<string>('');
  const [formData, setFormData] = useState({
    numero_factura: '',
    fecha: new Date().toISOString().split('T')[0],
    cliente_id: '',
    tipo_pago: 'contado',
    fecha_vencimiento: '',
    observaciones: '',
  });
  const [detalles, setDetalles] = useState<Array<{
    tipo_agregado_id: string;
    cantidad: number;
    precio_unitario: number;
  }>>([{ tipo_agregado_id: '', cantidad: 0, precio_unitario: 0 }]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (canteraId) {
      loadTiposAgregados();
    }
  }, [canteraId]);

  const loadData = async () => {
    try {
      // Obtener organization_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single() as { data: { organization_id: string } | null };

      if (!profile?.organization_id) {
        setError('No se pudo obtener la organización.');
        return;
      }

      // Cargar canteras de la organización
      const { data: canterasData } = await supabase
        .from('canteras')
        .select('*')
        .eq('organization_id', profile.organization_id);
      
      if (canterasData && canterasData.length > 0) {
        setCanteras(canterasData as any[]);
        setCanteraId((canterasData[0] as any).id);
      }

      // Cargar clientes de la cantera (se cargarán después de seleccionar cantera)
      if (canterasData && canterasData.length > 0) {
        const currentCanteraId = (canterasData[0] as any).id;
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('*')
          .eq('cantera_id', currentCanteraId)
          .eq('estado', 'activo')
          .order('nombre');
        
        if (clientesData) {
          setClientes(clientesData);
        }
      }

      // Verificar límites del plan
      try {
        const response = await fetch('/api/limits/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register_venta' }),
        });
        const limitData = await response.json();
        setLimitCheck(limitData);
      } catch (err) {
        console.error('Error checking limits:', err);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar datos');
    }
  };

  const loadTiposAgregados = async () => {
    if (!canteraId) return;
    
    try {
      const { data } = await supabase
        .from('tipos_agregados')
        .select('*')
        .eq('cantera_id', canteraId)
        .order('nombre');
      
      if (data) {
        setTiposAgregados(data);
      }
    } catch (err: any) {
      console.error('Error loading tipos agregados:', err);
    }
  };

  const handleAddDetalle = () => {
    setDetalles([...detalles, { tipo_agregado_id: '', cantidad: 0, precio_unitario: 0 }]);
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleDetalleChange = (index: number, field: string, value: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setDetalles(newDetalles);
  };

  const calcularSubtotal = () => {
    return detalles.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio_unitario);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar límites antes de enviar
    if (limitCheck && !limitCheck.allowed) {
      setError(limitCheck.reason || 'Has alcanzado el límite para tu plan');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.cliente_id) {
        setError('Debes seleccionar un cliente');
        setLoading(false);
        return;
      }

      if (detalles.length === 0 || detalles.some(d => !d.tipo_agregado_id || d.cantidad <= 0)) {
        setError('Debes agregar al menos un producto con cantidad válida');
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

      const subtotal = calcularSubtotal();
      const descuento = 0; // Por ahora sin descuento, puede agregarse después
      const total = subtotal - descuento;

      // Generar número de factura automático si no se proporciona
      let numeroFactura = formData.numero_factura.trim();
      if (!numeroFactura) {
        // Generar número de factura basado en fecha y timestamp
        const fechaStr = formData.fecha.replace(/-/g, '');
        const timestamp = Date.now().toString().slice(-6);
        numeroFactura = `FAC-${fechaStr}-${timestamp}`;
        
        // Verificar que el número de factura no exista
        const { data: existingVenta } = await supabase
          .from('ventas')
          .select('id')
          .eq('numero_factura', numeroFactura)
          .single();
        
        if (existingVenta) {
          // Si existe, agregar más dígitos del timestamp
          numeroFactura = `FAC-${fechaStr}-${Date.now().toString().slice(-8)}`;
        }
      }

      // Crear venta
      const { data: venta, error: ventaError } = await (supabase
        .from('ventas')
        .insert({
          cantera_id: canteraId,
          numero_factura: numeroFactura,
          fecha: formData.fecha,
          cliente_id: formData.cliente_id,
          tipo_pago: formData.tipo_pago,
          subtotal,
          descuento,
          total,
          estado_pago: formData.tipo_pago === 'contado' ? 'pagado' : 'pendiente',
          fecha_vencimiento: formData.fecha_vencimiento || null,
          created_by: user.id,
        } as any)
        .select()
        .single()) as { data: any; error: any };

      if (ventaError) throw ventaError;

      // Crear detalles
      const detallesData = detalles.map(detalle => ({
        venta_id: venta.id,
        tipo_agregado_id: detalle.tipo_agregado_id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.cantidad * detalle.precio_unitario,
      }));

      const { error: detallesError } = await supabase
        .from('ventas_detalle')
        .insert(detallesData as any);

      if (detallesError) throw detallesError;

      // Si es venta de contado, crear automáticamente el pago
      if (formData.tipo_pago === 'contado') {
        const { error: pagoError } = await supabase
          .from('pagos')
          .insert({
            venta_id: venta.id,
            fecha: formData.fecha,
            monto: total,
            metodo_pago: 'efectivo', // Por defecto efectivo para ventas de contado
            referencia: null,
            created_by: user.id,
          } as any);

        // No fallar si el pago no se puede crear, solo loguear
        if (pagoError) {
          console.error('Error creating pago for contado venta:', pagoError);
        }
      }

      router.push('/dashboard/ventas');
    } catch (err: any) {
      console.error('Error creating venta:', err);
      setError(err.message || 'Error al crear la venta');
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Nueva Venta" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/ventas"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Ventas
          </Link>
        </div>

        {limitCheck && !limitCheck.allowed && (
          <div className="mb-6">
            <PlanLimitAlert message={limitCheck.reason || 'Límite alcanzado'} />
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Información General</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Factura</label>
                  <input
                    type="text"
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Opcional"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente *</label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Pago *</label>
                  <select
                    required
                    value={formData.tipo_pago}
                    onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                {formData.tipo_pago === 'credito' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={formData.fecha_vencimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
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

          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Productos</h2>
              <button
                type="button"
                onClick={handleAddDetalle}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Agregar Producto
              </button>
            </div>
            <div className="p-6 space-y-4">
              {detalles.map((detalle, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tipo de Agregado</label>
                    <select
                      required
                      value={detalle.tipo_agregado_id}
                      onChange={(e) => handleDetalleChange(index, 'tipo_agregado_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Selecciona...</option>
                      {tiposAgregados.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre} ({tipo.unidad_medida})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={detalle.cantidad || ''}
                      onChange={(e) => handleDetalleChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={detalle.precio_unitario || ''}
                      onChange={(e) => handleDetalleChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-right">
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="text-lg font-semibold">
                        ${(detalle.cantidad * detalle.precio_unitario).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDetalle(index)}
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calcularSubtotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/ventas"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || (limitCheck !== null && !limitCheck.allowed)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Venta'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

