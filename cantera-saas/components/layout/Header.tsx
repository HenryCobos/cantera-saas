'use client';

import Link from 'next/link';
import { BellIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { PLANS } from '@/lib/plans';

export default function Header({ title }: { title: string }) {
  const { profile, loading } = useAuth();
  const organizationId = (profile as any)?.organization_id as string | null;
  const { plan, loading: planLoading } = usePlan(organizationId);
  const currentPlan = PLANS[plan];

  return (
    <header className="border-b border-gray-200 bg-gray-100">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          {/* Información del Usuario */}
          {!loading && profile && (
            <div className="text-right mr-2">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || profile?.email || 'Usuario'}</p>
              <p className="text-xs text-gray-600 capitalize">{profile?.role || 'admin'}</p>
            </div>
          )}
          {/* Botón del Plan */}
          <Link
            href="/dashboard/planes"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <CreditCardIcon className="h-5 w-5" />
            <span>{planLoading ? '...' : `Plan ${currentPlan.name}`}</span>
          </Link>
          <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

