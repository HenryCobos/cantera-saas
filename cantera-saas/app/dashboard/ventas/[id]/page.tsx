'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon, CurrencyDollarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

interface VentaDetallePageProps {
  params: Promise<{ id: string }>;
}

function getEstadoPagoColor(estado: string) {
  switch (estado) {
    case 'pagado':
      return 'bg-green-100 text-green-800';
    case 'parcial':
      return 'bg-yellow-100 text-yellow-800';
    case 'pendiente':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getMetodoPagoColor(metodo: string) {
  switch (metodo) {
    case 'efectivo':
      return 'bg-green-100 text-green-800';
    case 'transferencia':
      return 'bg-blue-100 text-blue-800';
    case 'cheque':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function VentaDetallePage({ params }: VentaDetallePageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [venta, setVenta] = useState<any>(null);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
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

      // Obtener cantera
      const { data: canteras } = await supabase
        .from('canteras')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .limit(1);

      const canteraId = (canteras?.[0] as { id: string } | undefined)?.id;
      if (!canteraId || !id) return;

      // Cargar datos en paralelo
      const [ventaResult, detallesResult, pagosResult] = await Promise.all([
        supabase
          .from('ventas')
          .select(`
            *,
            cliente:clientes(*)
          `)
          .eq('id', id)
          .eq('cantera_id', canteraId)
          .single(),
        supabase
          .from('ventas_detalle')
          .select(`
            *,
            tipo_agregado:tipos_agregados(*)
          `)
          .eq('venta_id', id),
        supabase
          .from('pagos')
          .select('*')
          .eq('venta_id', id)
          .order('fecha', { ascending: false }),
      ]);

      if (ventaResult.error) {
        setLoading(false);
        return;
      }

      const ventaData = (ventaResult as any).data;
      if (!ventaData) {
        setLoading(false);
        return;
      }

      setVenta(ventaData);
      
      // Verificar si hay errores en la consulta de detalles
      if (detallesResult.error) {
        console.error('Error loading detalles:', detallesResult.error);
      }
      
      setDetalles((detallesResult.data || []) as any[]);
      setPagos((pagosResult.data || []) as any[]);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Detalle de Venta" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  if (!venta) {
    return (
      <>
        <Header title="Detalle de Venta" />
        <div className="p-6">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">Venta no encontrada</p>
          </div>
        </div>
      </>
    );
  }

  const totalPagado = pagos.reduce((sum: number, pago: any) => sum + (pago.monto || 0), 0);
  const saldoPendiente = venta.total - totalPagado;
  
  // Calcular estado basado en el saldo pendiente (más preciso que el de la BD)
  const estadoPagoCalculado = saldoPendiente <= 0.01 
    ? 'pagado' 
    : totalPagado > 0 
    ? 'parcial' 
    : 'pendiente';

  const exportarPDF = () => {
    if (!venta) return;

    setExportingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA DE VENTA', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Información de la factura
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Número: ${venta.numero_factura || ''}`, margin, yPos);
      doc.text(`Fecha: ${new Date(venta.fecha || '').toLocaleDateString('es-ES')}`, margin + 70, yPos);
      yPos += 10;

      // Información del cliente
      if (venta.cliente) {
        const cliente = venta.cliente as any;
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;
        doc.text(`Nombre: ${cliente.nombre || ''}`, margin + 5, yPos);
        if (cliente.documento) {
          doc.text(`Documento: ${cliente.documento}`, margin + 70, yPos);
        }
        yPos += 6;
        if (cliente.telefono) {
          doc.text(`Teléfono: ${cliente.telefono}`, margin + 5, yPos);
        }
        if (cliente.email) {
          doc.text(`Email: ${cliente.email}`, margin + 70, yPos);
        }
        yPos += 10;
      }

      // Línea separadora
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Tabla de productos
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Productos', margin, yPos);
      yPos += 8;

      // Headers de tabla
      doc.setFillColor(59, 130, 246);
      doc.setTextColor(255, 255, 255);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFontSize(9);
      doc.text('Producto', margin + 2, yPos + 6);
      doc.text('Cantidad', margin + 70, yPos + 6);
      doc.text('Precio Unit.', margin + 110, yPos + 6);
      doc.text('Subtotal', margin + 150, yPos + 6);
      yPos += 8;

      // Productos
      doc.setTextColor(0, 0, 0);
      detalles.forEach((detalle: any) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(8);
        doc.text(detalle.tipo_agregado?.nombre || 'N/A', margin + 2, yPos + 5);
        doc.text(
          `${detalle.cantidad.toFixed(2)} ${detalle.tipo_agregado?.unidad_medida || ''}`,
          margin + 70,
          yPos + 5
        );
        doc.text(`$${detalle.precio_unitario.toFixed(2)}`, margin + 110, yPos + 5);
        doc.text(`$${detalle.subtotal.toFixed(2)}`, margin + 150, yPos + 5);
        yPos += 6;
      });

      yPos += 5;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Totales
      doc.setFontSize(10);
      doc.text(`Subtotal: $${venta.subtotal.toFixed(2)}`, margin + 110, yPos);
      yPos += 6;
      if (venta.descuento > 0) {
        doc.text(`Descuento: -$${venta.descuento.toFixed(2)}`, margin + 110, yPos);
        yPos += 6;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Total: $${venta.total.toFixed(2)}`, margin + 110, yPos);
      yPos += 10;

      // Resumen de pagos
      if (pagos.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Pagos Realizados:', margin, yPos);
        yPos += 6;
        pagos.forEach((pago: any) => {
          doc.setFontSize(8);
          doc.text(
            `${new Date(pago.fecha).toLocaleDateString('es-ES')} - ${pago.metodo_pago}: $${pago.monto.toFixed(2)}`,
            margin + 5,
            yPos + 5
          );
          yPos += 5;
        });
        yPos += 5;
      }

      // Resumen final
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total Pagado: $${totalPagado.toFixed(2)}`, margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 0, 0);
      doc.text(`Saldo Pendiente: $${saldoPendiente.toFixed(2)}`, margin, yPos);

      // Guardar PDF
      const fileName = `Factura_${venta.numero_factura}_${new Date(venta.fecha).toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setExportingPDF(false);
    } catch (err: any) {
      console.error('Error al exportar PDF:', err);
      alert('Error al exportar el PDF: ' + err.message);
      setExportingPDF(false);
    }
  };

  return (
    <>
      <Header title={`Venta ${venta.numero_factura}`} />
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la Venta */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Información de la Venta</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Número de Factura</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{venta.numero_factura}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(venta.fecha).toLocaleDateString('es-ES')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo de Pago</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{venta.tipo_pago}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getEstadoPagoColor(
                          estadoPagoCalculado
                        )}`}
                      >
                        {estadoPagoCalculado}
                      </span>
                    </dd>
                  </div>
                  {venta.fecha_vencimiento && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Vencimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(venta.fecha_vencimiento).toLocaleDateString('es-ES')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Cliente */}
            {venta.cliente && (
              <div className="rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900">Cliente</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                      <dd className="mt-1 text-sm text-gray-900">{venta.cliente.nombre}</dd>
                    </div>
                    {venta.cliente.documento && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Documento</dt>
                        <dd className="mt-1 text-sm text-gray-900">{venta.cliente.documento}</dd>
                      </div>
                    )}
                    {venta.cliente.telefono && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                        <dd className="mt-1 text-sm text-gray-900">{venta.cliente.telefono}</dd>
                      </div>
                    )}
                    {venta.cliente.email && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{venta.cliente.email}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Productos */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Productos</h2>
              </div>
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Precio Unit.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {detalles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                            No hay productos registrados
                          </td>
                        </tr>
                      ) : (
                        detalles.map((detalle: any) => (
                          <tr key={detalle.id}>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                              {detalle.tipo_agregado?.nombre || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900">
                              {detalle.cantidad.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {detalle.tipo_agregado?.unidad_medida || ''}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900">
                              ${detalle.precio_unitario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-900">
                              ${detalle.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          ${venta.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {venta.descuento > 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Descuento:
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                            -${venta.descuento.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          ${venta.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagos Realizados */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Pagos Realizados</h2>
              </div>
              <div className="px-6 py-4">
                {pagos.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No hay pagos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {pagos.map((pago: any) => (
                      <div
                        key={pago.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(pago.fecha).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getMetodoPagoColor(
                                pago.metodo_pago
                              )}`}
                            >
                              {pago.metodo_pago}
                            </span>
                            {pago.referencia && ` - ${pago.referencia}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${pago.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen y Acciones */}
          <div className="space-y-6">
            {/* Resumen de Pago */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Resumen de Pago</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total de la Venta</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${venta.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Pagado</dt>
                  <dd className="mt-1 text-lg font-semibold text-green-600">
                    ${totalPagado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="text-sm font-medium text-gray-500">Saldo Pendiente</dt>
                  <dd className="mt-1 text-xl font-bold text-red-600">
                    ${saldoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              {saldoPendiente > 0 && (
                <Link
                  href={`/dashboard/pagos/nuevo?venta_id=${venta.id}`}
                  className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <CurrencyDollarIcon className="mr-2 h-5 w-5" />
                  Registrar Pago
                </Link>
              )}
              <button
                onClick={exportarPDF}
                disabled={exportingPDF}
                className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="mr-2 h-5 w-5" />
                {exportingPDF ? 'Exportando...' : 'Exportar PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

