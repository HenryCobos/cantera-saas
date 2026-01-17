import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import {
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

async function getDashboardData() {
  const supabase = await createClient();

  // Obtener organization_id
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };

  if (!orgId) {
    return null;
  }

  // Obtener cantera de la organización
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1);

  const canteraId = (canteras?.[0] as { id: string } | undefined)?.id;

  if (!canteraId) {
    return null;
  }

  const hoy = new Date().toISOString().split('T')[0];
  const hoyDate = new Date();
  const inicioMes = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 1).toISOString().split('T')[0];
  const inicioMesAnterior = new Date(hoyDate.getFullYear(), hoyDate.getMonth() - 1, 1).toISOString().split('T')[0];
  const finMesAnterior = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 0).toISOString().split('T')[0];

  // Métricas financieras del mes actual
  const { data: ventasMes } = await supabase
    .from('ventas')
    .select('total, estado_pago')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes);

  const { data: gastosMes } = await supabase
    .from('gastos')
    .select('monto')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes);

  const { data: ventasMesAnterior } = await supabase
    .from('ventas')
    .select('total')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMesAnterior)
    .lte('fecha', finMesAnterior);

  const { data: gastosMesAnterior } = await supabase
    .from('gastos')
    .select('monto')
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMesAnterior)
    .lte('fecha', finMesAnterior);

  // Calcular totales del mes
  const ingresosMes = (ventasMes || []).reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const gastosMesTotal = (gastosMes || []).reduce((sum: number, g: any) => sum + (g.monto || 0), 0);
  const utilidadMes = ingresosMes - gastosMesTotal;

  // Calcular totales mes anterior para comparación
  const ingresosMesAnterior = (ventasMesAnterior || []).reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const gastosMesAnteriorTotal = (gastosMesAnterior || []).reduce((sum: number, g: any) => sum + (g.monto || 0), 0);

  // Pendiente por cobrar (ventas con saldo pendiente)
  const { data: ventasPendientes } = await supabase
    .from('ventas')
    .select(`
      id,
      total,
      numero_factura,
      fecha,
      cliente:clientes(nombre)
    `)
    .eq('cantera_id', canteraId)
    .in('estado_pago', ['pendiente', 'parcial'])
    .limit(10);

  // Calcular saldo pendiente por venta
  let pendientePorCobrar = 0;
  const ventasConSaldo: any[] = [];
  
  if (ventasPendientes) {
    const ventasArray = ventasPendientes as any[];
    for (const venta of ventasArray) {
      const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .eq('venta_id', venta.id);
      
      const totalPagado = (pagos || []).reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
      const saldoPendiente = venta.total - totalPagado;
      pendientePorCobrar += saldoPendiente;
      
      if (saldoPendiente > 0) {
        ventasConSaldo.push({
          ...venta,
          saldoPendiente,
        });
      }
    }
  }

  // Actividad reciente
  const { data: ultimasVentas } = await supabase
    .from('ventas')
    .select(`
      id,
      numero_factura,
      total,
      fecha,
      estado_pago,
      cliente:clientes(nombre)
    `)
    .eq('cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(5);

  const { data: ultimosPagos } = await supabase
    .from('pagos')
    .select(`
      id,
      monto,
      fecha,
      venta:ventas!inner(
        numero_factura,
        cantera_id,
        cliente:clientes(nombre)
      )
    `)
    .eq('venta.cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(5);

  const { data: ultimaProduccion } = await supabase
    .from('produccion')
    .select('*')
    .eq('cantera_id', canteraId)
    .order('fecha', { ascending: false })
    .limit(3);

  // Alertas
  const { data: stockBajo } = await supabase
    .from('inventario')
    .select(`
      id,
      cantidad,
      cantidad_minima,
      tipo_agregado:tipos_agregados(nombre)
    `)
    .eq('cantera_id', canteraId);

  const stockBajoFiltrado = (stockBajo || []).filter((inv: any) => inv.cantidad < inv.cantidad_minima);

  const { data: clientesMorosos } = await supabase
    .from('ventas')
    .select(`
      id,
      numero_factura,
      total,
      fecha_vencimiento,
      cliente:clientes(nombre)
    `)
    .eq('cantera_id', canteraId)
    .in('estado_pago', ['pendiente', 'parcial'])
    .lte('fecha_vencimiento', hoy)
    .limit(10);

  // Resumen transporte
  const { count: viajesHoy } = await supabase
    .from('viajes')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .eq('fecha', hoy);

  const { count: camionesActivos } = await supabase
    .from('camiones')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .eq('estado', 'activo');

  const { count: choferesActivos } = await supabase
    .from('choferes')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .eq('estado', 'activo');

  // KPIs del día
  const { count: produccionHoy } = await supabase
    .from('produccion')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .eq('fecha', hoy);

  const { count: ventasHoy } = await supabase
    .from('ventas')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .eq('fecha', hoy);

  return {
    canteraId,
    // Métricas financieras
    ingresosMes,
    gastosMesTotal,
    utilidadMes,
    ingresosMesAnterior,
    gastosMesAnteriorTotal,
    pendientePorCobrar,
    ventasConSaldo: ventasConSaldo.slice(0, 5),
    // Actividad reciente
    ultimasVentas: ultimasVentas || [],
    ultimosPagos: ultimosPagos || [],
    ultimaProduccion: ultimaProduccion || [],
    // Alertas
    stockBajo: stockBajoFiltrado,
    clientesMorosos: clientesMorosos || [],
    // Transporte
    viajesHoy: viajesHoy || 0,
    camionesActivos: camionesActivos || 0,
    choferesActivos: choferesActivos || 0,
    // KPIs del día
    produccionHoy: produccionHoy || 0,
    ventasHoy: ventasHoy || 0,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-gray-500">No hay datos disponibles. Configura tu cantera primero.</p>
          </div>
        </div>
      </>
    );
  }

  const variacionIngresos = data.ingresosMesAnterior > 0
    ? ((data.ingresosMes - data.ingresosMesAnterior) / data.ingresosMesAnterior) * 100
    : 0;

  const variacionGastos = data.gastosMesAnteriorTotal > 0
    ? ((data.gastosMesTotal - data.gastosMesAnteriorTotal) / data.gastosMesAnteriorTotal) * 100
    : 0;

  const metricasFinancieras = [
    {
      name: 'Ingresos del Mes',
      value: data.ingresosMes,
      previous: data.ingresosMesAnterior,
      variation: variacionIngresos,
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100/50',
      textColor: 'text-green-900',
      borderColor: 'border-green-200',
    },
    {
      name: 'Gastos del Mes',
      value: data.gastosMesTotal,
      previous: data.gastosMesAnteriorTotal,
      variation: variacionGastos,
      icon: ChartBarIcon,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100/50',
      textColor: 'text-red-900',
      borderColor: 'border-red-200',
    },
    {
      name: 'Utilidad Neta',
      value: data.utilidadMes,
      icon: CurrencyDollarIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100/50',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-200',
      isUtilidad: true,
    },
    {
      name: 'Pendiente por Cobrar',
      value: data.pendientePorCobrar,
      icon: ClockIcon,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'from-yellow-50 to-orange-100/50',
      textColor: 'text-yellow-900',
      borderColor: 'border-yellow-200',
    },
  ];

  const kpisDia = [
    {
      name: 'Producción Hoy',
      value: data.produccionHoy,
      icon: CubeIcon,
      color: 'bg-blue-500',
      href: '/dashboard/produccion',
    },
    {
      name: 'Ventas Hoy',
      value: data.ventasHoy,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      href: '/dashboard/ventas',
    },
    {
      name: 'Viajes Hoy',
      value: data.viajesHoy,
      icon: TruckIcon,
      color: 'bg-purple-500',
      href: '/dashboard/transporte',
    },
    {
      name: 'Stock Bajo',
      value: data.stockBajo.length,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/dashboard/inventario',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Métricas Financieras Principales */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Métricas Financieras del Mes</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricasFinancieras.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.name}
                  className={`group relative overflow-hidden rounded-xl border-2 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${metric.borderColor} bg-gradient-to-br ${metric.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${metric.textColor}`}>{metric.name}</h3>
                      <p className={`mt-3 text-3xl font-bold ${metric.textColor}`}>
                        ${metric.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                      {metric.previous !== undefined && metric.previous > 0 && (
                        <div className="mt-2 flex items-center text-xs">
                          {metric.variation >= 0 ? (
                            <>
                              <ArrowUpIcon className="mr-1 h-4 w-4 text-green-600" />
                              <span className="text-green-600">+{Math.abs(metric.variation).toFixed(1)}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownIcon className="mr-1 h-4 w-4 text-red-600" />
                              <span className="text-red-600">{metric.variation.toFixed(1)}%</span>
                            </>
                          )}
                          <span className="ml-2 text-gray-500">vs mes anterior</span>
                        </div>
                      )}
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${metric.color} shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPIs del Día */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Indicadores de Hoy</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpisDia.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Link
                  key={kpi.name}
                  href={kpi.href}
                  className="overflow-hidden rounded-lg bg-white p-5 shadow transition-all hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className={`${kpi.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">{kpi.name}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{kpi.value}</dd>
                      </dl>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Actividad Reciente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Últimas Ventas */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Últimas Ventas</h3>
                  <Link href="/dashboard/ventas" className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todas
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {data.ultimasVentas.length === 0 ? (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">No hay ventas recientes</div>
                ) : (
                  data.ultimasVentas.map((venta: any) => (
                    <Link
                      key={venta.id}
                      href={`/dashboard/ventas/${venta.id}`}
                      className="block px-6 py-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{venta.numero_factura}</p>
                          <p className="text-sm text-gray-500">{venta.cliente?.nombre || 'Sin cliente'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${venta.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(venta.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Últimos Pagos */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Últimos Pagos Recibidos</h3>
                  <Link href="/dashboard/pagos" className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todos
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {data.ultimosPagos.length === 0 ? (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">No hay pagos recientes</div>
                ) : (
                  data.ultimosPagos.map((pago: any) => (
                    <Link
                      key={pago.id}
                      href="/dashboard/pagos"
                      className="block px-6 py-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Factura: {pago.venta?.numero_factura || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">{pago.venta?.cliente?.nombre || 'Sin cliente'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            ${pago.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(pago.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Alertas y Resumen */}
          <div className="space-y-6">
            {/* Alertas */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Alertas y Pendientes</h3>
              </div>
              <div className="space-y-4 p-6">
                {/* Stock Bajo */}
                {data.stockBajo.length > 0 && (
                  <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      <h4 className="ml-2 font-semibold text-yellow-900">Stock Bajo ({data.stockBajo.length})</h4>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {data.stockBajo.slice(0, 3).map((item: any) => (
                        <li key={item.id} className="text-sm text-yellow-800">
                          • {item.tipo_agregado?.nombre || 'N/A'} ({item.cantidad.toFixed(2)} / {item.cantidad_minima.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                    <Link href="/dashboard/inventario" className="mt-2 block text-sm font-medium text-yellow-700 hover:text-yellow-900">
                      Ver inventario →
                    </Link>
                  </div>
                )}

                {/* Clientes Morosos */}
                {data.clientesMorosos.length > 0 && (
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <h4 className="ml-2 font-semibold text-red-900">Clientes Morosos ({data.clientesMorosos.length})</h4>
                    </div>
                    <Link href="/dashboard/ventas" className="mt-2 block text-sm font-medium text-red-700 hover:text-red-900">
                      Ver ventas pendientes →
                    </Link>
                  </div>
                )}

                {data.stockBajo.length === 0 && data.clientesMorosos.length === 0 && (
                  <p className="text-center text-sm text-gray-500">No hay alertas pendientes</p>
                )}
              </div>
            </div>

            {/* Resumen Transporte */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Transporte</h3>
                  <Link href="/dashboard/transporte" className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todo
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Viajes Hoy</span>
                  <span className="text-lg font-semibold text-gray-900">{data.viajesHoy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Camiones Activos</span>
                  <span className="text-lg font-semibold text-gray-900">{data.camionesActivos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Choferes Activos</span>
                  <span className="text-lg font-semibold text-gray-900">{data.choferesActivos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Accesos Rápidos</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            <Link
              href="/dashboard/ventas/nuevo"
              className="flex flex-col items-center rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center transition-all hover:bg-blue-100"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              <span className="mt-2 text-sm font-medium text-blue-900">Nueva Venta</span>
            </Link>
            <Link
              href="/dashboard/pagos/nuevo"
              className="flex flex-col items-center rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center transition-all hover:bg-green-100"
            >
              <PlusIcon className="h-8 w-8 text-green-600" />
              <span className="mt-2 text-sm font-medium text-green-900">Registrar Pago</span>
            </Link>
            <Link
              href="/dashboard/produccion/nuevo"
              className="flex flex-col items-center rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-center transition-all hover:bg-purple-100"
            >
              <CubeIcon className="h-8 w-8 text-purple-600" />
              <span className="mt-2 text-sm font-medium text-purple-900">Nueva Producción</span>
            </Link>
            <Link
              href="/dashboard/gastos/nuevo"
              className="flex flex-col items-center rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center transition-all hover:bg-red-100"
            >
              <ChartBarIcon className="h-8 w-8 text-red-600" />
              <span className="mt-2 text-sm font-medium text-red-900">Nuevo Gasto</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
