-- ============================================
-- ESQUEMA DE BASE DE DATOS - CANTERA SaaS
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: profiles (perfiles de usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'supervisor', 'operador', 'ventas', 'contabilidad')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: canteras
-- ============================================
CREATE TABLE IF NOT EXISTS canteras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: tipos_agregados
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_agregados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  unidad_medida TEXT NOT NULL DEFAULT 'm3',
  precio_base DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(cantera_id, nombre)
);

-- ============================================
-- TABLA: produccion
-- ============================================
CREATE TABLE IF NOT EXISTS produccion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  tipo_agregado_id UUID NOT NULL REFERENCES tipos_agregados(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  maquina TEXT,
  operador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  merma DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_produccion_fecha ON produccion(fecha);
CREATE INDEX idx_produccion_cantera ON produccion(cantera_id);
CREATE INDEX idx_produccion_tipo_agregado ON produccion(tipo_agregado_id);

-- ============================================
-- TABLA: inventario
-- ============================================
CREATE TABLE IF NOT EXISTS inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  tipo_agregado_id UUID NOT NULL REFERENCES tipos_agregados(id) ON DELETE RESTRICT,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cantidad_minima DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(cantera_id, tipo_agregado_id)
);

CREATE INDEX idx_inventario_cantera ON inventario(cantera_id);

-- ============================================
-- TABLA: movimientos_inventario
-- ============================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventario_id UUID NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad DECIMAL(10, 2) NOT NULL,
  motivo TEXT,
  referencia_id UUID,
  referencia_tipo TEXT, -- 'produccion', 'venta', 'ajuste_manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_movimientos_inventario ON movimientos_inventario(inventario_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(created_at);

-- ============================================
-- TABLA: camiones
-- ============================================
CREATE TABLE IF NOT EXISTS camiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  placa TEXT NOT NULL UNIQUE,
  capacidad_metros DECIMAL(10, 2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'mantenimiento', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_camiones_cantera ON camiones(cantera_id);

-- ============================================
-- TABLA: choferes
-- ============================================
CREATE TABLE IF NOT EXISTS choferes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  licencia TEXT,
  telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_choferes_cantera ON choferes(cantera_id);

-- ============================================
-- TABLA: viajes
-- ============================================
CREATE TABLE IF NOT EXISTS viajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  camion_id UUID NOT NULL REFERENCES camiones(id) ON DELETE RESTRICT,
  chofer_id UUID NOT NULL REFERENCES choferes(id) ON DELETE RESTRICT,
  venta_id UUID,
  fecha DATE NOT NULL,
  cantidad_metros DECIMAL(10, 2) NOT NULL,
  costo_combustible DECIMAL(10, 2) DEFAULT 0,
  costo_peaje DECIMAL(10, 2) DEFAULT 0,
  otros_costos DECIMAL(10, 2) DEFAULT 0,
  destino TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_viajes_fecha ON viajes(fecha);
CREATE INDEX idx_viajes_cantera ON viajes(cantera_id);
CREATE INDEX idx_viajes_venta ON viajes(venta_id);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('constructora', 'ferreteria', 'persona')),
  nombre TEXT NOT NULL,
  documento TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  limite_credito DECIMAL(10, 2) DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_clientes_cantera ON clientes(cantera_id);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);

-- ============================================
-- TABLA: ventas
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  numero_factura TEXT NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  tipo_pago TEXT NOT NULL CHECK (tipo_pago IN ('contado', 'credito')),
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'parcial', 'pagado')),
  fecha_vencimiento DATE,
  viaje_id UUID REFERENCES viajes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cantera ON ventas(cantera_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_estado_pago ON ventas(estado_pago);

-- ============================================
-- TABLA: ventas_detalle
-- ============================================
CREATE TABLE IF NOT EXISTS ventas_detalle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  tipo_agregado_id UUID NOT NULL REFERENCES tipos_agregados(id) ON DELETE RESTRICT,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_ventas_detalle_venta ON ventas_detalle(venta_id);

-- ============================================
-- TABLA: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque', 'otro')),
  referencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pagos_venta ON pagos(venta_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);

-- ============================================
-- TABLA: gastos
-- ============================================
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cantera_id UUID NOT NULL REFERENCES canteras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('combustible', 'mantenimiento', 'sueldos', 'repuestos', 'otro')),
  concepto TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  proveedor TEXT,
  referencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_cantera ON gastos(cantera_id);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

-- ============================================
-- TABLA: precios_clientes (precios especiales por cliente)
-- ============================================
CREATE TABLE IF NOT EXISTS precios_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_agregado_id UUID NOT NULL REFERENCES tipos_agregados(id) ON DELETE CASCADE,
  precio DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(cliente_id, tipo_agregado_id)
);

CREATE INDEX idx_precios_clientes_cliente ON precios_clientes(cliente_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canteras_updated_at BEFORE UPDATE ON canteras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_agregados_updated_at BEFORE UPDATE ON tipos_agregados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camiones_updated_at BEFORE UPDATE ON camiones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_choferes_updated_at BEFORE UPDATE ON choferes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_precios_clientes_updated_at BEFORE UPDATE ON precios_clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'operador');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar inventario cuando se registra producción
CREATE OR REPLACE FUNCTION actualizar_inventario_produccion()
RETURNS TRIGGER AS $$
DECLARE
  inv_id UUID;
  cantera_uuid UUID;
BEGIN
  -- Obtener cantera_id desde tipo_agregado
  SELECT cantera_id INTO cantera_uuid FROM tipos_agregados WHERE id = NEW.tipo_agregado_id;
  
  -- Buscar o crear registro de inventario
  SELECT id INTO inv_id 
  FROM inventario 
  WHERE cantera_id = cantera_uuid AND tipo_agregado_id = NEW.tipo_agregado_id;
  
  IF inv_id IS NULL THEN
    INSERT INTO inventario (cantera_id, tipo_agregado_id, cantidad)
    VALUES (cantera_uuid, NEW.tipo_agregado_id, NEW.cantidad - COALESCE(NEW.merma, 0))
    RETURNING id INTO inv_id;
  ELSE
    UPDATE inventario 
    SET cantidad = cantidad + (NEW.cantidad - COALESCE(NEW.merma, 0))
    WHERE id = inv_id;
  END IF;
  
  -- Registrar movimiento
  INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, referencia_id, referencia_tipo, created_by)
  VALUES (inv_id, 'entrada', NEW.cantidad - COALESCE(NEW.merma, 0), 'Producción diaria', NEW.id, 'produccion', NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_inventario_produccion
  AFTER INSERT ON produccion
  FOR EACH ROW EXECUTE FUNCTION actualizar_inventario_produccion();

-- Función para actualizar inventario cuando se registra una venta
CREATE OR REPLACE FUNCTION actualizar_inventario_venta()
RETURNS TRIGGER AS $$
DECLARE
  inv_id UUID;
  cantera_uuid UUID;
BEGIN
  -- Obtener cantera_id desde venta
  SELECT cantera_id INTO cantera_uuid FROM ventas WHERE id = NEW.venta_id;
  
  -- Buscar inventario
  SELECT id INTO inv_id 
  FROM inventario 
  WHERE cantera_id = cantera_uuid AND tipo_agregado_id = NEW.tipo_agregado_id;
  
  IF inv_id IS NOT NULL THEN
    UPDATE inventario 
    SET cantidad = cantidad - NEW.cantidad
    WHERE id = inv_id;
    
    -- Registrar movimiento
    INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, referencia_id, referencia_tipo, created_by)
    SELECT inv_id, 'salida', NEW.cantidad, 'Venta', NEW.venta_id, 'venta', created_by
    FROM ventas WHERE id = NEW.venta_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_inventario_venta
  AFTER INSERT ON ventas_detalle
  FOR EACH ROW EXECUTE FUNCTION actualizar_inventario_venta();

-- Función para actualizar estado de pago en venta
CREATE OR REPLACE FUNCTION actualizar_estado_pago_venta()
RETURNS TRIGGER AS $$
DECLARE
  total_pagado DECIMAL(10, 2);
  total_venta DECIMAL(10, 2);
  nuevo_estado TEXT;
BEGIN
  -- Calcular total pagado
  SELECT COALESCE(SUM(monto), 0) INTO total_pagado
  FROM pagos
  WHERE venta_id = NEW.venta_id;
  
  -- Obtener total de la venta
  SELECT total INTO total_venta
  FROM ventas
  WHERE id = NEW.venta_id;
  
  -- Determinar nuevo estado
  IF total_pagado >= total_venta THEN
    nuevo_estado := 'pagado';
  ELSIF total_pagado > 0 THEN
    nuevo_estado := 'parcial';
  ELSE
    nuevo_estado := 'pendiente';
  END IF;
  
  -- Actualizar estado
  UPDATE ventas
  SET estado_pago = nuevo_estado
  WHERE id = NEW.venta_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado_pago
  AFTER INSERT OR UPDATE OR DELETE ON pagos
  FOR EACH ROW EXECUTE FUNCTION actualizar_estado_pago_venta();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_agregados ENABLE ROW LEVEL SECURITY;
ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE camiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE choferes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para canteras (todos los usuarios autenticados pueden ver)
CREATE POLICY "Authenticated users can view canteras" ON canteras
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage canteras" ON canteras
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Políticas similares para otras tablas (simplificadas - todos autenticados pueden leer, solo admin/supervisor escribir)
-- Por simplicidad, aquí un ejemplo para tipos_agregados:

CREATE POLICY "Authenticated users can view tipos_agregados" ON tipos_agregados
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage tipos_agregados" ON tipos_agregados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Política similar para otras tablas críticas
-- En producción, deberías definir políticas más específicas según los permisos de cada rol

