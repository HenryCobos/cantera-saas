import { createClient } from '@/lib/supabase/server';
import { getUserPlan, hasFeature } from '@/lib/supabase/get-plan';
import { canPerformAction, getLimitValue } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';

/**
 * Verifica si se puede crear una nueva cantera
 */
export async function canCreateCantera(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const plan = await getUserPlan();
  
  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return { allowed: false, reason: 'No se encontró organización' };
  }

  // Contar canteras existentes
  const { count } = await supabase
    .from('canteras')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  const canCreate = canPerformAction(plan, 'canteras', count || 0);
  
  if (!canCreate) {
    const limit = getLimitValue(plan, 'canteras');
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? 'cantera' : 'canteras'} para tu plan. Considera actualizar a un plan superior.`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica si se puede agregar un nuevo usuario
 */
export async function canAddUser(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const plan = await getUserPlan();
  
  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return { allowed: false, reason: 'No se encontró organización' };
  }

  // Contar usuarios existentes
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  const canAdd = canPerformAction(plan, 'usuarios', count || 0);
  
  if (!canAdd) {
    const limit = getLimitValue(plan, 'usuarios');
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? 'usuario' : 'usuarios'} para tu plan. Considera actualizar a un plan superior.`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica si se puede registrar producción este mes
 */
export async function canRegisterProduccion(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const plan = await getUserPlan();
  
  // Si es unlimited, permitir
  const limit = getLimitValue(plan, 'produccionMensual');
  if (limit === null) {
    return { allowed: true };
  }

  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return { allowed: false, reason: 'No se encontró organización' };
  }

  // Obtener cantera_id
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1) as { data: Array<{ id: string }> | null };

  if (!canteras || canteras.length === 0) {
    return { allowed: true }; // Si no hay cantera, permitir crear
  }

  const canteraId = canteras[0].id;

  // Obtener primer y último día del mes actual
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  // Contar registros de producción del mes
  const { count } = await supabase
    .from('produccion')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const canRegister = canPerformAction(plan, 'produccionMensual', count || 0);
  
  if (!canRegister) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} registros de producción por mes. Considera actualizar a un plan superior.`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica si se puede registrar una venta este mes
 */
export async function canRegisterVenta(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const plan = await getUserPlan();
  
  // Si es unlimited, permitir
  const limit = getLimitValue(plan, 'ventasMensual');
  if (limit === null) {
    return { allowed: true };
  }

  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return { allowed: false, reason: 'No se encontró organización' };
  }

  // Obtener cantera_id
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1) as { data: Array<{ id: string }> | null };

  if (!canteras || canteras.length === 0) {
    return { allowed: true };
  }

  const canteraId = canteras[0].id;

  // Obtener primer y último día del mes actual
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  // Contar ventas del mes
  const { count } = await supabase
    .from('ventas')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId)
    .gte('fecha', inicioMes)
    .lte('fecha', finMes);

  const canRegister = canPerformAction(plan, 'ventasMensual', count || 0);
  
  if (!canRegister) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ventas por mes. Considera actualizar a un plan superior.`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica si se puede agregar un nuevo cliente
 */
export async function canAddCliente(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const plan = await getUserPlan();
  
  // Obtener organization_id
  const { data: orgId } = await supabase
    .rpc('get_user_organization_id_helper')
    .single() as { data: string | null };

  if (!orgId) {
    return { allowed: false, reason: 'No se encontró organización' };
  }

  // Obtener cantera_id
  const { data: canteras } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1) as { data: Array<{ id: string }> | null };

  if (!canteras || canteras.length === 0) {
    return { allowed: true };
  }

  const canteraId = canteras[0].id;

  // Contar clientes existentes
  const { count } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('cantera_id', canteraId);

  const canAdd = canPerformAction(plan, 'clientes', count || 0);
  
  if (!canAdd) {
    const limit = getLimitValue(plan, 'clientes');
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? 'cliente' : 'clientes'}. Considera actualizar a un plan superior.`,
    };
  }

  return { allowed: true };
}

/**
 * Verifica si se puede exportar a PDF
 */
export async function canExportPDF(): Promise<boolean> {
  return await hasFeature('exportacionPDF');
}

/**
 * Verifica si se puede exportar a Excel
 */
export async function canExportExcel(): Promise<boolean> {
  return await hasFeature('exportacionExcel');
}

