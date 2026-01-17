// Helper para obtener la organización del usuario actual
import { createClient } from './server';

export async function getUserOrganization() {
  const supabase = await createClient();
  
  // Obtener el perfil del usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Obtener el perfil con organization_id
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single() as { data: { organization_id: string | null } | null; error: any };

  if (error || !profile?.organization_id) {
    return null;
  }

  return profile.organization_id;
}

export async function getUserOrganizationId() {
  const orgId = await getUserOrganization();
  return orgId;
}

