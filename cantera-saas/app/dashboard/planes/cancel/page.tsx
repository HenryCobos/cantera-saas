'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import { XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function CancelPage() {
  return (
    <>
      <Header title="Compra Cancelada" />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <XCircleIcon className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compra cancelada</h2>
            <p className="text-xl text-gray-600 mb-6">
              No se realizó ningún cargo. Puedes intentar nuevamente cuando estés listo.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-700">
                Si cancelaste por error o tienes alguna pregunta sobre nuestros planes, 
                no dudes en contactarnos.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/planes"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver a Planes
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Ir al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

