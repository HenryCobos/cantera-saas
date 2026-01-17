// Configuración de Hotmart
// Mapeo de Product IDs de Hotmart a planes del sistema

/**
 * Mapeo de Product IDs de Hotmart a planes del sistema
 * 
 * IMPORTANTE: Debes configurar estos IDs según tus productos reales en Hotmart.
 * Puedes encontrar los Product IDs en el dashboard de Hotmart.
 * 
 * Ejemplo de estructura en Hotmart:
 * - Product Name: "Plan Starter Mensual" → Product ID: "123456"
 * - Product Name: "Plan Starter Anual" → Product ID: "123457"
 */
export const HOTMART_PRODUCT_TO_PLAN: Record<string, {
  plan: 'starter' | 'profesional' | 'business';
  billingPeriod: 'monthly' | 'yearly';
}> = {
  // EJEMPLO - Reemplaza con tus Product IDs reales:
  // '123456': { plan: 'starter', billingPeriod: 'monthly' },
  // '123457': { plan: 'starter', billingPeriod: 'yearly' },
  // '123458': { plan: 'profesional', billingPeriod: 'monthly' },
  // '123459': { plan: 'profesional', billingPeriod: 'yearly' },
  // '123460': { plan: 'business', billingPeriod: 'monthly' },
  // '123461': { plan: 'business', billingPeriod: 'yearly' },
};

/**
 * Obtiene el plan y período de facturación basado en el Product ID de Hotmart
 */
export function getPlanFromHotmartProduct(productId: string): {
  plan: 'starter' | 'profesional' | 'business' | null;
  billingPeriod: 'monthly' | 'yearly' | null;
} {
  // Si el product_id está en el mapeo, retornar el plan correspondiente
  if (HOTMART_PRODUCT_TO_PLAN[productId]) {
    return {
      plan: HOTMART_PRODUCT_TO_PLAN[productId].plan,
      billingPeriod: HOTMART_PRODUCT_TO_PLAN[productId].billingPeriod,
    };
  }

  // Lógica alternativa: detectar plan por nombre del producto (fallback)
  const productLower = productId.toLowerCase();
  
  let plan: 'starter' | 'profesional' | 'business' | null = null;
  if (productLower.includes('starter') || productLower.includes('basico')) {
    plan = 'starter';
  } else if (productLower.includes('profesional') || productLower.includes('professional')) {
    plan = 'profesional';
  } else if (productLower.includes('business') || productLower.includes('empresarial')) {
    plan = 'business';
  }

  let billingPeriod: 'monthly' | 'yearly' | null = null;
  if (productLower.includes('monthly') || productLower.includes('mensual')) {
    billingPeriod = 'monthly';
  } else if (productLower.includes('yearly') || productLower.includes('anual')) {
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
 * Genera URL de checkout de Hotmart
 */
export function generateHotmartCheckoutUrl(
  productId: string,
  buyerEmail: string,
  returnUrl?: string,
  organizationId?: string
): string {
  const params = new URLSearchParams({
    checkout: 'hotmart',
    product: productId,
    email: buyerEmail,
  });

  if (returnUrl) {
    params.append('returnUrl', returnUrl);
  }

  if (organizationId) {
    params.append('organizationId', organizationId);
  }

  return `${HOTMART_BASE_URL}/checkout/pay/${productId}?${params.toString()}`;
}

