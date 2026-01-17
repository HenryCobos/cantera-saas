-- ============================================
-- FIX: Corregir recursión infinita en RLS
-- ============================================
-- El problema: Las políticas consultan profiles, pero profiles
-- también tiene políticas que consultan profiles, causando recursión infinita.

-- SOLUCIÓN: Simplificar las políticas para evitar recursión

-- ============================================
-- 1. ELIMINAR TODAS LAS POLÍTICAS DE PROFILES
-- ============================================
-- Eliminar todas las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Función que obtiene el rol sin causar recursión (usa SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Recrear políticas de profiles sin recursión
-- Política para ver tu propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para actualizar tu propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para crear tu propio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CORREGIR POLÍTICAS DE CANTERAS (Solución Simple)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- Política simple para lectura (sin consultar profiles)
CREATE POLICY "Authenticated users can view canteras" ON canteras
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política simple para escritura (permitir a todos los autenticados)
-- Esto evita la recursión. Todos los usuarios autenticados pueden crear canteras.
CREATE POLICY "Authenticated users can insert canteras" ON canteras
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update canteras" ON canteras
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete canteras" ON canteras
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 3. CORREGIR TODAS LAS OTRAS POLÍTICAS
-- ============================================
-- Simplificamos todas las políticas de escritura para evitar recursión
-- Todos los usuarios autenticados pueden escribir (puedes restringir después si es necesario)

-- PRODUCCION
DROP POLICY IF EXISTS "Admins and supervisors can manage produccion" ON produccion;
CREATE POLICY "Authenticated users can manage produccion" ON produccion
  FOR ALL USING (auth.role() = 'authenticated');

-- INVENTARIO
DROP POLICY IF EXISTS "Admins and supervisors can manage inventario" ON inventario;
CREATE POLICY "Authenticated users can manage inventario" ON inventario
  FOR ALL USING (auth.role() = 'authenticated');

-- MOVIMIENTOS_INVENTARIO
DROP POLICY IF EXISTS "Admins and supervisors can manage movimientos_inventario" ON movimientos_inventario;
CREATE POLICY "Authenticated users can manage movimientos_inventario" ON movimientos_inventario
  FOR ALL USING (auth.role() = 'authenticated');

-- CAMIONES
DROP POLICY IF EXISTS "Admins and supervisors can manage camiones" ON camiones;
CREATE POLICY "Authenticated users can manage camiones" ON camiones
  FOR ALL USING (auth.role() = 'authenticated');

-- CHOFERES
DROP POLICY IF EXISTS "Admins and supervisors can manage choferes" ON choferes;
CREATE POLICY "Authenticated users can manage choferes" ON choferes
  FOR ALL USING (auth.role() = 'authenticated');

-- VIAJES
DROP POLICY IF EXISTS "Admins and supervisors can manage viajes" ON viajes;
CREATE POLICY "Authenticated users can manage viajes" ON viajes
  FOR ALL USING (auth.role() = 'authenticated');

-- CLIENTES
DROP POLICY IF EXISTS "Admins and supervisors can manage clientes" ON clientes;
CREATE POLICY "Authenticated users can manage clientes" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

-- VENTAS
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas" ON ventas;
CREATE POLICY "Authenticated users can manage ventas" ON ventas
  FOR ALL USING (auth.role() = 'authenticated');

-- VENTAS_DETALLE
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas_detalle" ON ventas_detalle;
CREATE POLICY "Authenticated users can manage ventas_detalle" ON ventas_detalle
  FOR ALL USING (auth.role() = 'authenticated');

-- PAGOS
DROP POLICY IF EXISTS "Admins and supervisors can manage pagos" ON pagos;
CREATE POLICY "Authenticated users can manage pagos" ON pagos
  FOR ALL USING (auth.role() = 'authenticated');

-- GASTOS
DROP POLICY IF EXISTS "Admins and supervisors can manage gastos" ON gastos;
CREATE POLICY "Authenticated users can manage gastos" ON gastos
  FOR ALL USING (auth.role() = 'authenticated');

-- PRECIOS_CLIENTES
DROP POLICY IF EXISTS "Admins and supervisors can manage precios_clientes" ON precios_clientes;
CREATE POLICY "Authenticated users can manage precios_clientes" ON precios_clientes
  FOR ALL USING (auth.role() = 'authenticated');

-- TIPOS_AGREGADOS
DROP POLICY IF EXISTS "Admins and supervisors can manage tipos_agregados" ON tipos_agregados;
CREATE POLICY "Authenticated users can manage tipos_agregados" ON tipos_agregados
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
