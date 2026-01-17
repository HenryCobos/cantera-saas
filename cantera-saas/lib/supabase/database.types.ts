// Este archivo será generado automáticamente por Supabase CLI
// Por ahora, lo definimos manualmente para el desarrollo

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad';
          created_at?: string;
          updated_at?: string;
        };
      };
      canteras: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tipos_agregados: {
        Row: {
          id: string;
          cantera_id: string;
          nombre: string;
          unidad_medida: string;
          precio_base: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          nombre: string;
          unidad_medida: string;
          precio_base: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          nombre?: string;
          unidad_medida?: string;
          precio_base?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      produccion: {
        Row: {
          id: string;
          cantera_id: string;
          tipo_agregado_id: string;
          fecha: string;
          cantidad: number;
          maquina: string | null;
          operador_id: string | null;
          merma: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          tipo_agregado_id: string;
          fecha: string;
          cantidad: number;
          maquina?: string | null;
          operador_id?: string | null;
          merma?: number;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          tipo_agregado_id?: string;
          fecha?: string;
          cantidad?: number;
          maquina?: string | null;
          operador_id?: string | null;
          merma?: number;
          created_at?: string;
          created_by?: string;
        };
      };
      inventario: {
        Row: {
          id: string;
          cantera_id: string;
          tipo_agregado_id: string;
          cantidad: number;
          cantidad_minima: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          tipo_agregado_id: string;
          cantidad: number;
          cantidad_minima?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          tipo_agregado_id?: string;
          cantidad?: number;
          cantidad_minima?: number;
          updated_at?: string;
        };
      };
      movimientos_inventario: {
        Row: {
          id: string;
          inventario_id: string;
          tipo: 'entrada' | 'salida' | 'ajuste';
          cantidad: number;
          motivo: string | null;
          referencia_id: string | null;
          referencia_tipo: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          inventario_id: string;
          tipo: 'entrada' | 'salida' | 'ajuste';
          cantidad: number;
          motivo?: string | null;
          referencia_id?: string | null;
          referencia_tipo?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          inventario_id?: string;
          tipo?: 'entrada' | 'salida' | 'ajuste';
          cantidad?: number;
          motivo?: string | null;
          referencia_id?: string | null;
          referencia_tipo?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      camiones: {
        Row: {
          id: string;
          cantera_id: string;
          placa: string;
          capacidad_metros: number;
          estado: 'activo' | 'mantenimiento' | 'inactivo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          placa: string;
          capacidad_metros: number;
          estado?: 'activo' | 'mantenimiento' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          placa?: string;
          capacidad_metros?: number;
          estado?: 'activo' | 'mantenimiento' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
      };
      choferes: {
        Row: {
          id: string;
          cantera_id: string;
          nombre: string;
          licencia: string | null;
          telefono: string | null;
          estado: 'activo' | 'inactivo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          nombre: string;
          licencia?: string | null;
          telefono?: string | null;
          estado?: 'activo' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          nombre?: string;
          licencia?: string | null;
          telefono?: string | null;
          estado?: 'activo' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
      };
      viajes: {
        Row: {
          id: string;
          cantera_id: string;
          camion_id: string;
          chofer_id: string;
          venta_id: string | null;
          fecha: string;
          cantidad_metros: number;
          costo_combustible: number;
          costo_peaje: number;
          otros_costos: number;
          destino: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          camion_id: string;
          chofer_id: string;
          venta_id?: string | null;
          fecha: string;
          cantidad_metros: number;
          costo_combustible?: number;
          costo_peaje?: number;
          otros_costos?: number;
          destino: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          camion_id?: string;
          chofer_id?: string;
          venta_id?: string | null;
          fecha?: string;
          cantidad_metros?: number;
          costo_combustible?: number;
          costo_peaje?: number;
          otros_costos?: number;
          destino?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      clientes: {
        Row: {
          id: string;
          cantera_id: string;
          tipo: 'constructora' | 'ferreteria' | 'persona';
          nombre: string;
          documento: string | null;
          telefono: string | null;
          email: string | null;
          direccion: string | null;
          limite_credito: number;
          estado: 'activo' | 'inactivo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          tipo: 'constructora' | 'ferreteria' | 'persona';
          nombre: string;
          documento?: string | null;
          telefono?: string | null;
          email?: string | null;
          direccion?: string | null;
          limite_credito?: number;
          estado?: 'activo' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          tipo?: 'constructora' | 'ferreteria' | 'persona';
          nombre?: string;
          documento?: string | null;
          telefono?: string | null;
          email?: string | null;
          direccion?: string | null;
          limite_credito?: number;
          estado?: 'activo' | 'inactivo';
          created_at?: string;
          updated_at?: string;
        };
      };
      ventas: {
        Row: {
          id: string;
          cantera_id: string;
          cliente_id: string;
          numero_factura: string;
          fecha: string;
          tipo_pago: 'contado' | 'credito';
          subtotal: number;
          descuento: number;
          total: number;
          estado_pago: 'pendiente' | 'parcial' | 'pagado';
          fecha_vencimiento: string | null;
          viaje_id: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          cliente_id: string;
          numero_factura: string;
          fecha: string;
          tipo_pago: 'contado' | 'credito';
          subtotal: number;
          descuento?: number;
          total: number;
          estado_pago?: 'pendiente' | 'parcial' | 'pagado';
          fecha_vencimiento?: string | null;
          viaje_id?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          cliente_id?: string;
          numero_factura?: string;
          fecha?: string;
          tipo_pago?: 'contado' | 'credito';
          subtotal?: number;
          descuento?: number;
          total?: number;
          estado_pago?: 'pendiente' | 'parcial' | 'pagado';
          fecha_vencimiento?: string | null;
          viaje_id?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      ventas_detalle: {
        Row: {
          id: string;
          venta_id: string;
          tipo_agregado_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          venta_id: string;
          tipo_agregado_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          venta_id?: string;
          tipo_agregado_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          subtotal?: number;
        };
      };
      pagos: {
        Row: {
          id: string;
          venta_id: string;
          monto: number;
          fecha: string;
          metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'otro';
          referencia: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          venta_id: string;
          monto: number;
          fecha: string;
          metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'otro';
          referencia?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          venta_id?: string;
          monto?: number;
          fecha?: string;
          metodo_pago?: 'efectivo' | 'transferencia' | 'cheque' | 'otro';
          referencia?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      gastos: {
        Row: {
          id: string;
          cantera_id: string;
          categoria: 'combustible' | 'mantenimiento' | 'sueldos' | 'repuestos' | 'otro';
          concepto: string;
          monto: number;
          fecha: string;
          proveedor: string | null;
          referencia: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cantera_id: string;
          categoria: 'combustible' | 'mantenimiento' | 'sueldos' | 'repuestos' | 'otro';
          concepto: string;
          monto: number;
          fecha: string;
          proveedor?: string | null;
          referencia?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cantera_id?: string;
          categoria?: 'combustible' | 'mantenimiento' | 'sueldos' | 'repuestos' | 'otro';
          concepto?: string;
          monto?: number;
          fecha?: string;
          proveedor?: string | null;
          referencia?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      precios_clientes: {
        Row: {
          id: string;
          cliente_id: string;
          tipo_agregado_id: string;
          precio: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          tipo_agregado_id: string;
          precio: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          tipo_agregado_id?: string;
          precio?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad';
      tipo_cliente: 'constructora' | 'ferreteria' | 'persona';
      tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
      estado_camion: 'activo' | 'mantenimiento' | 'inactivo';
      tipo_pago: 'contado' | 'credito';
      estado_pago: 'pendiente' | 'parcial' | 'pagado';
      categoria_gasto: 'combustible' | 'mantenimiento' | 'sueldos' | 'repuestos' | 'otro';
    };
  };
};

