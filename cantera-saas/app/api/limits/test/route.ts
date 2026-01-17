import { NextRequest, NextResponse } from 'next/server';
import { getUserPlan } from '@/lib/supabase/get-plan';
import { canCreateCantera, canAddCliente, canRegisterProduccion, canRegisterVenta, canAddUser, canExportPDF } from '@/lib/limits';
import { getPlanLimits } from '@/lib/plans';

/**
 * Ruta de prueba para verificar que los límites funcionen correctamente
 * Solo accesible en desarrollo
 */
export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  try {
    const plan = await getUserPlan();
    const limits = getPlanLimits(plan);
    
    // Probar todas las verificaciones
    const checks = {
      plan,
      limits,
      canCreateCantera: await canCreateCantera(),
      canAddCliente: await canAddCliente(),
      canRegisterProduccion: await canRegisterProduccion(),
      canRegisterVenta: await canRegisterVenta(),
      canAddUser: await canAddUser(),
      canExportPDF: await canExportPDF(),
    };

    return NextResponse.json(checks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al verificar límites' },
      { status: 500 }
    );
  }
}

