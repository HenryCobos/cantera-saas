// Configuración de Hotmart
// Mapeo de Product IDs de Hotmart a planes del sistema

/**
 * Product ID base de Hotmart
 * Todos los planes usan el mismo Product ID base con diferentes códigos de oferta (off)
 */
export const HOTMART_PRODUCT_ID = 'X103920698X';

/**
 * Mapeo de códigos de oferta (off) de Hotmart a planes del sistema
 * Estos códigos se usan para generar las URLs de checkout correctas
 */
export const HOTMART_OFF_TO_PLAN: Record<string, {
  plan: 'starter' | 'profesional' | 'business';
  billingPeriod: 'monthly' | 'yearly';
}> = {
  // Starter
  'or119a7i': { plan: 'starter', billingPeriod: 'monthly' }, // $29/mes
  'pe5fs9od': { plan: 'starter', billingPeriod: 'yearly' },  // $290/año
  
  // Profesional
  'd9tag8fr': { plan: 'profesional', billingPeriod: 'monthly' }, // $79/mes
  '6vzovvyt': { plan: 'profesional', billingPeriod: 'yearly' },  // $790/año
  
  // Business
  'noduqypm': { plan: 'business', billingPeriod: 'monthly' }, // $149/mes
  'z3h2p95p': { plan: 'business', billingPeriod: 'yearly' },  // $1490/año
};

/**
 * Mapeo de Product IDs de Hotmart a planes del sistema
 * Se usa cuando los webhooks envían el product_id (puede incluir precio o metadata para distinguir)
 * Hotmart puede enviar el Product ID base (X103920698X) en los webhooks
 */
export const HOTMART_PRODUCT_TO_PLAN: Record<string, {
  plan: 'starter' | 'profesional' | 'business';
  billingPeriod: 'monthly' | 'yearly';
}> = {
  // Mapeo por Product ID base (puede necesitarse según cómo Hotmart envíe los webhooks)
  'X103920698X': { plan: 'starter', billingPeriod: 'monthly' }, // Fallback - se detectará por precio o metadata
  '103920698': { plan: 'starter', billingPeriod: 'monthly' },   // Fallback sin X
};

/**
 * Precios de los planes (para identificar el plan basándose en el precio del webhook)
 */
const PLAN_PRICES = {
  starter: { monthly: 29.00, yearly: 290.00 },
  profesional: { monthly: 79.00, yearly: 790.00 },
  business: { monthly: 149.00, yearly: 1490.00 },
} as const;

/**
 * Obtiene el plan y período de facturación basado en el Product ID o precio de Hotmart
 * 
 * @param productId - Product ID de Hotmart (puede ser el mismo para todos los planes)
 * @param priceValue - Precio pagado (opcional, usado para identificar el plan cuando el Product ID es el mismo)
 * @param metadata - Metadata adicional del webhook (opcional)
 */
export function getPlanFromHotmartProduct(
  productId: string,
  priceValue?: number | string | null,
  metadata?: any
): {
  plan: 'starter' | 'profesional' | 'business' | null;
  billingPeriod: 'monthly' | 'yearly' | null;
} {
  // Intentar identificar por precio si está disponible (más confiable cuando Product ID es el mismo)
  if (priceValue !== undefined && priceValue !== null) {
    const price = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    
    // Tolerancia para comparación de precios (por si hay impuestos o pequeños ajustes)
    const tolerance = 1.0;
    
    for (const [plan, prices] of Object.entries(PLAN_PRICES)) {
      // Comparar precio mensual
      if (Math.abs(price - prices.monthly) <= tolerance) {
        return {
          plan: plan as 'starter' | 'profesional' | 'business',
          billingPeriod: 'monthly',
        };
      }
      // Comparar precio anual
      if (Math.abs(price - prices.yearly) <= tolerance) {
        return {
          plan: plan as 'starter' | 'profesional' | 'business',
          billingPeriod: 'yearly',
        };
      }
    }
  }

  // Si el product_id está en el mapeo, retornar el plan correspondiente
  if (HOTMART_PRODUCT_TO_PLAN[productId]) {
    return {
      plan: HOTMART_PRODUCT_TO_PLAN[productId].plan,
      billingPeriod: HOTMART_PRODUCT_TO_PLAN[productId].billingPeriod,
    };
  }

  // Lógica alternativa: detectar plan por nombre del producto o metadata (fallback)
  const productLower = productId.toLowerCase();
  const metadataStr = metadata ? JSON.stringify(metadata).toLowerCase() : '';
  const combined = `${productLower} ${metadataStr}`;
  
  let plan: 'starter' | 'profesional' | 'business' | null = null;
  if (combined.includes('starter') || combined.includes('basico')) {
    plan = 'starter';
  } else if (combined.includes('profesional') || combined.includes('professional')) {
    plan = 'profesional';
  } else if (combined.includes('business') || combined.includes('empresarial')) {
    plan = 'business';
  }

  let billingPeriod: 'monthly' | 'yearly' | null = null;
  if (combined.includes('monthly') || combined.includes('mensual')) {
    billingPeriod = 'monthly';
  } else if (combined.includes('yearly') || combined.includes('anual')) {
    billingPeriod = 'yearly';
  }

  return { plan, billingPeriod };
}

/**
 * URL base de Hotmart para redirecciones de compra
 * Cambia según tu cuenta (sandbox o producción)
 */
export const HOTMART_BASE_URL = process.env.HOTMART_SANDBOX === 'true'
  ? 'https://sandbox.hotmart.com'
  : 'https://pay.hotmart.com';

/**
 * Obtiene el código de oferta (off) basado en el plan y período de facturación
 */
export function getOffCodeFromPlan(
  plan: 'starter' | 'profesional' | 'business',
  billingPeriod: 'monthly' | 'yearly'
): string | null {
  const entries = Object.entries(HOTMART_OFF_TO_PLAN);
  const match = entries.find(([_, value]) => 
    value.plan === plan && value.billingPeriod === billingPeriod
  );
  return match ? match[0] : null;
}

/**
 * Genera URL de checkout de Hotmart usando el formato correcto con códigos de oferta (off)
 */
export function generateHotmartCheckoutUrl(
  plan: 'starter' | 'profesional' | 'business',
  billingPeriod: 'monthly' | 'yearly',
  buyerEmail: string,
  returnUrl?: string,
  organizationId?: string
): string {
  const offCode = getOffCodeFromPlan(plan, billingPeriod);
  
  if (!offCode) {
    throw new Error(`No se encontró código de oferta para plan ${plan} ${billingPeriod}`);
  }

  // URL de Hotmart con formato: https://pay.hotmart.com/PRODUCT_ID?off=OFF_CODE
  const params = new URLSearchParams({
    off: offCode,
  });

  if (returnUrl) {
    params.append('returnUrl', returnUrl);
  }

  if (organizationId) {
    params.append('organizationId', organizationId);
  }

  return `${HOTMART_BASE_URL}/${HOTMART_PRODUCT_ID}?${params.toString()}`;
}

