'use client';

import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface PlanLimitAlertProps {
  message: string;
  showUpgrade?: boolean;
}

export default function PlanLimitAlert({ message, showUpgrade = true }: PlanLimitAlertProps) {
  return (
    <div className="relative rounded-lg bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-5 border-2 border-amber-300 shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-400 shadow-md">
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-2">Límite alcanzado</h3>
          <div className="mt-1 text-base text-amber-800">
            <p className="font-medium">{message}</p>
          </div>
          {showUpgrade && (
            <div className="mt-5">
              <Link
                href="/dashboard/planes"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Ver planes y actualizar
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 -mt-1 -mr-1">
        <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></div>
      </div>
    </div>
  );
}

