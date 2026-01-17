import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from './database.types';

export async function updateSession(request: NextRequest) {
  // NOTA: Las rutas públicas (/, /precios, /auth/login, /auth/register) están
  // excluidas del matcher del middleware, por lo que esta función solo se ejecuta
  // para rutas protegidas que requieren autenticación.
  
  const pathname = request.nextUrl.pathname;

  // Para rutas protegidas, verificar autenticación
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si faltan variables de entorno, redirigir rutas protegidas al login
  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Crear respuesta para manejar cookies de Supabase
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Manejar errores al crear el cliente de Supabase
  let supabase;
  try {
    supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );
  } catch (error) {
    // Si falla al crear el cliente, redirigir al login
    console.error('Error creating Supabase client in middleware:', error);
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user;

  try {
    // Intentar obtener la sesión primero (mejor para detectar cookies recién establecidas)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    user = session?.user;

    // Si no hay sesión, intentar obtener usuario directamente
    if (!user) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser || undefined;
    }
  } catch (error) {
    // Si hay error al obtener el usuario, tratar como no autenticado
    user = undefined;
  }

  // Si está autenticado y está en /auth/login o /auth/register, redirigir al dashboard
  // Esto evita que usuarios autenticados vean estas páginas
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Rutas protegidas - redirigir al login si no está autenticado
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

