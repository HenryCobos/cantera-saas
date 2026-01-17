'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';

interface ActionsCellProps {
  type: 'camion' | 'chofer' | 'viaje' | 'cliente' | 'pago' | 'gasto';
  id: string;
  identifier: string; // placa, nombre, etc para mostrar en confirmación
}

export default function ActionsCell({ type, id, identifier }: ActionsCellProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const entityName = type === 'camion' ? 'camión' : type === 'chofer' ? 'chofer' : type === 'viaje' ? 'viaje' : type === 'cliente' ? 'cliente' : type === 'pago' ? 'pago' : 'gasto';
    
    let confirmMessage = `¿Estás seguro de eliminar ${type === 'cliente' ? 'al' : 'el'} ${entityName} "${identifier}"? Esta acción no se puede deshacer.`;
    
    // Mensaje especial para pagos
    if (type === 'pago') {
      confirmMessage = `¿Estás seguro de eliminar el pago "${identifier}"?\n\n⚠️ Esta acción afectará el estado de pago de la venta asociada. Esta acción no se puede deshacer.`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Para clientes, verificar primero si tiene ventas asociadas
      if (type === 'cliente') {
        const { data: ventas, error: ventasError } = await supabase
          .from('ventas')
          .select('id')
          .eq('cliente_id', id)
          .limit(1);

        if (ventasError) {
          throw ventasError;
        }

        if (ventas && ventas.length > 0) {
          alert(`No se puede eliminar el cliente "${identifier}" porque tiene ventas asociadas. Para desactivar el cliente, edítalo y cambia su estado a "Inactivo".`);
          return;
        }
      }

      const tableName = type === 'camion' ? 'camiones' : type === 'chofer' ? 'choferes' : type === 'viaje' ? 'viajes' : type === 'cliente' ? 'clientes' : type === 'pago' ? 'pagos' : 'gastos';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        // Manejar errores específicos de restricciones de clave foránea
        if (error.message && error.message.includes('foreign key constraint')) {
          if (type === 'cliente') {
            alert(`No se puede eliminar el cliente "${identifier}" porque tiene ventas asociadas. Para desactivar el cliente, edítalo y cambia su estado a "Inactivo".`);
          } else {
            alert(`No se puede eliminar ${entityName} porque tiene registros asociados.`);
          }
          return;
        }
        throw error;
      }

      router.refresh();
    } catch (error: any) {
      // Si el error ya fue manejado arriba, no mostrar otro mensaje
      if (!error.message || !error.message.includes('foreign key constraint')) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  const getEditUrl = () => {
    switch (type) {
      case 'camion':
        return `/dashboard/transporte/camiones/${id}/editar`;
      case 'chofer':
        return `/dashboard/transporte/choferes/${id}/editar`;
      case 'viaje':
        return `/dashboard/transporte/viajes/${id}`;
      case 'cliente':
        return `/dashboard/clientes/${id}/editar`;
      case 'pago':
        return null; // Los pagos no se editan, solo se eliminan
      case 'gasto':
        return `/dashboard/gastos/${id}/editar`;
      default:
        return '#';
    }
  };

  const editUrl = getEditUrl();

  return (
    <div className="flex items-center gap-2">
      {type === 'viaje' && (
        <Link
          href={`/dashboard/transporte/viajes/${id}`}
          className="inline-flex items-center rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
          title="Ver detalle"
        >
          <EyeIcon className="h-4 w-4" />
        </Link>
      )}
      {editUrl && (
        <Link
          href={editUrl}
          className="inline-flex items-center rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
          title="Editar"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      )}
      <button
        onClick={handleDelete}
        className="inline-flex items-center rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
        title="Eliminar"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
