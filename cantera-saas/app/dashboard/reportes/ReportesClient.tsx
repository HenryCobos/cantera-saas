'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportesClientProps {
  canteraId: string;
  initialData: {
    totalProduccion: number;
    totalVentas: number;
    totalGastos: number;
    totalPagos: number;
    utilidad: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ReportesClient({ canteraId, initialData }: ReportesClientProps) {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [produccionMensual, setProduccionMensual] = useState<any[]>([]);
  const [rentabilidadClientes, setRentabilidadClientes] = useState<any[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any[]>([]);
  const [datosReporte, setDatosReporte] = useState(initialData);
  const [canExportPDF, setCanExportPDF] = useState(false);

  useEffect(() => {
    loadData();
    checkExportPermission();
  }, [canteraId, fechaInicio, fechaFin]);

  const checkExportPermission = async () => {
    try {
      const response = await fetch('/api/limits/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_pdf' }),
      });
      const data = await response.json();
      setCanExportPDF(data.allowed || false);
    } catch (error) {
      console.error('Error checking export permission:', error);
      setCanExportPDF(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar producción mensual (últimos 6 meses)
      await loadProduccionMensual();
      
      // Cargar rentabilidad por cliente
      await loadRentabilidadClientes();
      
      // Cargar gastos por categoría
      await loadGastosPorCategoria();
      
      // Cargar datos del reporte
      await loadDatosReporte();
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProduccionMensual = async () => {
    const meses: any[] = [];
    const hoy = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('produccion')
        .select('cantidad')
        .eq('cantera_id', canteraId)
        .gte('fecha', inicioMes)
        .lte('fecha', finMes);
      
      const total = data?.reduce((sum: number, p: any) => sum + (p.cantidad || 0), 0) || 0;
      
      meses.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        produccion: parseFloat(total.toFixed(2)),
      });
    }
    
    setProduccionMensual(meses);
  };

  const loadRentabilidadClientes = async () => {
    const { data: ventas } = await supabase
      .from('ventas')
      .select(`
        id,
        total,
        cliente:clientes(id, nombre)
      `)
      .eq('cantera_id', canteraId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (!ventas) return;
    
    // Agrupar por cliente
    const clienteMap = new Map<string, { nombre: string; ventas: number; pagos: number }>();
    
    ventas.forEach((venta: any) => {
      const clienteId = venta.cliente?.id || 'Sin cliente';
      const clienteNombre = venta.cliente?.nombre || 'Sin cliente';
      
      if (!clienteMap.has(clienteId)) {
        clienteMap.set(clienteId, { nombre: clienteNombre, ventas: 0, pagos: 0 });
      }
      
      const cliente = clienteMap.get(clienteId)!;
      cliente.ventas += venta.total || 0;
    });
    
    // Obtener pagos por venta
    const ventaIds = (ventas as any[]).map((v: any) => v.id);
    if (ventaIds.length > 0) {
      const { data: pagos } = await supabase
        .from('pagos')
        .select('venta_id, monto')
        .in('venta_id', ventaIds);
      
      if (pagos) {
        (pagos as any[]).forEach((pago: any) => {
          const venta = (ventas as any[]).find((v: any) => v.id === pago.venta_id);
          if (venta && venta.cliente) {
            const clienteId = venta.cliente.id || 'Sin cliente';
            const cliente = clienteMap.get(clienteId);
            if (cliente) {
              cliente.pagos += pago.monto || 0;
            }
          }
        });
      }
    }
    
    // Calcular rentabilidad (pagos - ventas = utilidad, porcentaje)
    const rentabilidad = Array.from(clienteMap.values())
      .map(cliente => ({
        cliente: cliente.nombre,
        ventas: cliente.ventas,
        pagos: cliente.pagos,
        pendiente: cliente.ventas - cliente.pagos,
        porcentaje: cliente.ventas > 0 ? (cliente.pagos / cliente.ventas) * 100 : 0,
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 10); // Top 10 clientes
    
    setRentabilidadClientes(rentabilidad);
  };

  const loadGastosPorCategoria = async () => {
    const { data: gastos } = await supabase
      .from('gastos')
      .select('categoria, monto')
      .eq('cantera_id', canteraId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (!gastos) return;
    
    const categoriaMap = new Map<string, number>();
    
    gastos.forEach((gasto: any) => {
      const cat = gasto.categoria || 'otro';
      categoriaMap.set(cat, (categoriaMap.get(cat) || 0) + (gasto.monto || 0));
    });
    
    const categorias = Array.from(categoriaMap.entries())
      .map(([categoria, monto]) => ({
        categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
        monto: parseFloat(monto.toFixed(2)),
      }))
      .sort((a, b) => b.monto - a.monto);
    
    setGastosPorCategoria(categorias);
  };

  const loadDatosReporte = async () => {
    const { data: produccion } = await supabase
      .from('produccion')
      .select('cantidad')
      .eq('cantera_id', canteraId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    const { data: ventas } = await supabase
      .from('ventas')
      .select('total')
      .eq('cantera_id', canteraId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    const { data: gastos } = await supabase
      .from('gastos')
      .select('monto')
      .eq('cantera_id', canteraId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    const { data: pagos } = await supabase
      .from('pagos')
      .select('monto, venta:ventas(cantera_id)')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    const totalProduccion = produccion?.reduce((sum: number, p: any) => sum + (p.cantidad || 0), 0) || 0;
    const totalVentas = ventas?.reduce((sum: number, v: any) => sum + (v.total || 0), 0) || 0;
    const totalGastos = gastos?.reduce((sum: number, g: any) => sum + (g.monto || 0), 0) || 0;
    const totalPagos =
      pagos?.filter((p: any) => p.venta?.cantera_id === canteraId).reduce((sum: number, p: any) => sum + (p.monto || 0), 0) || 0;
    
    setDatosReporte({
      totalProduccion,
      totalVentas,
      totalGastos,
      totalPagos,
      utilidad: totalVentas - totalGastos,
    });
  };

  const exportarPDF = async () => {
    // Declarar fuera del try para que esté disponible en el catch
    const originalLinks: Array<{ link: HTMLLinkElement; disabled: boolean }> = [];
    
    try {
      const reportElement = document.getElementById('reporte-completo');
      if (!reportElement) return;
      
      // Esperar a que los gráficos se rendericen completamente
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ANTES de capturar: Deshabilitar temporalmente las hojas de estilo externas
      // Esto previene que html2canvas lea estilos con lab() durante el proceso
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const htmlLink = link as HTMLLinkElement;
        originalLinks.push({ link: htmlLink, disabled: htmlLink.disabled });
        htmlLink.disabled = true;
      });
      
      // Asegurar que todos los ResponsiveContainer y sus padres tengan dimensiones fijas
      const responsiveContainers = reportElement.querySelectorAll('.recharts-responsive-container');
      const originalStyles: { element: HTMLElement; height: string; width: string; parentHeight: string }[] = [];
      
      responsiveContainers.forEach((container) => {
        const htmlEl = container as HTMLElement;
        const parent = htmlEl.parentElement;
        
        // Guardar estilos originales
        const originalHeight = htmlEl.style.height || '';
        const originalWidth = htmlEl.style.width || '';
        const parentHeight = parent ? (parent.style.height || '') : '';
        
        originalStyles.push({ 
          element: htmlEl, 
          height: originalHeight, 
          width: originalWidth,
          parentHeight: parentHeight
        });
        
        // Fijar dimensiones del contenedor padre (h-80)
        if (parent && parent.classList.contains('h-80')) {
          parent.style.height = '320px';
          parent.style.minHeight = '320px';
          parent.style.position = 'relative';
        }
        
        // Fijar dimensiones del ResponsiveContainer
        htmlEl.style.height = '320px';
        htmlEl.style.width = '100%';
        htmlEl.style.position = 'relative';
        htmlEl.style.minHeight = '320px';
      });
      
      // Esperar a que los cambios de layout se apliquen
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
      
      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight,
        allowTaint: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // No ignorar ningún elemento
          return false;
        },
        onclone: (clonedDoc, element) => {
          // Mostrar encabezado en el clon para PDF
          const encabezado = clonedDoc.querySelector('.encabezado-pdf');
          if (encabezado) {
            (encabezado as HTMLElement).style.display = 'block';
          }
          
          // PRIMERO: Deshabilitar y remover TODAS las hojas de estilo externas INMEDIATAMENTE
          const externalStyleLinks = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          externalStyleLinks.forEach(link => {
            (link as HTMLLinkElement).disabled = true;
            link.remove();
          });
          
          // SEGUNDO: Remover TODAS las etiquetas <style> que puedan contener lab()
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach(styleEl => {
            const cssText = styleEl.textContent || '';
            if (cssText.includes('lab(') || cssText.includes('oklab(')) {
              styleEl.remove();
            }
          });
          
          // TERCERO: Limpiar TODOS los elementos, incluyendo estilos computados
          const allElements = clonedDoc.querySelectorAll('*');
          const computedStyleProps = [
            'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
            'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor',
            'columnRuleColor', 'fill', 'stroke'
          ];
          
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            
            // Limpiar atributos SVG problemáticos PRIMERO
            ['fill', 'stroke', 'stop-color', 'flood-color', 'color'].forEach(attr => {
              const val = el.getAttribute(attr);
              if (val && (val.includes('lab(') || val.includes('oklab('))) {
                el.removeAttribute(attr);
              }
            });
            
            // Limpiar estilos inline y reemplazar con RGB si es necesario
            try {
              if (htmlEl.style && htmlEl.style.length > 0) {
                const stylesToRemove: string[] = [];
                const stylesToKeep: { prop: string; value: string }[] = [];
                
                for (let i = 0; i < htmlEl.style.length; i++) {
                  const prop = htmlEl.style[i];
                  const value = htmlEl.style.getPropertyValue(prop);
                  
                  if (value && (value.includes('lab(') || value.includes('oklab('))) {
                    stylesToRemove.push(prop);
                  } else if (value && computedStyleProps.includes(prop)) {
                    // Preservar colores válidos (rgb, hex, named)
                    if (!value.includes('lab(') && !value.includes('oklab(')) {
                      stylesToKeep.push({ prop, value });
                    }
                  }
                }
                
                // Remover propiedades problemáticas
                stylesToRemove.forEach(prop => htmlEl.style.removeProperty(prop));
              }
              
              // Limpiar atributo style directamente
              const styleAttr = htmlEl.getAttribute('style');
              if (styleAttr) {
                const cleanedDeclarations = styleAttr
                  .split(';')
                  .filter(decl => {
                    const trimmed = decl.trim();
                    return trimmed && !trimmed.includes('lab(') && !trimmed.includes('oklab(');
                  });
                
                if (cleanedDeclarations.length > 0) {
                  htmlEl.setAttribute('style', cleanedDeclarations.join(';'));
                } else {
                  htmlEl.removeAttribute('style');
                }
              }
            } catch (e) {
              // Si falla, remover style completamente
              htmlEl.removeAttribute('style');
            }
          });
          
          // Agregar estilos completos de Tailwind CSS usando solo RGB
          // Esto reemplaza las hojas de estilo que pueden tener lab() pero mantiene el diseño
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Reset y base */
            * {
              box-sizing: border-box !important;
            }
            
            /* Asegurar layout sin superposiciones */
            #reporte-completo {
              display: block !important;
              position: relative !important;
              width: 100% !important;
              overflow: visible !important;
            }
            
            /* Encabezado del reporte - visible solo en PDF */
            .encabezado-pdf {
              display: block !important;
              margin-bottom: 30px !important;
              page-break-after: avoid !important;
            }
            .encabezado-pdf h1 {
              font-size: 24px !important;
              font-weight: 700 !important;
              margin-bottom: 8px !important;
              color: rgb(17, 24, 39) !important;
            }
            
            /* Layout y estructura con mejor espaciado para PDF */
            #reporte-completo {
              padding: 20px !important;
            }
            .space-y-6 > * + * { 
              margin-top: 40px !important; 
              display: block !important; 
              position: relative !important;
              page-break-inside: avoid !important;
            }
            .grid { 
              display: grid !important; 
              position: relative !important; 
              width: 100% !important;
            }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .flex { 
              display: flex !important; 
              position: relative !important;
              width: 100% !important;
            }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .flex-wrap { flex-wrap: wrap !important; }
            
            /* Asegurar que los contenedores de gráficos tengan dimensiones fijas */
            .recharts-responsive-container {
              position: relative !important;
              width: 100% !important;
              height: 280px !important;
              min-height: 280px !important;
              margin-bottom: 20px !important;
            }
            
            /* Alturas específicas */
            .h-80 {
              height: 280px !important;
              min-height: 280px !important;
              position: relative !important;
              margin-bottom: 20px !important;
            }
            
            /* Contenedores de secciones con mejor espaciado */
            .rounded-lg {
              display: block !important;
              position: relative !important;
              margin-bottom: 30px !important;
              padding: 24px !important;
              page-break-inside: avoid !important;
            }
            
            /* Títulos de sección más destacados */
            h3 {
              font-size: 18px !important;
              font-weight: 600 !important;
              margin-bottom: 20px !important;
              padding-bottom: 10px !important;
              border-bottom: 2px solid rgb(229, 231, 235) !important;
              color: rgb(17, 24, 39) !important;
            }
            
            /* Evitar que elementos se superpongan */
            .space-y-6 > * {
              display: block !important;
              position: relative !important;
              clear: both !important;
            }
            
            /* Tablas con mejor formato */
            .overflow-x-auto {
              overflow-x: visible !important;
              width: 100% !important;
              margin-top: 20px !important;
            }
            
            /* Separar tablas de gráficos */
            .mt-4 {
              margin-top: 24px !important;
            }
            
            /* Grid de gráficos */
            .grid {
              gap: 24px !important;
            }
            
            /* Colores de fondo */
            .bg-white { background-color: rgb(255, 255, 255) !important; }
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
            .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
            .bg-green-500 { background-color: rgb(34, 197, 94) !important; }
            .bg-red-500 { background-color: rgb(239, 68, 68) !important; }
            
            /* Colores de texto */
            .text-gray-900 { color: rgb(17, 24, 39) !important; }
            .text-gray-700 { color: rgb(55, 65, 81) !important; }
            .text-gray-500 { color: rgb(107, 114, 128) !important; }
            .text-green-600 { color: rgb(22, 163, 74) !important; }
            .text-red-600 { color: rgb(220, 38, 38) !important; }
            .text-white { color: rgb(255, 255, 255) !important; }
            
            /* Tipografía */
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            
            /* Espaciado */
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-4 { margin-top: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            
            /* Bordes */
            .border { border-width: 1px; }
            .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
            .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-md { border-radius: 0.375rem; }
            
            /* Sombras */
            .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
            
            /* Inputs */
            input, select, textarea {
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid rgb(209, 213, 219);
              border-radius: 0.375rem;
              font-size: 0.875rem;
            }
            
            /* Tablas con mejor formato para PDF */
            table { 
              width: 100% !important; 
              border-collapse: collapse !important;
              margin-top: 16px !important;
              page-break-inside: avoid !important;
            }
            th { 
              text-align: left !important; 
              padding: 12px 16px !important; 
              font-weight: 600 !important; 
              font-size: 11px !important; 
              text-transform: uppercase !important; 
              letter-spacing: 0.5px !important;
              color: rgb(17, 24, 39) !important; 
              background-color: rgb(243, 244, 246) !important;
              border-bottom: 2px solid rgb(209, 213, 219) !important;
            }
            td { 
              padding: 10px 16px !important; 
              border-bottom: 1px solid rgb(229, 231, 235) !important; 
              font-size: 13px !important;
              color: rgb(55, 65, 81) !important;
            }
            tbody tr:hover {
              background-color: rgb(249, 250, 251) !important;
            }
            .divide-y > * + * { border-top: 1px solid rgb(229, 231, 235) !important; }
            
            /* Recharts - Preservar colores pero asegurar formato RGB */
            .recharts-wrapper { background-color: transparent !important; }
            .recharts-surface { background-color: transparent !important; }
            /* Permitir que los colores específicos de Recharts se mantengan */
            /* Solo forzar RGB en líneas y barras si no tienen fill/stroke definido */
            .recharts-cartesian-grid-horizontal line,
            .recharts-cartesian-grid-vertical line {
              stroke: rgb(229, 231, 235) !important;
            }
            .recharts-tooltip-wrapper {
              background-color: rgb(255, 255, 255) !important;
              border: 1px solid rgb(229, 231, 235) !important;
              color: rgb(0, 0, 0) !important;
            }
            .recharts-legend-wrapper {
              color: rgb(0, 0, 0) !important;
            }
            
            /* Responsive */
            @media (min-width: 640px) {
              .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (min-width: 1024px) {
              .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });
      
      // Restaurar estilos originales después de capturar
      originalStyles.forEach(({ element, height, width, parentHeight }) => {
        element.style.height = height;
        element.style.width = width;
        const parent = element.parentElement;
        if (parent && parent.classList.contains('h-80')) {
          parent.style.height = parentHeight;
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular ratio para que el contenido ocupe el ancho completo menos márgenes
      const margin = 10; // 10mm de margen en cada lado
      const contentWidth = pdfWidth - (margin * 2);
      const ratio = contentWidth / imgWidth;
      const contentHeight = imgHeight * ratio;
      
      // Si el contenido cabe en una página
      if (contentHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
        // Dividir en múltiples páginas
        let yOffset = 0;
        let pageNum = 1;
        
        while (yOffset < imgHeight) {
          if (pageNum > 1) {
            pdf.addPage();
          }
          
          const remainingHeight = imgHeight - yOffset;
          const pageContentHeight = (pdfHeight - (margin * 2)) / ratio;
          const captureHeight = Math.min(pageContentHeight, remainingHeight);
          
          const pageCanvas = await html2canvas(reportElement, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            height: captureHeight,
            y: yOffset,
            windowWidth: reportElement.scrollWidth,
            windowHeight: captureHeight,
            onclone: (clonedDoc: Document) => {
              // Misma lógica de limpieza que arriba
              const svgElements = clonedDoc.querySelectorAll('svg, svg *');
              svgElements.forEach((el: Element) => {
                const htmlEl = el as HTMLElement;
                if (htmlEl.style) {
                  for (let i = 0; i < htmlEl.style.length; i++) {
                    const prop = htmlEl.style[i];
                    const value = htmlEl.style.getPropertyValue(prop);
                    if (value && (value.includes('lab(') || value.includes('oklab('))) {
                      htmlEl.style.removeProperty(prop);
                    }
                  }
                }
                ['fill', 'stroke'].forEach(attr => {
                  const val = el.getAttribute(attr);
                  if (val && (val.includes('lab(') || val.includes('oklab('))) {
                    el.removeAttribute(attr);
                  }
                });
              });
            },
          } as any);
          
          const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
          const pageImgHeight = (pageCanvas.height * contentWidth) / pageCanvas.width;
          pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageImgHeight);
          
          yOffset += captureHeight;
          pageNum++;
        }
      }
      
      const nombreArchivo = `reporte_${fechaInicio}_${fechaFin}.pdf`;
      pdf.save(nombreArchivo);
      
      // Restaurar las hojas de estilo originales
      originalLinks.forEach(({ link, disabled }) => {
        link.disabled = disabled;
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      
      // Asegurar restaurar las hojas de estilo incluso si hay error
      try {
        originalLinks.forEach(({ link, disabled }) => {
          link.disabled = disabled;
        });
      } catch (e) {
        // Si falla, al menos intentar restaurar todas las hojas de estilo
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          (link as HTMLLinkElement).disabled = false;
        });
      }
      
      // Mensaje de error más específico
      const errorMessage = error instanceof Error ? error.message : 'Desconocido';
      if (errorMessage.includes('lab(') || errorMessage.includes('color')) {
        alert('Error al generar el PDF debido a un problema con los estilos de color. Por favor, intenta refrescar la página y volver a exportar.');
      } else {
        alert('Error al generar el PDF. Por favor, intenta nuevamente. Error: ' + errorMessage);
      }
    }
  };

  return (
    <div id="reporte-completo" className="space-y-6">
      {/* Selector de fechas */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Rango de Fechas</h3>
          {canExportPDF ? (
            <button
              onClick={exportarPDF}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar a PDF
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Exportación PDF disponible en planes Starter y superiores</p>
              <Link
                href="/precios"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ver Planes
              </Link>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Producción Mensual */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Gráfico de Producción Mensual</h3>
        <div className="mt-4 h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={produccionMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="produccion" stroke="#3b82f6" strokeWidth={2} name="Producción (m³)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Análisis de Rentabilidad por Cliente */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Análisis de Rentabilidad por Cliente</h3>
        <div className="mt-4 h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentabilidadClientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cliente" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#10b981" name="Ventas ($)" />
                <Bar dataKey="pagos" fill="#3b82f6" name="Pagos Recibidos ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Cliente</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Ventas</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Pagos</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Pendiente</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">% Cobrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rentabilidadClientes.map((cliente, idx) => (
                <tr key={idx}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{cliente.cliente}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-500">
                    ${cliente.ventas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-green-600">
                    ${cliente.pagos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-red-600">
                    ${cliente.pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900">
                    {cliente.porcentaje.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparativa de Gastos por Categoría */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Comparativa de Gastos por Categoría</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoria, percent }: any) => `${categoria}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="monto"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gastosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="monto" fill="#ef4444" name="Gastos ($)">
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Categoría</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Monto</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {gastosPorCategoria.map((gasto, idx) => {
                const totalGastos = gastosPorCategoria.reduce((sum, g) => sum + g.monto, 0);
                const porcentaje = totalGastos > 0 ? (gasto.monto / totalGastos) * 100 : 0;
                return (
                  <tr key={idx}>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{gasto.categoria}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-500">
                      ${gasto.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900">
                      {porcentaje.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

