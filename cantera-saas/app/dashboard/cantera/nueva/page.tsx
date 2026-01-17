'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PlanLimitAlert from '@/components/PlanLimitAlert';

export default function NuevaCanteraPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Obtener organization_id del perfil del usuario actual
  useEffect(() => {
    const fetchOrganizationId = async () => {
      if (authLoading) return;

      // Intentar obtener del perfil primero (más confiable)
      if (profile && 'organization_id' in profile && profile.organization_id) {
        setOrganizationId(profile.organization_id as string);
        return;
      }

      // Si no está en el perfil, intentar obtenerlo directamente
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('No se pudo obtener el usuario. Por favor, recarga la página.');
          return;
        }

        // Intentar obtener organization_id directamente de la tabla profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single() as { data: { organization_id: string | null } | null; error: any };

        if (profileError) {
          console.error('Error al obtener organization_id:', profileError);
          
          // Si es un error de RLS o permisos, intentar usar la función helper
          if (profileError.message?.includes('permission denied') || profileError.code === '42501') {
            try {
              const { data: orgIdData, error: funcError } = await supabase.rpc('get_user_organization_id');
              if (!funcError && orgIdData) {
                setOrganizationId(orgIdData);
                return;
              }
            } catch (rpcErr) {
              console.warn('No se pudo usar la función helper:', rpcErr);
            }
          }
          
          setError(`Error al obtener la organización: ${profileError.message}. Verifica que el script multi_tenant_schema.sql se haya ejecutado correctamente.`);
          return;
        }

        if (profileData?.organization_id) {
          setOrganizationId(profileData.organization_id);
        } else {
          // Si no tiene organization_id, intentar crearlo automáticamente
          console.warn('Usuario sin organization_id, intentando crear organización automáticamente...');
          try {
            // Crear organización automáticamente
            const { data: newOrg, error: orgError } = await supabase
              .from('organizations')
              .insert({
                name: `${profile?.full_name || user.email?.split('@')[0] || 'Mi'} - Organización`,
                owner_id: user.id,
                plan: 'gratuito',
                status: 'activa',
              } as any)
              .select()
              .single() as { data: { id: string } | null; error: any };

            if (orgError) {
              console.error('Error al crear organización:', orgError);
              setError(`Tu perfil no tiene una organización asignada y no se pudo crear automáticamente: ${orgError.message}. Ejecuta el script multi_tenant_schema.sql en Supabase.`);
              return;
            }

            if (newOrg?.id) {
              // Actualizar el perfil con organization_id
              // @ts-ignore - organization_id no está en los tipos aún
              const { error: updateError } = await supabase
                .from('profiles')
                // @ts-ignore
                .update({ organization_id: newOrg.id })
                .eq('id', user.id);

              if (updateError) {
                console.error('Error al actualizar perfil con organization_id:', updateError);
                setError(`Se creó la organización pero no se pudo actualizar el perfil: ${updateError.message}. Recarga la página e intenta nuevamente.`);
                return;
              }

              setOrganizationId(newOrg.id);
              console.log('Organización creada y asignada automáticamente');
            }
          } catch (autoErr: any) {
            console.error('Error al crear organización automáticamente:', autoErr);
            setError(`Tu perfil no tiene una organización asignada. Ejecuta el script multi_tenant_schema.sql en Supabase para asignar organizaciones a todos los usuarios.`);
          }
        }
      } catch (err: any) {
        console.error('Error inesperado al obtener organization_id:', err);
        setError('Error inesperado al obtener la organización. Por favor, recarga la página.');
      }
    };

    fetchOrganizationId();
  }, [profile, authLoading]);

  useEffect(() => {
    if (organizationId) {
      // Verificar límites del plan
      const checkLimits = async () => {
        try {
          const response = await fetch('/api/limits/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create_cantera' }),
          });
          const limitData = await response.json();
          setLimitCheck(limitData);
        } catch (err) {
          console.error('Error checking limits:', err);
        }
      };
      checkLimits();
    }
  }, [organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Si aún se está cargando la autenticación, esperar
    if (authLoading) {
      setError('Cargando información del usuario...');
      setLoading(false);
      return;
    }

    if (!organizationId) {
      setError('No se pudo obtener la organización. Asegúrate de que el script de migración multi-tenant se haya ejecutado correctamente en Supabase.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('canteras')
        .insert([{
          ...formData,
          organization_id: organizationId,
        }] as any)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/cantera');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cantera');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Header title="Nueva Cantera" />
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/cantera"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Cantera
          </Link>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Crear Nueva Cantera</h2>
            <p className="mt-1 text-sm text-gray-500">Completa la información de la cantera</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {limitCheck && !limitCheck.allowed && (
              <div className="mb-6">
                <PlanLimitAlert message={limitCheck.reason || 'Límite alcanzado'} />
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('script de migración') && (
                  <p className="mt-2 text-xs text-red-700">
                    Ejecuta los scripts SQL en Supabase: primero <code className="bg-red-100 px-1 rounded">multi_tenant_schema.sql</code> y luego <code className="bg-red-100 px-1 rounded">multi_tenant_rls.sql</code>
                  </p>
                )}
              </div>
            )}
            {authLoading && !organizationId && (
              <div className="mb-6 rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-800">Cargando información de la organización...</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre de la Cantera <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Ej: Cantera San Juan"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Dirección completa de la cantera"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: +1234567890"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: contacto@cantera.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link
                href="/dashboard/cantera"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || (limitCheck !== null && !limitCheck.allowed)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cantera'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

