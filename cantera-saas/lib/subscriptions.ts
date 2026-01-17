// Utilidades para gestionar suscripciones

import { createClient } from '@/lib/supabase/server';
import type { PlanType } from '@/lib/plans';

export interface Subscription {
  id: string;
  organization_id: string;
  plan: PlanType;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'pending_payment';
  billing_period: 'monthly' | 'yearly' | null;
  hotmart_transaction_id: string | null;
  hotmart_subscription_id: string | null;
  hotmart_product_id: string | null;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  next_billing_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene la suscripción activa de la organización del usuario actual
 */
export async function getActiveSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();

  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return null;
  }

  // Obtener suscripción activa
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !subscription) {
    return null;
  }

  return subscription as Subscription;
}

/**
 * Verifica si una suscripción está activa y válida
 */
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) {
    return false;
  }

  if (subscription.status !== 'active') {
    return false;
  }

  // Si tiene fecha de expiración, verificar que no haya expirado
  if (subscription.expires_at) {
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    return expiresAt > now;
  }

  return true;
}

/**
 * Crea o actualiza una suscripción desde un webhook de Hotmart
 */
export async function createOrUpdateSubscription(
  organizationId: string,
  plan: PlanType,
  data: {
    hotmartTransactionId: string;
    hotmartSubscriptionId?: string;
    hotmartProductId?: string;
    billingPeriod?: 'monthly' | 'yearly';
    status?: Subscription['status'];
    expiresAt?: Date;
    nextBillingDate?: Date;
    buyerEmail?: string;
    metadata?: Record<string, any>;
  }
): Promise<Subscription | null> {
  const supabase = await createClient();

  // Buscar si ya existe una suscripción con este transaction_id
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('hotmart_transaction_id', data.hotmartTransactionId)
    .single() as { data: { id: string } | null };

  const subscriptionData = {
    organization_id: organizationId,
    plan: plan,
    status: data.status || 'active',
    billing_period: data.billingPeriod || null,
    hotmart_transaction_id: data.hotmartTransactionId,
    hotmart_subscription_id: data.hotmartSubscriptionId || null,
    hotmart_product_id: data.hotmartProductId || null,
    hotmart_buyer_email: data.buyerEmail || null,
    expires_at: data.expiresAt?.toISOString() || null,
    next_billing_date: data.nextBillingDate?.toISOString() || null,
    metadata: data.metadata || {},
  };

  let result;

  if (existing) {
    // Actualizar suscripción existente
    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData as never)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return null;
    }

    result = updated;
  } else {
    // Crear nueva suscripción
    // Primero, cancelar o expirar suscripciones activas anteriores de esta organización
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() } as never)
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    // Crear nueva suscripción
    const { data: created, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        started_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    result = created;
  }

  return result as Subscription;
}

/**
 * Cancela una suscripción
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    } as never)
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }

  // Registrar en historial
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('organization_id, plan')
    .eq('id', subscriptionId)
    .single() as { data: { organization_id: string; plan: string } | null };

  if (subscription) {
    await supabase.from('subscription_history').insert({
      subscription_id: subscriptionId,
      organization_id: subscription.organization_id,
      old_plan: subscription.plan,
      new_plan: subscription.plan,
      old_status: 'active',
      new_status: 'cancelled',
      reason: reason || 'manual_cancellation',
    } as never);
  }

  return true;
}

