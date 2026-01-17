import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Intentar obtener la sesión primero (puede estar en cookies)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user;

  // Si no hay sesión, intentar obtener usuario directamente
  if (!user) {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();
    
    // Si hay error o no hay usuario, redirigir al login
    if (error || !authUser) {
      redirect('/auth/login');
    }
    
    user = authUser;
  }

  // Verificar que el perfil exista, si no existe, crearlo automáticamente
  // Usar try-catch para manejar errores de RLS silenciosamente
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Si no existe el perfil, crearlo automáticamente
    if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('No rows'))) {
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'admin',
        } as any);

      if (createError) {
        // Si falla por RLS, no es crítico - el trigger debería haberlo creado
        console.warn('Warning: No se pudo crear perfil automáticamente (puede ser normal):', createError.message);
      }
    }
  } catch (err) {
    // Ignorar errores de perfil - no es crítico para acceder al dashboard
    console.warn('Warning al verificar perfil:', err);
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}

