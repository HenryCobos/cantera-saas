import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // CRÍTICO: Verificar ANTES de cualquier otra cosa si es la ruta root
  // Si es '/', retornar inmediatamente sin hacer nada más
  const pathname = request.nextUrl.pathname;
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Wrapper con try-catch para asegurar que nunca falle silenciosamente
  try {
    return await updateSession(request);
  } catch (error) {
    // Si hay cualquier error, permitir acceso para no bloquear la aplicación
    console.error('Error en middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * SOLUCIÓN DEFINITIVA: Solo interceptar rutas protegidas que requieren autenticación
     * Esto EXCLUYE automáticamente:
     * - / (landing page)
     * - /precios
     * - /auth/login
     * - /auth/register
     * - Todas las rutas estáticas
     * - Rutas API (pueden tener su propia autenticación)
     */
    '/dashboard/:path*',
  ],
};

