'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

interface ViajeData {
  id: string;
  fecha: string;
  cantidad_metros: number;
  costo_combustible: number | null;
  costo_peaje: number | null;
  otros_costos: number | null;
  destino: string;
  camion: { placa: string; capacidad_metros: number } | null;
  chofer: { nombre: string; licencia: string | null; telefono: string | null } | null;
}

export default function ViajeDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viaje, setViaje] = useState<ViajeData | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('viajes')
        .select(`
          *,
          camion:camiones(placa, capacidad_metros),
          chofer:choferes(nombre, licencia, telefono)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setViaje(data as ViajeData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el viaje');
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    if (!viaje) return;

    setExportingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Viaje', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Información general
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const fecha = new Date(viaje.fecha).toLocaleDateString('es-ES');
      const costoTotal = (viaje.costo_combustible || 0) + (viaje.costo_peaje || 0) + (viaje.otros_costos || 0);

      const datos = [
        ['Campo', 'Valor'],
        ['Fecha', fecha],
        ['Destino', viaje.destino || '-'],
        ['Cantidad (m³)', viaje.cantidad_metros?.toString() || '0'],
        ['', ''],
        ['CAMION', ''],
        ['Placa', viaje.camion?.placa || '-'],
        ['Capacidad (m³)', viaje.camion?.capacidad_metros?.toString() || '-'],
        ['', ''],
        ['CHOFER', ''],
        ['Nombre', viaje.chofer?.nombre || '-'],
        ['Licencia', viaje.chofer?.licencia || '-'],
        ['Teléfono', viaje.chofer?.telefono || '-'],
        ['', ''],
        ['COSTOS', ''],
        ['Combustible', `$${(viaje.costo_combustible || 0).toFixed(2)}`],
        ['Peaje', `$${(viaje.costo_peaje || 0).toFixed(2)}`],
        ['Otros Costos', `$${(viaje.otros_costos || 0).toFixed(2)}`],
        ['TOTAL', `$${costoTotal.toFixed(2)}`],
      ];

      // Dibujar tabla
      doc.setFontSize(10);
      const cellWidth = (pageWidth - 2 * margin) / 2;
      const cellHeight = 7;

      datos.forEach((row, index) => {
        if (yPos + cellHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }

        const isHeader = index === 0;
        const isSection = row[1] === '' && row[0] !== '';

        if (isHeader) {
          doc.setFillColor(59, 130, 246); // blue-500
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
        } else if (isSection) {
          doc.setFillColor(229, 231, 235); // gray-200
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }

        doc.rect(margin, yPos, cellWidth, cellHeight, 'F');
        doc.text(row[0] || '', margin + 2, yPos + 5);

        if (isHeader) {
          doc.setFillColor(59, 130, 246);
        } else if (isSection) {
          doc.setFillColor(229, 231, 235);
        } else {
          doc.setFillColor(255, 255, 255);
        }

        doc.rect(margin + cellWidth, yPos, cellWidth, cellHeight, 'F');
        doc.text(row[1] || '', margin + cellWidth + 2, yPos + 5);

        yPos += cellHeight;
      });

      // Guardar PDF
      const fileName = `Viaje_${viaje.camion?.placa || 'N/A'}_${fecha.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      setExportingPDF(false);
    } catch (err: any) {
      console.error('Error al exportar PDF:', err);
      alert('Error al exportar el PDF: ' + err.message);
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Detalle de Viaje" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  if (error || !viaje) {
    return (
      <>
        <Header title="Detalle de Viaje" />
        <div className="p-6">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error || 'Viaje no encontrado'}</p>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/transporte"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a Transporte
            </Link>
          </div>
        </div>
      </>
    );
  }

  const costoTotal = (viaje.costo_combustible || 0) + (viaje.costo_peaje || 0) + (viaje.otros_costos || 0);

  return (
    <>
      <Header title="Detalle de Viaje" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/transporte"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Transporte
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/transporte/viajes/${id}/editar`}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Editar
            </Link>
            <button
              onClick={exportarPDF}
              disabled={exportingPDF}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
              {exportingPDF ? 'Exportando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-white shadow" id="viaje-detail-content">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                Viaje del {new Date(viaje.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Información General</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Fecha:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(viaje.fecha).toLocaleDateString('es-ES')}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Destino:</dt>
                        <dd className="text-sm font-medium text-gray-900">{viaje.destino || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Cantidad:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.cantidad_metros} m³
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Camión</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Placa:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.camion?.placa || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Capacidad:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.camion?.capacidad_metros} m³
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Chofer</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Nombre:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.chofer?.nombre || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Licencia:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.chofer?.licencia || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Teléfono:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {viaje.chofer?.telefono || '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Costos</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Combustible:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          ${(viaje.costo_combustible || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Peaje:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          ${(viaje.costo_peaje || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Otros Costos:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          ${(viaje.otros_costos || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <dt className="text-sm font-semibold text-gray-900">Total:</dt>
                        <dd className="text-sm font-bold text-blue-600">
                          ${costoTotal.toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
