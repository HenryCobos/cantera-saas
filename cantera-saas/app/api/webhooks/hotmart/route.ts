import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrUpdateSubscription, cancelSubscription } from '@/lib/subscriptions';
import { getPlanFromHotmartProduct } from '@/lib/hotmart-config';
import crypto from 'crypto';

// Validar firma HMAC del webhook de Hotmart
function validateHotmartSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const calculatedSignature = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Error validating Hotmart signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hotmart-hottok') || request.headers.get('x-hotmart-signature') || '';

    // Obtener secret de Hotmart desde variables de entorno
    const hotmartSecret = process.env.HOTMART_SECRET || process.env.HOTMART_WEBHOOK_SECRET;
    
    if (!hotmartSecret) {
      console.error('HOTMART_SECRET no está configurado en variables de entorno');
      // En desarrollo, podríamos permitir continuar sin validación
      // En producción, esto debe fallar
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        );
      }
    } else {
      // Validar firma HMAC si está configurado
      if (signature && !validateHotmartSignature(body, signature, hotmartSecret)) {
        console.error('Invalid Hotmart webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parsear el payload (Hotmart envía datos como form-data o JSON según el evento)
    let eventData: any;
    try {
      // Hotmart puede enviar como form-data o JSON
      if (body.startsWith('{')) {
        eventData = JSON.parse(body);
      } else {
        // Parsear form-data
        const params = new URLSearchParams(body);
        eventData = Object.fromEntries(params);
      }
    } catch (parseError) {
      console.error('Error parsing webhook payload:', parseError);
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    const eventType = eventData.event || eventData.event_type || '';
    console.log(`Received Hotmart webhook: ${eventType}`, eventData);

    const supabase = await createClient();

    // Procesar diferentes tipos de eventos
    switch (eventType) {
      case 'PURCHASE_APPROVED':
      case 'PURCHASE_COMPLETE': {
        // Primera compra o renovación de suscripción
        const transactionId = eventData.data?.purchase?.transaction || eventData.data?.transaction_id || eventData.transaction;
        const productId = eventData.data?.product?.id || eventData.data?.product_id || eventData.product_id;
        const buyerEmail = eventData.data?.buyer?.email || eventData.data?.buyer_email || eventData.buyer_email;
        const subscriptionId = eventData.data?.subscription?.id || eventData.data?.subscription_id || eventData.subscription_id;
        
        // Obtener el precio pagado (importante para identificar el plan cuando Product ID es el mismo)
        const priceValue = eventData.data?.purchase?.price?.value || 
                          eventData.data?.purchase?.price ||
                          eventData.data?.price?.value ||
                          eventData.data?.price ||
                          eventData.price?.value ||
                          eventData.price;
        
        // Obtener el plan correspondiente (usando Product ID y precio)
        const planInfo = getPlanFromHotmartProduct(productId || '', priceValue, eventData);
        if (!planInfo.plan) {
          console.error(`No se pudo determinar el plan para product_id: ${productId}, price: ${priceValue}`);
          console.error('Webhook data:', JSON.stringify(eventData, null, 2));
          return NextResponse.json(
            { error: 'Unknown product ID or price' },
            { status: 400 }
          );
        }

        const plan = planInfo.plan;

        // Buscar organización por email del comprador
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('email', buyerEmail)
          .single();

        const profileData = profile as { organization_id: string } | null;
        if (!profileData?.organization_id) {
          console.error(`No se encontró organización para email: ${buyerEmail}`);
          return NextResponse.json(
            { error: 'Organization not found' },
            { status: 404 }
          );
        }

        // Calcular fechas de expiración y próxima facturación
        const now = new Date();
        const billingPeriod = planInfo.billingPeriod || (eventData.data?.recurrence?.toLowerCase().includes('year') ? 'yearly' : 'monthly');
        let expiresAt: Date | undefined;
        let nextBillingDate: Date | undefined;

        if (billingPeriod === 'monthly') {
          expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          nextBillingDate = new Date(expiresAt);
        } else if (billingPeriod === 'yearly') {
          expiresAt = new Date(now);
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          nextBillingDate = new Date(expiresAt);
        }

        // Crear o actualizar suscripción
        const subscription = await createOrUpdateSubscription(
          profileData.organization_id,
          plan,
          {
            hotmartTransactionId: transactionId,
            hotmartSubscriptionId: subscriptionId,
            hotmartProductId: productId,
            billingPeriod: billingPeriod,
            status: 'active',
            expiresAt: expiresAt,
            nextBillingDate: nextBillingDate,
            buyerEmail: buyerEmail,
            metadata: { eventType, rawData: eventData },
          }
        );

        if (!subscription) {
          return NextResponse.json(
            { error: 'Failed to create/update subscription' },
            { status: 500 }
          );
        }

        // Registrar en historial
        await (supabase.from('subscription_history') as any).insert({
          subscription_id: subscription.id,
          organization_id: profileData.organization_id,
          old_plan: null,
          new_plan: plan,
          old_status: null,
          new_status: 'active',
          reason: 'hotmart_webhook',
          hotmart_event_id: transactionId,
          hotmart_event_type: eventType,
          metadata: { rawData: eventData },
        });

        return NextResponse.json({ success: true, subscription_id: subscription.id });
      }

      case 'SUBSCRIPTION_CANCELLATION':
      case 'SUBSCRIPTION_CANCELLED': {
        // Cancelación de suscripción
        const subscriptionId = eventData.data?.subscription?.id || eventData.data?.subscription_id || eventData.subscription_id;
        const transactionId = eventData.data?.purchase?.transaction || eventData.transaction;

        if (!subscriptionId && !transactionId) {
          return NextResponse.json(
            { error: 'Missing subscription or transaction ID' },
            { status: 400 }
          );
        }

        // Buscar suscripción
        const query = subscriptionId
          ? supabase.from('subscriptions').select('*').eq('hotmart_subscription_id', subscriptionId)
          : supabase.from('subscriptions').select('*').eq('hotmart_transaction_id', transactionId);

        const { data: subscriptions } = await query.limit(1);

        if (!subscriptions || subscriptions.length === 0) {
          console.error(`Suscripción no encontrada para ID: ${subscriptionId || transactionId}`);
          return NextResponse.json(
            { error: 'Subscription not found' },
            { status: 404 }
          );
        }

        const subscription = subscriptions[0] as any;

        // Cancelar suscripción
        await cancelSubscription(subscription.id, 'hotmart_webhook_cancellation');

        return NextResponse.json({ success: true });
      }

      case 'SUBSCRIPTION_REACTIVATED':
      case 'SUBSCRIPTION_REACTIVATION': {
        // Reactivación de suscripción
        const subscriptionId = eventData.data?.subscription?.id || eventData.subscription_id;
        
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Missing subscription ID' },
            { status: 400 }
          );
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('hotmart_subscription_id', subscriptionId)
          .single() as { data: any };

        if (!subscription) {
          return NextResponse.json(
            { error: 'Subscription not found' },
            { status: 404 }
          );
        }

        // Reactivar suscripción
        await (supabase
          .from('subscriptions') as any)
          .update({
            status: 'active',
            cancelled_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        return NextResponse.json({ success: true });
      }

      case 'PURCHASE_CANCELED':
      case 'PURCHASE_REFUNDED':
      case 'PURCHASE_CHARGEBACK': {
        // Compra cancelada, reembolsada o chargeback
        const transactionId = eventData.data?.purchase?.transaction || eventData.transaction;

        if (!transactionId) {
          return NextResponse.json(
            { error: 'Missing transaction ID' },
            { status: 400 }
          );
        }

        // Buscar y cancelar suscripción
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('hotmart_transaction_id', transactionId)
          .single() as { data: any };

        if (subscription) {
          await (supabase
            .from('subscriptions') as any)
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);
        }

        return NextResponse.json({ success: true });
      }

      default:
        // Evento desconocido, pero responder 200 para que Hotmart no reintente
        console.log(`Unhandled event type: ${eventType}`);
        return NextResponse.json({ success: true, message: 'Event received but not processed' });
    }
  } catch (error: any) {
    console.error('Error processing Hotmart webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET para verificación (algunos sistemas de webhook requieren esto)
export async function GET() {
  return NextResponse.json({ 
    message: 'Hotmart webhook endpoint is active',
    status: 'ok' 
  });
}

