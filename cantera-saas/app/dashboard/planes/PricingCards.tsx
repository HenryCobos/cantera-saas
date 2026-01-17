'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { PLANS, formatPrice, getYearlyDiscount } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';

interface PricingCardsProps {
  currentPlan: PlanType;
  billingPeriod: 'monthly' | 'yearly';
}

export default function PricingCards({ currentPlan, billingPeriod }: PricingCardsProps) {
  const plans = Object.values(PLANS);

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
                disabled={isCurrentPlan}
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.id === 'free'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {isCurrentPlan ? 'Plan Actual' : plan.id === 'free' ? 'Plan Gratis' : 'Contactar Ventas'}
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
  );
}

