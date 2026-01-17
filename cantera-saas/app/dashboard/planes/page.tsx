import Header from '@/components/layout/Header';
import { CheckIcon } from '@heroicons/react/24/solid';
import { PLANS } from '@/lib/plans';
import { getUserPlan } from '@/lib/supabase/get-plan';
import PlansSection from './PlansSection';

export default async function PlanesPage() {
  const plans = Object.values(PLANS);
  const currentPlan = await getUserPlan();

  return (
    <>
      <Header title="Planes y Precios" />
      <div className="p-6 bg-gray-100 min-h-full pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Elige el plan perfecto para tu cantera
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Puedes cambiar o cancelar tu plan en cualquier momento.
          </p>
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <CheckIcon className="h-5 w-5 mr-2" />
            Plan actual: <span className="font-bold ml-1">{PLANS[currentPlan].name}</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <PlansSection currentPlan={currentPlan} />

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto mt-12 mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Comparación detallada de características
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Característica</th>
                    {plans.map((plan) => (
                      <th 
                        key={plan.id} 
                        className={`text-center py-4 px-4 font-semibold ${
                          plan.id === currentPlan ? 'text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {plan.name}
                        {plan.id === currentPlan && (
                          <span className="block text-xs font-normal text-green-600 mt-1">(Actual)</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700 font-medium">Canteras</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                        {plan.limits.canteras === 'unlimited' ? 'Ilimitadas' : plan.limits.canteras}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">Usuarios</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                        {plan.limits.usuarios === 'unlimited' ? 'Ilimitados' : plan.limits.usuarios}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700 font-medium">Producción mensual</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                        {plan.limits.produccionMensual === 'unlimited' ? 'Ilimitada' : plan.limits.produccionMensual}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">Ventas mensuales</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                        {plan.limits.ventasMensual === 'unlimited' ? 'Ilimitadas' : plan.limits.ventasMensual}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700 font-medium">Clientes</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center text-gray-600">
                        {plan.limits.clientes === 'unlimited' ? 'Ilimitados' : plan.limits.clientes}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">Exportación PDF</td>
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
                    <td className="py-4 px-4 text-gray-700 font-medium">Exportación Excel</td>
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
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">Reportes avanzados</td>
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
                    <td className="py-4 px-4 text-gray-700 font-medium">API</td>
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
                  <tr className="bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">Soporte</td>
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
        </div>

        {/* Espacio adicional al final */}
        <div className="h-8"></div>
      </div>
    </>
  );
}

