'use client';

import { useState } from 'react';
import PricingCards from './PricingCards';
import type { PlanType } from '@/lib/plans';

interface PlansSectionProps {
  currentPlan: PlanType;
}

export default function PlansSection({ currentPlan }: PlansSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            billingPeriod === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
            billingPeriod === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          Anual
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">Ahorra 17%</span>
        </button>
      </div>
      <PricingCards currentPlan={currentPlan} billingPeriod={billingPeriod} />
    </div>
  );
}

