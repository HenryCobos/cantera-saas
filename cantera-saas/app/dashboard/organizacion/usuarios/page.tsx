'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import PlanLimitAlert from '@/components/PlanLimitAlert';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function OrganizacionUsuariosPage() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'operador' as 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad',
  });

  useEffect(() => {
    if (!authLoading && profile) {
      fetchUsers();
      checkUserLimits();
    }
  }, [authLoading, profile]);

  const checkUserLimits = async () => {
    try {
      const response = await fetch('/api/limits/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_user' }),
      });
      const limitData = await response.json();
      setLimitCheck(limitData);
    } catch (err) {
      console.error('Error checking limits:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      if (!profile?.id) {
        setError('No se pudo obtener el perfil del usuario.');
        setLoading(false);
        return;
      }
      
      // Obtener organization_id del perfil actual
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', profile.id)
        .single() as { data: { organization_id: string | null } | null };

      if (!currentProfile?.organization_id) {
        setError('No se pudo obtener la organización.');
        setLoading(false);
        return;
      }

      // Obtener todos los usuarios de la misma organización
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', currentProfile.organization_id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar límites antes de crear
    if (limitCheck && !limitCheck.allowed) {
      setError(limitCheck.reason || 'Has alcanzado el límite de usuarios para tu plan');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      if (!profile?.id) {
        setError('No se pudo obtener el perfil del usuario.');
        setLoading(false);
        return;
      }
      
      // Obtener organization_id del perfil actual
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', profile.id)
        .single() as { data: { organization_id: string | null } | null };

      if (!currentProfile?.organization_id) {
        setError('No se pudo obtener la organización.');
        setLoading(false);
        return;
      }

      // Usar API Route para crear usuario (requiere Service Role Key)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
          role: createForm.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el usuario');
      }

      // Resetear formulario y cerrar modal
      setCreateForm({
        email: '',
        password: '',
        full_name: '',
        role: 'operador',
      });
      setShowCreateModal(false);
      fetchUsers(); // Recargar lista de usuarios
      checkUserLimits(); // Verificar límites nuevamente
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener sesión para autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Usar API Route para eliminar usuario (requiere Service Role Key)
      const response = await fetch(`/api/users/delete?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el usuario');
      }

      // Recargar lista de usuarios y verificar límites
      fetchUsers();
      checkUserLimits();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Error al eliminar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800';
      case 'operador':
        return 'bg-blue-100 text-blue-800';
      case 'ventas':
        return 'bg-green-100 text-green-800';
      case 'contabilidad':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Header title="Usuarios de la Organización" />
        <div className="p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </>
    );
  }

  // Verificar que el usuario es admin
  if (profile?.role !== 'admin') {
    return (
      <>
        <Header title="Usuarios de la Organización" />
        <div className="p-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Solo los administradores pueden gestionar usuarios.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Usuarios de la Organización" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los usuarios de tu organización
            </p>
          </div>
          <button
            onClick={() => {
              checkUserLimits();
              setShowCreateModal(true);
            }}
            disabled={limitCheck !== null && !limitCheck.allowed}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Usuario
          </button>
        </div>

        {limitCheck && !limitCheck.allowed && (
          <div className="mb-6">
            <PlanLimitAlert message={limitCheck.reason || 'Límite alcanzado'} />
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.full_name || 'Sin nombre'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {user.id !== profile?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar usuario"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                      {user.id === profile?.id && (
                        <span className="text-sm text-gray-400">Tu cuenta</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para crear usuario */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowCreateModal(false)}
                aria-hidden="true"
              ></div>

              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>

              <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <form onSubmit={handleCreateUser}>
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Crear Nuevo Usuario
                    </h3>
                  </div>
                  <div className="space-y-4 px-6 py-4">
                    {limitCheck && !limitCheck.allowed && (
                      <div className="mb-4">
                        <PlanLimitAlert message={limitCheck.reason || 'Límite alcanzado'} />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.full_name}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, full_name: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Nombre del usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={createForm.password}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, password: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rol <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.role}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            role: e.target.value as any,
                          })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="operador">Operador - Registro de producción e inventario</option>
                        <option value="supervisor">Supervisor - Gestión de operaciones</option>
                        <option value="ventas">Ventas - Gestión de ventas, clientes y transporte</option>
                        <option value="contabilidad">Contabilidad - Acceso a finanzas, pagos y gastos</option>
                        <option value="admin">Administrador - Acceso completo al sistema</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        El rol determina los permisos y accesos del usuario en el sistema
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-6 py-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading || (limitCheck !== null && !limitCheck.allowed)}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

