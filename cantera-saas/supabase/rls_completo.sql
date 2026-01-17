-- ============================================
-- POLÍTICAS RLS COMPLETAS PARA TODO EL SISTEMA
-- ============================================
-- Ejecuta este script en SQL Editor de Supabase
-- Esto habilitará el acceso correcto a todas las tablas

-- ============================================
-- 1. PRODUCCION
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view produccion" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can insert produccion" ON produccion;
DROP POLICY IF EXISTS "Admins and supervisors can manage produccion" ON produccion;

CREATE POLICY "Authenticated users can view produccion" ON produccion
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert produccion" ON produccion
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage produccion" ON produccion
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 2. INVENTARIO
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view inventario" ON inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage inventario" ON inventario;

CREATE POLICY "Authenticated users can view inventario" ON inventario
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage inventario" ON inventario
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 3. MOVIMIENTOS_INVENTARIO
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage movimientos_inventario" ON movimientos_inventario;

CREATE POLICY "Authenticated users can view movimientos_inventario" ON movimientos_inventario
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage movimientos_inventario" ON movimientos_inventario
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 4. CAMIONES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view camiones" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can insert camiones" ON camiones;
DROP POLICY IF EXISTS "Admins and supervisors can manage camiones" ON camiones;

CREATE POLICY "Authenticated users can view camiones" ON camiones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert camiones" ON camiones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage camiones" ON camiones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 5. CHOFERES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view choferes" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can insert choferes" ON choferes;
DROP POLICY IF EXISTS "Admins and supervisors can manage choferes" ON choferes;

CREATE POLICY "Authenticated users can view choferes" ON choferes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert choferes" ON choferes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage choferes" ON choferes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 6. VIAJES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view viajes" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can insert viajes" ON viajes;
DROP POLICY IF EXISTS "Admins and supervisors can manage viajes" ON viajes;

CREATE POLICY "Authenticated users can view viajes" ON viajes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert viajes" ON viajes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage viajes" ON viajes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 7. CLIENTES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage clientes" ON clientes;

CREATE POLICY "Authenticated users can view clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage clientes" ON clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 8. VENTAS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view ventas" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can insert ventas" ON ventas;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas" ON ventas;

CREATE POLICY "Authenticated users can view ventas" ON ventas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert ventas" ON ventas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage ventas" ON ventas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 9. VENTAS_DETALLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can insert ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas_detalle" ON ventas_detalle;

CREATE POLICY "Authenticated users can view ventas_detalle" ON ventas_detalle
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert ventas_detalle" ON ventas_detalle
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage ventas_detalle" ON ventas_detalle
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 10. PAGOS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can insert pagos" ON pagos;
DROP POLICY IF EXISTS "Admins and supervisors can manage pagos" ON pagos;

CREATE POLICY "Authenticated users can view pagos" ON pagos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert pagos" ON pagos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage pagos" ON pagos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 11. GASTOS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can insert gastos" ON gastos;
DROP POLICY IF EXISTS "Admins and supervisors can manage gastos" ON gastos;

CREATE POLICY "Authenticated users can view gastos" ON gastos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert gastos" ON gastos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage gastos" ON gastos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 12. PRECIOS_CLIENTES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can insert precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage precios_clientes" ON precios_clientes;

CREATE POLICY "Authenticated users can view precios_clientes" ON precios_clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert precios_clientes" ON precios_clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and supervisors can manage precios_clientes" ON precios_clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que todas las políticas estén creadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

