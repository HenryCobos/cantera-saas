-- ============================================
-- LIMPIEZA COMPLETA DE POLÍTICAS RLS
-- ============================================
-- Ejecuta este script PRIMERO si hay conflictos de políticas existentes
-- Luego ejecuta fix_recursion_rls.sql

-- Eliminar TODAS las políticas de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Eliminar TODAS las políticas de canteras
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can insert canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can update canteras" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can delete canteras" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- Eliminar políticas de otras tablas que puedan causar conflictos
DROP POLICY IF EXISTS "Authenticated users can view produccion" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can insert produccion" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can manage produccion" ON produccion;
DROP POLICY IF EXISTS "Admins and supervisors can manage produccion" ON produccion;

DROP POLICY IF EXISTS "Authenticated users can view inventario" ON inventario;
DROP POLICY IF EXISTS "Authenticated users can manage inventario" ON inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage inventario" ON inventario;

DROP POLICY IF EXISTS "Authenticated users can view movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Authenticated users can manage movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage movimientos_inventario" ON movimientos_inventario;

DROP POLICY IF EXISTS "Authenticated users can view camiones" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can insert camiones" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can manage camiones" ON camiones;
DROP POLICY IF EXISTS "Admins and supervisors can manage camiones" ON camiones;

DROP POLICY IF EXISTS "Authenticated users can view choferes" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can insert choferes" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can manage choferes" ON choferes;
DROP POLICY IF EXISTS "Admins and supervisors can manage choferes" ON choferes;

DROP POLICY IF EXISTS "Authenticated users can view viajes" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can insert viajes" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can manage viajes" ON viajes;
DROP POLICY IF EXISTS "Admins and supervisors can manage viajes" ON viajes;

DROP POLICY IF EXISTS "Authenticated users can view clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can manage clientes" ON clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage clientes" ON clientes;

DROP POLICY IF EXISTS "Authenticated users can view ventas" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can insert ventas" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can manage ventas" ON ventas;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas" ON ventas;

DROP POLICY IF EXISTS "Authenticated users can view ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can insert ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can manage ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas_detalle" ON ventas_detalle;

DROP POLICY IF EXISTS "Authenticated users can view pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can insert pagos" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can manage pagos" ON pagos;
DROP POLICY IF EXISTS "Admins and supervisors can manage pagos" ON pagos;

DROP POLICY IF EXISTS "Authenticated users can view gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can insert gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can manage gastos" ON gastos;
DROP POLICY IF EXISTS "Admins and supervisors can manage gastos" ON gastos;

DROP POLICY IF EXISTS "Authenticated users can view precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can insert precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can manage precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage precios_clientes" ON precios_clientes;

DROP POLICY IF EXISTS "Authenticated users can view tipos_agregados" ON tipos_agregados;
DROP POLICY IF EXISTS "Authenticated users can manage tipos_agregados" ON tipos_agregados;
DROP POLICY IF EXISTS "Admins and supervisors can manage tipos_agregados" ON tipos_agregados;

-- Verificar políticas restantes
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

