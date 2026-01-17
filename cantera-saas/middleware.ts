import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
     * CRÍTICO: El matcher usa .+ (no .*) para requerir al menos 1 carácter después de /
     * Esto excluye automáticamente la ruta '/' (root) del middleware
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - root path '/' (automáticamente excluido por .+)
     * - static files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).+)',
  ],
};

