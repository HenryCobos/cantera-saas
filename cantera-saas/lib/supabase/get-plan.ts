import { createClient } from '@/lib/supabase/server';
import type { PlanType } from '@/lib/plans';
import { getActiveSubscription, isSubscriptionActive } from '@/lib/subscriptions';

/**
 * Obtiene el plan actual de la organización del usuario
 * Prioriza suscripción activa sobre plan de organizations
 */
export async function getUserPlan(): Promise<PlanType> {
  const supabase = await createClient();
  
  // Obtener organization_id del usuario
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return 'free'; // Plan por defecto si no hay organización
  }

  // PRIMERO: Verificar si hay una suscripción activa
  const activeSubscription = await getActiveSubscription();
  
  if (activeSubscription && isSubscriptionActive(activeSubscription)) {
    // Si hay suscripción activa, usar el plan de la suscripción
    const validPlans: PlanType[] = ['free', 'starter', 'profesional', 'business'];
    if (validPlans.includes(activeSubscription.plan as PlanType)) {
      return activeSubscription.plan as PlanType;
    }
  }

  // SEGUNDO: Si no hay suscripción activa, usar el plan de la organización (fallback)
  const { data: organization } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single() as { data: { plan: string | null } | null };

  if (!organization?.plan) {
    return 'free';
  }

  // Validar que el plan sea válido, si no, retornar 'free'
  const validPlans: PlanType[] = ['free', 'starter', 'profesional', 'business'];
  if (validPlans.includes(organization.plan as PlanType)) {
    return organization.plan as PlanType;
  }

  return 'free';
}

/**
 * Verifica si el usuario tiene acceso a una característica específica
 */
export async function hasFeature(feature: 'exportacionPDF' | 'exportacionExcel' | 'reportesAvanzados' | 'api' | 'integraciones'): Promise<boolean> {
  const plan = await getUserPlan();
  const { getPlanLimits } = await import('@/lib/plans');
  const limits = getPlanLimits(plan);
  
  return limits[feature] === true;
}

