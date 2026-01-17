import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Función helper para crear cliente admin (solo cuando se necesita)
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

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario actual
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario tenga acceso a la cantera
    const body = await request.json();
    const { cantera_id } = body;

    if (!cantera_id) {
      return NextResponse.json({ error: 'cantera_id es requerido' }, { status: 400 });
    }

    // Crear cliente admin solo cuando se necesita (en runtime, no en build time)
    const supabaseAdmin = getSupabaseAdmin();

    // Verificar que la cantera pertenece a la organización del usuario
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 403 });
    }

    const { data: cantera } = await supabaseAdmin
      .from('canteras')
      .select('organization_id')
      .eq('id', cantera_id)
      .single();

    if (!cantera || cantera.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'No tienes acceso a esta cantera' }, { status: 403 });
    }

    // Tipos de agregados comunes
    const tiposComunes = [
      { nombre: 'Arena', unidad_medida: 'm3', precio_base: 25.00 },
      { nombre: 'Grava', unidad_medida: 'm3', precio_base: 30.00 },
      { nombre: 'Piedra Triturada 3/4"', unidad_medida: 'm3', precio_base: 35.00 },
      { nombre: 'Piedra Triturada 1/2"', unidad_medida: 'm3', precio_base: 35.00 },
      { nombre: 'Piedra Triturada 1/4"', unidad_medida: 'm3', precio_base: 40.00 },
      { nombre: 'Base Granular', unidad_medida: 'm3', precio_base: 28.00 },
      { nombre: 'Subbase', unidad_medida: 'm3', precio_base: 22.00 },
      { nombre: 'Piedra Chancada', unidad_medida: 'm3', precio_base: 32.00 },
      { nombre: 'Ripio', unidad_medida: 'm3', precio_base: 26.00 },
      { nombre: 'Arena Gruesa', unidad_medida: 'm3', precio_base: 27.00 },
      { nombre: 'Arena Fina', unidad_medida: 'm3', precio_base: 29.00 },
      { nombre: 'Zahorra', unidad_medida: 'm3', precio_base: 24.00 },
    ];

    // Insertar tipos comunes (ignorar duplicados)
    const tiposInsertados = [];
    const tiposErrores = [];

    for (const tipo of tiposComunes) {
      const { data, error } = await supabaseAdmin
        .from('tipos_agregados')
        .insert({
          cantera_id,
          nombre: tipo.nombre,
          unidad_medida: tipo.unidad_medida,
          precio_base: tipo.precio_base,
        })
        .select()
        .single();

      if (error) {
        // Si es error de duplicado, ignorar
        if (error.code === '23505') {
          // Duplicado, ignorar
          continue;
        }
        tiposErrores.push({ tipo: tipo.nombre, error: error.message });
      } else {
        tiposInsertados.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se agregaron ${tiposInsertados.length} tipos de agregados comunes`,
      insertados: tiposInsertados.length,
      errores: tiposErrores.length,
      detalles: {
        insertados: tiposInsertados.map((t) => t.nombre),
        errores: tiposErrores,
      },
    });
  } catch (error: any) {
    console.error('Error adding common aggregate types:', error);
    return NextResponse.json(
      { error: error.message || 'Error al agregar tipos de agregados comunes' },
      { status: 500 }
    );
  }
}

