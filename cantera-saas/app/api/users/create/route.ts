import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Esta ruta requiere Service Role Key para crear usuarios
// Agrega SUPABASE_SERVICE_ROLE_KEY a tus variables de entorno (.env.local)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con Service Role Key (privilegios elevados)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Verificar que Service Role Key esté configurada
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
      return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 });
    }

    // Obtener datos del body
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Crear usuario en auth con Service Role Key
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        full_name,
      },
    });

    if (authCreateError) {
      return NextResponse.json({ error: authCreateError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    // Esperar un momento para que el trigger se ejecute
    // El trigger handle_new_user() crea el perfil automáticamente
    // Pero crea una nueva organización, así que debemos actualizar el organization_id
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar si el perfil ya existe (fue creado por el trigger)
    let existingProfile;
    let attempts = 0;
    while (attempts < 5) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, organization_id, role')
        .eq('id', authData.user.id)
        .single();
      
      if (data && !error) {
        existingProfile = data;
        break;
      }
      // Esperar un poco más antes de intentar de nuevo
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (existingProfile) {
      // El perfil ya existe (creado por el trigger)
      // El trigger crea una nueva organización, pero queremos usar la del admin
      // Primero eliminar la organización creada por el trigger si no tiene datos importantes
      const { data: orgCreatedByTrigger } = await supabaseAdmin
        .from('organizations')
        .select('id, owner_id')
        .eq('id', existingProfile.organization_id)
        .single();

      // Actualizar el perfil con la organización del admin
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          full_name,
          role,
          organization_id: profile.organization_id, // Actualizar con la organización del admin
        })
        .eq('id', authData.user.id);

      if (updateError) {
        // Si falla la actualización, eliminar usuario de auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: `Error al actualizar perfil: ${updateError.message}` }, { status: 400 });
      }

      // Si la organización creada por el trigger no tiene más usuarios, limpiarla después
      // (pero no eliminar la organización si el usuario ya fue movido, solo si está vacía)
      if (orgCreatedByTrigger && orgCreatedByTrigger.owner_id === authData.user.id) {
        // Esperar un momento para que la actualización se complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { count: userCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgCreatedByTrigger.id);

        // Solo eliminar si no hay usuarios asociados
        if (userCount === 0) {
          const { count: canteraCount } = await supabaseAdmin
            .from('canteras')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgCreatedByTrigger.id);

          // Solo eliminar si no hay canteras asociadas
          if (canteraCount === 0) {
            // Eliminar la organización vacía creada por el trigger
            await supabaseAdmin
              .from('organizations')
              .delete()
              .eq('id', orgCreatedByTrigger.id);
          }
        }
      }
    } else {
      // El perfil no existe, crearlo manualmente (por si el trigger no se ejecutó)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role,
          organization_id: profile.organization_id,
        });

      if (profileError) {
        // Si falla, eliminar usuario de auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: `Error al crear perfil: ${profileError.message}` }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role,
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Error al crear el usuario' }, { status: 500 });
  }
}

