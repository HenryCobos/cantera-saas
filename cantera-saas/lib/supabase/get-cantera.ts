// Helper para obtener cantera(s) de la organización del usuario actual
import { createClient } from './server';

/**
 * Obtiene la primera cantera de la organización del usuario actual
 * Útil para casos donde se espera una sola cantera
 */
export async function getUserCanteraId() {
  const supabase = await createClient();
  
  // Obtener organization_id del usuario actual usando la función helper
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };
  
  if (!orgId) {
    return null;
  }

  // Obtener la primera cantera de la organización
  const { data: canteras, error } = await supabase
    .from('canteras')
    .select('id')
    .eq('organization_id', orgId)
    .limit(1)
    .single() as { data: { id: string } | null; error: any };

  if (error || !canteras?.id) {
    return null;
  }

  return canteras.id;
}

/**
 * Obtiene todas las canteras de la organización del usuario actual
 */
export async function getUserCanteras() {
  const supabase = await createClient();
  
  // Obtener organization_id del usuario actual
  const { data: orgId } = await supabase.rpc('get_user_organization_id_helper').single() as { data: string | null };
  
  if (!orgId) {
    return [];
  }

  // Obtener todas las canteras de la organización
  const { data: canteras, error } = await supabase
    .from('canteras')
    .select('*')
    .eq('organization_id', orgId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching canteras:', error);
    return [];
  }

  return canteras || [];
}

