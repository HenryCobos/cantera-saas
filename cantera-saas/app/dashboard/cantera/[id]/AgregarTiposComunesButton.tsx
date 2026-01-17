'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function AgregarTiposComunesButton({ canteraId }: { canteraId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgregarTiposComunes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/cantera/agregar-tipos-comunes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantera_id: canteraId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al agregar tipos comunes');
      }

      setSuccess(true);
      // Recargar la página después de 1 segundo para mostrar los nuevos tipos
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Error adding common types:', err);
      setError(err.message || 'Error al agregar tipos de agregados comunes');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
        ✓ Tipos agregados
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleAgregarTiposComunes}
        disabled={loading}
        className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        <SparklesIcon className="mr-2 h-4 w-4" />
        {loading ? 'Agregando...' : 'Agregar Tipos Comunes'}
      </button>
      {error && (
        <div className="absolute left-0 top-full mt-2 rounded-md bg-red-50 p-2 text-xs text-red-800 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

