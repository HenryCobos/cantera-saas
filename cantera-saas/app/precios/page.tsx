'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';
import { PLANS, formatPrice, getYearlyDiscount } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';

export default function PreciosPage() {
  const plans = Object.values(PLANS);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Cantera SaaS
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Inicio
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

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Precios simples y transparentes
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Elige el plan que mejor se adapte a tu cantera. Puedes cambiar o cancelar en cualquier momento.
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">Ahorra 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const discount = plan.price.monthly > 0 
                ? getYearlyDiscount(plan.price.monthly, plan.price.yearly) 
                : 0;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                    plan.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                      Más Popular
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="mb-6">
                      {plan.price.monthly === 0 ? (
                        <div>
                          <span className="text-4xl font-extrabold text-gray-900">Gratis</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-extrabold text-gray-900">
                              {formatPrice(billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly)}
                            </span>
                            <span className="text-gray-600 ml-2">
                              {billingPeriod === 'monthly' ? '/mes' : '/año'}
                            </span>
                          </div>
                          {billingPeriod === 'yearly' && discount > 0 && (
                            <div className="mt-2">
                              <span className="text-sm text-green-600 font-medium">
                                Ahorra {discount}% vs plan mensual
                              </span>
                            </div>
                          )}
                          {billingPeriod === 'monthly' && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">
                                {formatPrice(plan.price.yearly)}/año
                              </span>
                              {discount > 0 && (
                                <span className="ml-2 text-sm text-green-600 font-medium">
                                  (Ahorra {discount}%)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/auth/register"
                      className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.id === 'free'
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.id === 'free' ? 'Comenzar Gratis' : 'Registrarse'}
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 px-6 py-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {plan.id !== 'free' && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        * Integración con Hotmart próximamente
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Comparación de características
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Característica</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Canteras</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.canteras === 'unlimited' ? 'Ilimitadas' : plan.limits.canteras}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Usuarios</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.usuarios === 'unlimited' ? 'Ilimitados' : plan.limits.usuarios}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Producción mensual</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.produccionMensual === 'unlimited' ? 'Ilimitada' : plan.limits.produccionMensual}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Ventas mensuales</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.ventasMensual === 'unlimited' ? 'Ilimitadas' : plan.limits.ventasMensual}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Clientes</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.clientes === 'unlimited' ? 'Ilimitados' : plan.limits.clientes}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Exportación PDF</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      {plan.limits.exportacionPDF ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Exportación Excel</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      {plan.limits.exportacionExcel ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Reportes avanzados</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      {plan.limits.reportesAvanzados ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">API</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      {plan.limits.api ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Soporte</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                      {plan.limits.soporte === 'dedicado' 
                        ? 'Dedicado' 
                        : plan.limits.soporte === 'prioritario' 
                        ? 'Prioritario' 
                        : 'Email'} ({plan.limits.soporteTiempo})
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Necesito instalar algo?
              </h3>
              <p className="text-gray-600">
                No, es 100% en la nube. Solo necesitas un navegador y conexión a internet. Accede desde cualquier dispositivo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Qué pasa con mis datos?
              </h3>
              <p className="text-gray-600">
                Tus datos están seguros y protegidos. Hacemos backup automático diario y nunca compartimos tu información.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Puedo cancelar cuando quiera?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones. No hay contratos a largo plazo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Funciona en móviles?
              </h3>
              <p className="text-gray-600">
                Sí, la plataforma es completamente responsive y funciona perfectamente en tablets y smartphones.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Ofrecen período de prueba?
              </h3>
              <p className="text-gray-600">
                El plan gratuito es ilimitado en tiempo, puedes usarlo para siempre. Los planes pagos incluyen 30 días de garantía de satisfacción.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comienza con el plan gratuito y actualiza cuando necesites más características
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Comenzar Gratis Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="text-white text-2xl font-bold mb-4 inline-block">
            Cantera SaaS
          </Link>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Cantera SaaS. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

