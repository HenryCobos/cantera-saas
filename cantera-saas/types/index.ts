import { Database } from '@/lib/supabase/database.types';

// Tipos derivados de las tablas
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Cantera = Database['public']['Tables']['canteras']['Row'];
export type TipoAgregado = Database['public']['Tables']['tipos_agregados']['Row'];
export type Produccion = Database['public']['Tables']['produccion']['Row'];
export type Inventario = Database['public']['Tables']['inventario']['Row'];
export type MovimientoInventario = Database['public']['Tables']['movimientos_inventario']['Row'];
export type Camion = Database['public']['Tables']['camiones']['Row'];
export type Chofer = Database['public']['Tables']['choferes']['Row'];
export type Viaje = Database['public']['Tables']['viajes']['Row'];
export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Venta = Database['public']['Tables']['ventas']['Row'];
export type VentaDetalle = Database['public']['Tables']['ventas_detalle']['Row'];
export type Pago = Database['public']['Tables']['pagos']['Row'];
export type Gasto = Database['public']['Tables']['gastos']['Row'];
export type PrecioCliente = Database['public']['Tables']['precios_clientes']['Row'];

// Tipos para inserts
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CanteraInsert = Database['public']['Tables']['canteras']['Insert'];
export type TipoAgregadoInsert = Database['public']['Tables']['tipos_agregados']['Insert'];
export type ProduccionInsert = Database['public']['Tables']['produccion']['Insert'];
export type InventarioInsert = Database['public']['Tables']['inventario']['Insert'];
export type MovimientoInventarioInsert = Database['public']['Tables']['movimientos_inventario']['Insert'];
export type CamionInsert = Database['public']['Tables']['camiones']['Insert'];
export type ChoferInsert = Database['public']['Tables']['choferes']['Insert'];
export type ViajeInsert = Database['public']['Tables']['viajes']['Insert'];
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
export type VentaInsert = Database['public']['Tables']['ventas']['Insert'];
export type VentaDetalleInsert = Database['public']['Tables']['ventas_detalle']['Insert'];
export type PagoInsert = Database['public']['Tables']['pagos']['Insert'];
export type GastoInsert = Database['public']['Tables']['gastos']['Insert'];
export type PrecioClienteInsert = Database['public']['Tables']['precios_clientes']['Insert'];

// Roles
export type UserRole = 'admin' | 'supervisor' | 'operador' | 'ventas' | 'contabilidad';

// Interfaces útiles
export interface ProduccionConDetalles extends Produccion {
  tipo_agregado: TipoAgregado;
  operador?: Profile;
}

export interface VentaConDetalles extends Venta {
  cliente: Cliente;
  viaje?: Viaje;
  detalles: (VentaDetalle & { tipo_agregado: TipoAgregado })[];
  pagos: Pago[];
}

export interface InventarioConDetalles extends Inventario {
  tipo_agregado: TipoAgregado;
}

export interface ViajeConDetalles extends Viaje {
  camion: Camion;
  chofer: Chofer;
  venta?: Venta;
}

