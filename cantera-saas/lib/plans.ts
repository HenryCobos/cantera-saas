// Sistema de Planes y Límites
export type PlanType = 'free' | 'starter' | 'profesional' | 'business';

export interface PlanLimits {
  canteras: number | 'unlimited';
  usuarios: number | 'unlimited';
  produccionMensual: number | 'unlimited';
  ventasMensual: number | 'unlimited';
  clientes: number | 'unlimited';
  reportesMeses: number | 'unlimited';
  exportacionPDF: boolean;
  exportacionExcel: boolean;
  transporte: boolean;
  reportesAvanzados: boolean;
  rolesPermisos: boolean;
  api: boolean;
  integraciones: boolean;
  soporte: 'email' | 'prioritario' | 'dedicado';
  soporteTiempo: string;
}

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  popular?: boolean;
  limits: PlanLimits;
  features: string[];
}

export const PLANS: Record<PlanType, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Gratis',
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: 'Perfecto para probar la herramienta y conocer sus beneficios',
    limits: {
      canteras: 1,
      usuarios: 3,
      produccionMensual: 50,
      ventasMensual: 30,
      clientes: 20,
      reportesMeses: 3,
      exportacionPDF: false,
      exportacionExcel: false,
      transporte: true,
      reportesAvanzados: false,
      rolesPermisos: true,
      api: false,
      integraciones: false,
      soporte: 'email',
      soporteTiempo: '48h',
    },
    features: [
      '1 cantera',
      'Hasta 3 usuarios',
      '50 registros de producción/mes',
      '30 ventas/mes',
      '20 clientes',
      'Reportes básicos (últimos 3 meses)',
      'Gestión de transporte',
      'Soporte por email (48h)',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: {
      monthly: 29,
      yearly: 290,
    },
    description: 'Ideal para canteras pequeñas o en inicio',
    limits: {
      canteras: 1,
      usuarios: 5,
      produccionMensual: 'unlimited',
      ventasMensual: 'unlimited',
      clientes: 'unlimited',
      reportesMeses: 12,
      exportacionPDF: true,
      exportacionExcel: false,
      transporte: true,
      reportesAvanzados: false,
      rolesPermisos: true,
      api: false,
      integraciones: false,
      soporte: 'prioritario',
      soporteTiempo: '24h',
    },
    features: [
      '1 cantera',
      'Hasta 5 usuarios',
      'Producción ilimitada',
      'Ventas ilimitadas',
      'Clientes ilimitados',
      'Reportes completos (12 meses)',
      'Exportación PDF',
      'Transporte completo',
      'Soporte prioritario (24h)',
    ],
  },
  profesional: {
    id: 'profesional',
    name: 'Profesional',
    price: {
      monthly: 79,
      yearly: 790,
    },
    description: 'Para canteras en crecimiento con múltiples operaciones',
    popular: true,
    limits: {
      canteras: 3,
      usuarios: 15,
      produccionMensual: 'unlimited',
      ventasMensual: 'unlimited',
      clientes: 'unlimited',
      reportesMeses: 'unlimited',
      exportacionPDF: true,
      exportacionExcel: true,
      transporte: true,
      reportesAvanzados: true,
      rolesPermisos: true,
      api: true,
      integraciones: false,
      soporte: 'prioritario',
      soporteTiempo: '12h',
    },
    features: [
      'Hasta 3 canteras',
      'Hasta 15 usuarios',
      'Todo lo del Starter',
      'Reportes avanzados con gráficos interactivos',
      'Exportación PDF/Excel',
      'Análisis de rentabilidad por cliente',
      'Múltiples roles y permisos',
      'API básica',
      'Soporte prioritario (12h)',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: {
      monthly: 149,
      yearly: 1490,
    },
    description: 'Para empresas medianas con múltiples canteras',
    limits: {
      canteras: 'unlimited',
      usuarios: 'unlimited',
      produccionMensual: 'unlimited',
      ventasMensual: 'unlimited',
      clientes: 'unlimited',
      reportesMeses: 'unlimited',
      exportacionPDF: true,
      exportacionExcel: true,
      transporte: true,
      reportesAvanzados: true,
      rolesPermisos: true,
      api: true,
      integraciones: true,
      soporte: 'dedicado',
      soporteTiempo: '4h (chat)',
    },
    features: [
      'Canteras ilimitadas',
      'Usuarios ilimitados',
      'Todo lo del Profesional',
      'Reportes personalizados',
      'Integraciones (facturación electrónica, contabilidad)',
      'API completa',
      'Análisis predictivo',
      'Backup automático diario',
      'Soporte dedicado (4h, chat)',
      'Onboarding personalizado',
      'SLA 99.9%',
    ],
  },
};

// Helper para obtener límites de un plan
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLANS[plan].limits;
}

// Helper para verificar si una acción está permitida
export function canPerformAction(
  plan: PlanType,
  action: keyof PlanLimits,
  currentCount?: number
): boolean {
  const limits = getPlanLimits(plan);
  const limit = limits[action];

  if (limit === 'unlimited' || limit === true) {
    return true;
  }

  if (typeof limit === 'number' && typeof currentCount === 'number') {
    return currentCount < limit;
  }

  return false;
}

// Helper para obtener el límite de un plan (retorna número o null si es unlimited)
export function getLimitValue(
  plan: PlanType,
  action: keyof PlanLimits
): number | null {
  const limits = getPlanLimits(plan);
  const limit = limits[action];

  if (limit === 'unlimited' || limit === true) {
    return null;
  }

  if (typeof limit === 'number') {
    return limit;
  }

  return 0;
}

// Helper para formatear precios
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

// Helper para calcular descuento anual
export function getYearlyDiscount(monthly: number, yearly: number): number {
  const monthlyYearly = monthly * 12;
  const discount = ((monthlyYearly - yearly) / monthlyYearly) * 100;
  return Math.round(discount);
}

