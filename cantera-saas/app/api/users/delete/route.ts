import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Función helper para crear cliente admin (solo cuando se necesita - en runtime, no en build time)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function DELETE(request: NextRequest) {
  try {
    // Crear cliente admin solo cuando se necesita (en runtime, no en build time)
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que Service Role Key esté configurada
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service Role Key no configurada. Agrega SUPABASE_SERVICE_ROLE_KEY a .env.local' }, { status: 500 });
    }

    // Verificar autenticación del usuario actual
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar usuarios' }, { status: 403 });
    }

    // Obtener userId del query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Verificar que el usuario a eliminar pertenece a la misma organización
    const { data: userToDelete } = await supabaseAdmin
      .from('profiles')
      .select('id, email, organization_id, role')
      .eq('id', userId)
      .single();

    if (!userToDelete) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // No permitir eliminar al propio usuario
    if (userToDelete.id === user.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
    }

    // Verificar que el usuario pertenece a la misma organización
    if (userToDelete.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'No puedes eliminar usuarios de otras organizaciones' }, { status: 403 });
    }

    // Verificar si el usuario es propietario de alguna organización
    const { data: ownedOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, owner_id')
      .eq('owner_id', userId);

    // Si el usuario es propietario de organizaciones, transferir la propiedad
    if (ownedOrgs && ownedOrgs.length > 0) {
      // Si es propietario de su propia organización, transferirla al admin actual
      for (const org of ownedOrgs) {
        if (org.id === userToDelete.organization_id) {
          // Transferir la propiedad de la organización al admin actual
          const { error: transferError } = await supabaseAdmin
            .from('organizations')
            .update({ owner_id: user.id })
            .eq('id', org.id);

          if (transferError) {
            return NextResponse.json({ 
              error: `No se puede eliminar el usuario porque es propietario de la organización y no se pudo transferir la propiedad: ${transferError.message}` 
            }, { status: 400 });
          }
        } else {
          // Si es propietario de otras organizaciones, encontrar otro admin o transferir al admin actual
          const { data: otherAdmins } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('organization_id', org.id)
            .eq('role', 'admin')
            .neq('id', userId)
            .limit(1);

          const newOwnerId = otherAdmins && otherAdmins.length > 0 
            ? otherAdmins[0].id 
            : user.id; // Si no hay otro admin, usar el admin actual

          const { error: transferError } = await supabaseAdmin
            .from('organizations')
            .update({ owner_id: newOwnerId })
            .eq('id', org.id);

          if (transferError) {
            return NextResponse.json({ 
              error: `No se puede eliminar el usuario porque es propietario de múltiples organizaciones y no se pudo transferir la propiedad: ${transferError.message}` 
            }, { status: 400 });
          }
        }
      }
    }

    // No permitir eliminar a otros admins si no eres el propietario (opcional, comentado para permitir eliminación)
    // if (userToDelete.role === 'admin') {
    //   const { data: orgOwner } = await supabaseAdmin
    //     .from('organizations')
    //     .select('owner_id')
    //     .eq('id', profile.organization_id)
    //     .single();

    //   if (orgOwner && orgOwner.owner_id !== user.id) {
    //     return NextResponse.json({ error: 'No puedes eliminar a otros administradores' }, { status: 403 });
    //   }
    // }

    // Eliminar usuario de auth (esto eliminará el perfil automáticamente por CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      // Si falla eliminar de auth, intentar eliminar solo el perfil
      console.warn('Error eliminando de auth, intentando eliminar solo el perfil:', deleteError);
      
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        return NextResponse.json({ 
          error: `Error al eliminar usuario: ${profileDeleteError.message}. Si el usuario es propietario de una organización, primero transfiere la propiedad.` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario eliminado correctamente' 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar el usuario' }, { status: 500 });
  }
}

