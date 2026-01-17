'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { PLANS, formatPrice, getYearlyDiscount } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';
import { useAuth } from '@/hooks/useAuth';
import { generateHotmartCheckoutUrl, HOTMART_OFF_TO_PLAN } from '@/lib/hotmart-config';

interface PricingCardsProps {
  currentPlan: PlanType;
  billingPeriod: 'monthly' | 'yearly';
}

export default function PricingCards({ currentPlan, billingPeriod }: PricingCardsProps) {
  const plans = Object.values(PLANS);
  const { profile, loading: authLoading } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof PLANS[PlanType]) => {
    // No permitir comprar el plan actual
    if (plan.id === currentPlan) {
      return;
    }

    // No permitir comprar el plan free
    if (plan.id === 'free') {
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!profile?.email) {
      alert('Debes estar autenticado para comprar un plan. Por favor, inicia sesión.');
      return;
    }

    // Verificar que haya códigos de oferta configurados
    const offCodes = Object.keys(HOTMART_OFF_TO_PLAN);
    if (offCodes.length === 0) {
      alert('Los planes aún no están configurados. Por favor, contacta al administrador.');
      return;
    }

    // Verificar que el plan y período de facturación estén disponibles
    const isAvailable = offCodes.some(off => {
      const mapping = HOTMART_OFF_TO_PLAN[off];
      return mapping?.plan === plan.id && mapping?.billingPeriod === billingPeriod;
    });

    if (!isAvailable) {
      alert(`El plan ${plan.name} (${billingPeriod === 'monthly' ? 'mensual' : 'anual'}) aún no está disponible en Hotmart. Por favor, contacta al administrador.`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);

      // Generar URL de checkout de Hotmart
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const returnUrl = `${appUrl}/dashboard/planes/success`;
      const cancelUrl = `${appUrl}/dashboard/planes/cancel`;
      
      // Obtener organization_id si está disponible en el perfil
      const organizationId = (profile as any)?.organization_id as string | undefined;
      
      const checkoutUrl = generateHotmartCheckoutUrl(
        plan.id as 'starter' | 'profesional' | 'business',
        billingPeriod,
        profile.email,
        returnUrl,
        organizationId
      );

      // Redirigir a Hotmart
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error al generar URL de Hotmart:', error);
      alert('Error al procesar la compra. Por favor, intenta de nuevo.');
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {plans.map((plan) => {
        const discount = plan.price.monthly > 0 
          ? getYearlyDiscount(plan.price.monthly, plan.price.yearly) 
          : 0;
        const isCurrentPlan = plan.id === currentPlan;

        return (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
              isCurrentPlan 
                ? 'border-blue-600 ring-2 ring-blue-200' 
                : plan.popular 
                ? 'border-blue-300 ring-2 ring-blue-100' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && !isCurrentPlan && (
              <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                Más Popular
              </div>
            )}
            {isCurrentPlan && (
              <div className="bg-green-600 text-white text-center py-2 text-sm font-semibold">
                Tu Plan Actual
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
              <button
                disabled={isCurrentPlan || plan.id === 'free' || authLoading || loadingPlanId === plan.id}
                onClick={() => handlePurchase(plan)}
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600'
                    : plan.id === 'free'
                    ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-default'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {loadingPlanId === plan.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redirigiendo...
                  </span>
                ) : isCurrentPlan ? (
                  'Plan Actual'
                ) : plan.id === 'free' ? (
                  'Plan Gratis'
                ) : (
                  `Comprar ${billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}`
                )}
              </button>
            </div>
            <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            {plan.id !== 'free' && Object.keys(HOTMART_OFF_TO_PLAN).length === 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  * Configuración pendiente
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

