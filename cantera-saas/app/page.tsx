import Link from 'next/link';
import {
  CheckCircleIcon,
  ChartBarIcon,
  CubeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Esta página NO debe usar Supabase directamente para evitar errores que causen 404
// La redirección para usuarios autenticados se maneja en el middleware
export default function Home() {

  const features = [
    {
      name: 'Control de Producción',
      description: 'Registra y monitorea tu producción diaria en tiempo real con actualización automática de inventario.',
      icon: CubeIcon,
    },
    {
      name: 'Gestión de Inventario',
      description: 'Control total de stock con alertas automáticas cuando el inventario está bajo.',
      icon: ChartBarIcon,
    },
    {
      name: 'Ventas y Cobranzas',
      description: 'Gestiona ventas al contado y crédito, con seguimiento de pagos y cuentas por cobrar.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Gestión de Clientes',
      description: 'Base de datos completa de clientes con límites de crédito y historial de compras.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Control de Transporte',
      description: 'Administra camiones, choferes y viajes de forma eficiente.',
      icon: TruckIcon,
    },
    {
      name: 'Reportes Avanzados',
      description: 'Análisis financiero y operativo con gráficos interactivos y exportación a PDF.',
      icon: DocumentChartBarIcon,
    },
  ];

  const benefits = [
    'Reduce errores en inventario hasta en un 95%',
    'Ahorra hasta 10 horas semanales en tareas administrativas',
    'Mejora el control de cobranzas y reduce cuentas pendientes',
    'Toma decisiones basadas en datos en tiempo real',
    'Multi-usuario con permisos granulares por rol',
    '100% en la nube, accede desde cualquier dispositivo',
  ];

  const testimonials = [
    {
      name: 'Roberto Martínez',
      role: 'Gerente de Cantera',
      company: 'Canteras del Norte',
      quote: 'Desde que usamos esta herramienta, redujimos nuestros errores de inventario casi por completo. El ROI fue inmediato.',
    },
    {
      name: 'María González',
      role: 'Directora Financiera',
      company: 'Agregados Sur',
      quote: 'Los reportes nos permiten tomar decisiones mucho más rápido. Ya no perdemos días consolidando información de Excel.',
    },
    {
      name: 'Carlos Ramírez',
      role: 'Propietario',
      company: 'Cantera San José',
      quote: 'La mejor inversión que hicimos. El control de cobranzas mejoró significativamente nuestras finanzas.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Cantera SaaS</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Características
                </Link>
                <Link href="/precios" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Precios
                </Link>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Comenzar Gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Gestiona tu Cantera de Agregados de{' '}
              <span className="text-blue-600">Forma Profesional</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Control total de producción, ventas, inventario y finanzas. Todo en un solo lugar, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Prueba Gratis - Sin Tarjeta
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Ver Características
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">Sin tarjeta de crédito • Sin límite de tiempo • Cancelas cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Pierdes dinero por falta de control?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                      <span className="text-red-600 text-xl">×</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Errores en inventario que cuestan miles de dólares</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                      <span className="text-red-600 text-xl">×</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Pagos perdidos por falta de seguimiento</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                      <span className="text-red-600 text-xl">×</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Reportes desactualizados que no ayudan a tomar decisiones</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Toma decisiones inteligentes en tiempo real
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Inventario actualizado automáticamente con cada producción</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Seguimiento completo de cobranzas y cuentas por cobrar</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">Reportes financieros que te ayudan a crecer tu negocio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tu cantera
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para canteras de agregados
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-xl font-semibold text-gray-900">{feature.name}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Beneficios Comprobados</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Miles de canteras ya están optimizando sus operaciones con nuestra plataforma
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-blue-200 mr-3 mt-1 flex-shrink-0" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            ¿Listo para transformar tu cantera?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de canteras que ya están optimizando sus operaciones
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Empezar Gratis Ahora
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-sm text-blue-200 mt-4">Sin tarjeta de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Cantera SaaS</h3>
              <p className="text-sm">
                Sistema de gestión integral para canteras de agregados
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/precios" className="hover:text-white">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Cantera SaaS. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
