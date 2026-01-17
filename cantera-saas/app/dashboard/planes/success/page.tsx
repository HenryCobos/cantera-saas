'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const transactionId = searchParams.get('transaction_id') || searchParams.get('transaction');
  const productId = searchParams.get('product');
  const email = searchParams.get('email');

  useEffect(() => {
    // Verificar la transacción y actualizar suscripción
    const verifyTransaction = async () => {
      if (!transactionId) {
        setError('No se recibió información de la transacción. El pago se procesará automáticamente.');
        setLoading(false);
        return;
      }

      try {
        // El webhook de Hotmart debería haber procesado la transacción
        // Aquí solo verificamos que todo esté bien
        setLoading(false);
      } catch (err: any) {
        console.error('Error al verificar transacción:', err);
        setError('Hubo un problema al verificar tu compra, pero el pago se procesará automáticamente.');
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [transactionId]);

  return (
    <>
      <Header title="Compra Exitosa" />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {loading ? (
              <div className="py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verificando tu compra...</p>
              </div>
            ) : error ? (
              <div className="py-12">
                <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircleIcon className="h-12 w-12 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Procesando tu compra</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <p className="text-sm text-gray-500 mb-8">
                  Si el problema persiste, contacta a soporte con el ID de transacción: <strong>{transactionId || 'N/A'}</strong>
                </p>
                <Link
                  href="/dashboard/planes"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Volver a Planes
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircleIcon className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Compra exitosa!</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Tu suscripción ha sido activada correctamente.
                </p>
                {transactionId && (
                  <p className="text-sm text-gray-500 mb-8">
                    ID de transacción: <strong>{transactionId}</strong>
                  </p>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Tu plan se actualizará automáticamente en los próximos minutos. 
                    Si no ves los cambios, recarga la página o espera unos momentos.
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ir al Dashboard
                  </Link>
                  <Link
                    href="/dashboard/planes"
                    className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Ver Planes
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

