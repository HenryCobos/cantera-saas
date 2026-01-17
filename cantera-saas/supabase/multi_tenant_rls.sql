-- ============================================
-- RLS MULTI-TENANT (FILTRADO POR ORGANIZACIÓN)
-- ============================================
-- Actualiza todas las políticas RLS para filtrar por organization_id
-- Ejecuta este script DESPUÉS de ejecutar multi_tenant_schema.sql

-- ============================================
-- 0. CREAR FUNCIONES HELPER (PRIMERO)
-- ============================================
-- IMPORTANTE: Las funciones helper deben crearse ANTES de las políticas
-- que las usan, para evitar errores de "function does not exist"

-- Función helper para obtener organization_id sin causar recursión
-- Usa SECURITY DEFINER para evitar RLS en esta función
CREATE OR REPLACE FUNCTION public.get_user_organization_id_helper()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función helper para verificar si es admin sin causar recursión
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- HABILITAR RLS EN ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. POLÍTICAS PARA ORGANIZATIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON organizations;

-- Los usuarios solo pueden ver su propia organización
-- Usamos la función helper para evitar recursión
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id = public.get_user_organization_id_helper()
  );

-- Solo el owner puede actualizar su organización
CREATE POLICY "Users can update own organization" ON organizations
  FOR UPDATE USING (
    owner_id = auth.uid() AND
    id = public.get_user_organization_id_helper()
  );

-- ============================================
-- 2. POLÍTICAS PARA PROFILES (MULTI-TENANT)
-- ============================================
-- IMPORTANTE: Para evitar recursión infinita, usamos funciones SECURITY DEFINER
-- que no están sujetas a RLS, o simplificamos las políticas

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Los usuarios pueden ver perfiles de su organización
-- Usamos la función helper para evitar recursión
CREATE POLICY "Users can view profiles in own organization" ON profiles
  FOR SELECT USING (
    organization_id = public.get_user_organization_id_helper()
  );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Solo admins pueden crear usuarios en su organización
-- En WITH CHECK, la columna 'organization_id' se refiere al valor que se está insertando
CREATE POLICY "Admins can insert profiles in own organization" ON profiles
  FOR INSERT WITH CHECK (
    organization_id = public.get_user_organization_id_helper() AND
    public.check_is_admin()
  );

-- Permitir que los usuarios creen su propio perfil (para el registro inicial)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. POLÍTICAS PARA CANTERAS (MULTI-TENANT)
-- ============================================
-- Eliminar políticas antiguas y nuevas para evitar conflictos
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Users can view canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can insert canteras" ON canteras;
DROP POLICY IF EXISTS "Users can insert canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can update canteras" ON canteras;
DROP POLICY IF EXISTS "Users can update canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can delete canteras" ON canteras;
DROP POLICY IF EXISTS "Users can delete canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- Los usuarios solo pueden ver canteras de su organización
-- Usamos la función helper para evitar recursión
CREATE POLICY "Users can view canteras in own organization" ON canteras
  FOR SELECT USING (
    organization_id = public.get_user_organization_id_helper()
  );

-- Los usuarios autenticados pueden crear canteras en su organización
CREATE POLICY "Users can insert canteras in own organization" ON canteras
  FOR INSERT WITH CHECK (
    organization_id = public.get_user_organization_id_helper()
  );

-- Los usuarios pueden actualizar canteras de su organización
CREATE POLICY "Users can update canteras in own organization" ON canteras
  FOR UPDATE USING (
    organization_id = public.get_user_organization_id_helper()
  );

-- Los usuarios pueden eliminar canteras de su organización
CREATE POLICY "Users can delete canteras in own organization" ON canteras
  FOR DELETE USING (
    organization_id = public.get_user_organization_id_helper()
  );

-- ============================================
-- 4. ACTUALIZAR POLÍTICAS DE OTRAS TABLAS
-- ============================================
-- Todas las tablas que tienen cantera_id ahora deben filtrar por organization_id
-- a través de la relación cantera -> organization

-- PRODUCCION
DROP POLICY IF EXISTS "Authenticated users can view produccion" ON produccion;
DROP POLICY IF EXISTS "Users can view produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can insert produccion" ON produccion;
DROP POLICY IF EXISTS "Users can insert produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can manage produccion" ON produccion;
DROP POLICY IF EXISTS "Users can manage produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Admins and supervisors can manage produccion" ON produccion;

CREATE POLICY "Users can view produccion in own organization" ON produccion
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert produccion in own organization" ON produccion
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage produccion in own organization" ON produccion
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- INVENTARIO
DROP POLICY IF EXISTS "Authenticated users can view inventario" ON inventario;
DROP POLICY IF EXISTS "Users can view inventario in own organization" ON inventario;
DROP POLICY IF EXISTS "Authenticated users can manage inventario" ON inventario;
DROP POLICY IF EXISTS "Users can manage inventario in own organization" ON inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage inventario" ON inventario;

CREATE POLICY "Users can view inventario in own organization" ON inventario
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage inventario in own organization" ON inventario
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- MOVIMIENTOS_INVENTARIO
DROP POLICY IF EXISTS "Authenticated users can view movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Authenticated users can manage movimientos_inventario" ON movimientos_inventario;

CREATE POLICY "Users can view movimientos_inventario in own organization" ON movimientos_inventario
  FOR SELECT USING (
    inventario_id IN (
      SELECT i.id FROM inventario i
      INNER JOIN canteras c ON i.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage movimientos_inventario in own organization" ON movimientos_inventario
  FOR ALL USING (
    inventario_id IN (
      SELECT i.id FROM inventario i
      INNER JOIN canteras c ON i.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- TIPOS_AGREGADOS
DROP POLICY IF EXISTS "Authenticated users can view tipos_agregados" ON tipos_agregados;
DROP POLICY IF EXISTS "Authenticated users can manage tipos_agregados" ON tipos_agregados;

CREATE POLICY "Users can view tipos_agregados in own organization" ON tipos_agregados
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage tipos_agregados in own organization" ON tipos_agregados
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- CAMIONES
DROP POLICY IF EXISTS "Authenticated users can view camiones" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can insert camiones" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can manage camiones" ON camiones;

CREATE POLICY "Users can view camiones in own organization" ON camiones
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert camiones in own organization" ON camiones
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage camiones in own organization" ON camiones
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- CHOFERES
DROP POLICY IF EXISTS "Authenticated users can view choferes" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can insert choferes" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can manage choferes" ON choferes;

CREATE POLICY "Users can view choferes in own organization" ON choferes
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert choferes in own organization" ON choferes
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage choferes in own organization" ON choferes
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- VIAJES
DROP POLICY IF EXISTS "Authenticated users can view viajes" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can insert viajes" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can manage viajes" ON viajes;

CREATE POLICY "Users can view viajes in own organization" ON viajes
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert viajes in own organization" ON viajes
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage viajes in own organization" ON viajes
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- CLIENTES
DROP POLICY IF EXISTS "Authenticated users can view clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can manage clientes" ON clientes;

CREATE POLICY "Users can view clientes in own organization" ON clientes
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert clientes in own organization" ON clientes
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage clientes in own organization" ON clientes
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- VENTAS
DROP POLICY IF EXISTS "Authenticated users can view ventas" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can insert ventas" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can manage ventas" ON ventas;

CREATE POLICY "Users can view ventas in own organization" ON ventas
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert ventas in own organization" ON ventas
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ventas in own organization" ON ventas
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- VENTAS_DETALLE
DROP POLICY IF EXISTS "Authenticated users can view ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can insert ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can manage ventas_detalle" ON ventas_detalle;

CREATE POLICY "Users can view ventas_detalle in own organization" ON ventas_detalle
  FOR SELECT USING (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert ventas_detalle in own organization" ON ventas_detalle
  FOR INSERT WITH CHECK (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ventas_detalle in own organization" ON ventas_detalle
  FOR ALL USING (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- PAGOS
DROP POLICY IF EXISTS "Authenticated users can view pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can insert pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can manage pagos" ON pagos;

CREATE POLICY "Users can view pagos in own organization" ON pagos
  FOR SELECT USING (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert pagos in own organization" ON pagos
  FOR INSERT WITH CHECK (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage pagos in own organization" ON pagos
  FOR ALL USING (
    venta_id IN (
      SELECT v.id FROM ventas v
      INNER JOIN canteras c ON v.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- GASTOS
DROP POLICY IF EXISTS "Authenticated users can view gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can insert gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can manage gastos" ON gastos;

CREATE POLICY "Users can view gastos in own organization" ON gastos
  FOR SELECT USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert gastos in own organization" ON gastos
  FOR INSERT WITH CHECK (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage gastos in own organization" ON gastos
  FOR ALL USING (
    cantera_id IN (
      SELECT id FROM canteras 
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- PRECIOS_CLIENTES
DROP POLICY IF EXISTS "Authenticated users can view precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can insert precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can manage precios_clientes" ON precios_clientes;

CREATE POLICY "Users can view precios_clientes in own organization" ON precios_clientes
  FOR SELECT USING (
    cliente_id IN (
      SELECT cl.id FROM clientes cl
      INNER JOIN canteras c ON cl.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert precios_clientes in own organization" ON precios_clientes
  FOR INSERT WITH CHECK (
    cliente_id IN (
      SELECT cl.id FROM clientes cl
      INNER JOIN canteras c ON cl.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage precios_clientes in own organization" ON precios_clientes
  FOR ALL USING (
    cliente_id IN (
      SELECT cl.id FROM clientes cl
      INNER JOIN canteras c ON cl.cantera_id = c.id
      WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

