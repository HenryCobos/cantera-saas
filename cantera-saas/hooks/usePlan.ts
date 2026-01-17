'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PlanType } from '@/lib/plans';

export function usePlan(organizationId: string | null) {
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setPlan('free');
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('plan')
          .eq('id', organizationId)
          .single() as { data: { plan: string } | null; error: any };

        if (error) {
          console.warn('Error al obtener plan:', error);
          setPlan('free');
        } else if (data?.plan) {
          const validPlans: PlanType[] = ['free', 'starter', 'profesional', 'business'];
          if (validPlans.includes(data.plan as PlanType)) {
            setPlan(data.plan as PlanType);
          } else {
            setPlan('free');
          }
        } else {
          setPlan('free');
        }
      } catch (err) {
        console.warn('Error inesperado al obtener plan:', err);
        setPlan('free');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [organizationId]);

  return { plan, loading };
}

