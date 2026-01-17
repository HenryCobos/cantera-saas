-- ============================================
-- LIMPIEZA DE POLÍTICAS RLS MULTI-TENANT
-- ============================================
-- Ejecuta este script ANTES de ejecutar multi_tenant_rls.sql
-- si encuentras errores de "policy already exists"

-- ============================================
-- ORGANIZATIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON organizations;

-- ============================================
-- PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in own organization" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- ============================================
-- CANTERAS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Users can view canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can insert canteras" ON canteras;
DROP POLICY IF EXISTS "Users can insert canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can update canteras" ON canteras;
DROP POLICY IF EXISTS "Users can update canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Authenticated users can delete canteras" ON canteras;
DROP POLICY IF EXISTS "Users can delete canteras in own organization" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- ============================================
-- PRODUCCION
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view produccion" ON produccion;
DROP POLICY IF EXISTS "Users can view produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can insert produccion" ON produccion;
DROP POLICY IF EXISTS "Users can insert produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Authenticated users can manage produccion" ON produccion;
DROP POLICY IF EXISTS "Users can manage produccion in own organization" ON produccion;
DROP POLICY IF EXISTS "Admins and supervisors can manage produccion" ON produccion;

-- ============================================
-- INVENTARIO
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view inventario" ON inventario;
DROP POLICY IF EXISTS "Users can view inventario in own organization" ON inventario;
DROP POLICY IF EXISTS "Authenticated users can manage inventario" ON inventario;
DROP POLICY IF EXISTS "Users can manage inventario in own organization" ON inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage inventario" ON inventario;

-- ============================================
-- MOVIMIENTOS_INVENTARIO
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Users can view movimientos_inventario in own organization" ON movimientos_inventario;
DROP POLICY IF EXISTS "Authenticated users can manage movimientos_inventario" ON movimientos_inventario;
DROP POLICY IF EXISTS "Users can manage movimientos_inventario in own organization" ON movimientos_inventario;
DROP POLICY IF EXISTS "Admins and supervisors can manage movimientos_inventario" ON movimientos_inventario;

-- ============================================
-- TIPOS_AGREGADOS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view tipos_agregados" ON tipos_agregados;
DROP POLICY IF EXISTS "Users can view tipos_agregados in own organization" ON tipos_agregados;
DROP POLICY IF EXISTS "Authenticated users can manage tipos_agregados" ON tipos_agregados;
DROP POLICY IF EXISTS "Users can manage tipos_agregados in own organization" ON tipos_agregados;
DROP POLICY IF EXISTS "Admins and supervisors can manage tipos_agregados" ON tipos_agregados;

-- ============================================
-- CAMIONES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view camiones" ON camiones;
DROP POLICY IF EXISTS "Users can view camiones in own organization" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can insert camiones" ON camiones;
DROP POLICY IF EXISTS "Users can insert camiones in own organization" ON camiones;
DROP POLICY IF EXISTS "Authenticated users can manage camiones" ON camiones;
DROP POLICY IF EXISTS "Users can manage camiones in own organization" ON camiones;
DROP POLICY IF EXISTS "Admins and supervisors can manage camiones" ON camiones;

-- ============================================
-- CHOFERES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view choferes" ON choferes;
DROP POLICY IF EXISTS "Users can view choferes in own organization" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can insert choferes" ON choferes;
DROP POLICY IF EXISTS "Users can insert choferes in own organization" ON choferes;
DROP POLICY IF EXISTS "Authenticated users can manage choferes" ON choferes;
DROP POLICY IF EXISTS "Users can manage choferes in own organization" ON choferes;
DROP POLICY IF EXISTS "Admins and supervisors can manage choferes" ON choferes;

-- ============================================
-- VIAJES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view viajes" ON viajes;
DROP POLICY IF EXISTS "Users can view viajes in own organization" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can insert viajes" ON viajes;
DROP POLICY IF EXISTS "Users can insert viajes in own organization" ON viajes;
DROP POLICY IF EXISTS "Authenticated users can manage viajes" ON viajes;
DROP POLICY IF EXISTS "Users can manage viajes in own organization" ON viajes;
DROP POLICY IF EXISTS "Admins and supervisors can manage viajes" ON viajes;

-- ============================================
-- CLIENTES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view clientes" ON clientes;
DROP POLICY IF EXISTS "Users can view clientes in own organization" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
DROP POLICY IF EXISTS "Users can insert clientes in own organization" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can manage clientes" ON clientes;
DROP POLICY IF EXISTS "Users can manage clientes in own organization" ON clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage clientes" ON clientes;

-- ============================================
-- VENTAS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view ventas" ON ventas;
DROP POLICY IF EXISTS "Users can view ventas in own organization" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can insert ventas" ON ventas;
DROP POLICY IF EXISTS "Users can insert ventas in own organization" ON ventas;
DROP POLICY IF EXISTS "Authenticated users can manage ventas" ON ventas;
DROP POLICY IF EXISTS "Users can manage ventas in own organization" ON ventas;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas" ON ventas;

-- ============================================
-- VENTAS_DETALLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Users can view ventas_detalle in own organization" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can insert ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Users can insert ventas_detalle in own organization" ON ventas_detalle;
DROP POLICY IF EXISTS "Authenticated users can manage ventas_detalle" ON ventas_detalle;
DROP POLICY IF EXISTS "Users can manage ventas_detalle in own organization" ON ventas_detalle;
DROP POLICY IF EXISTS "Admins and supervisors can manage ventas_detalle" ON ventas_detalle;

-- ============================================
-- PAGOS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view pagos" ON pagos;
DROP POLICY IF EXISTS "Users can view pagos in own organization" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can insert pagos" ON pagos;
DROP POLICY IF EXISTS "Users can insert pagos in own organization" ON pagos;
DROP POLICY IF EXISTS "Authenticated users can manage pagos" ON pagos;
DROP POLICY IF EXISTS "Users can manage pagos in own organization" ON pagos;
DROP POLICY IF EXISTS "Admins and supervisors can manage pagos" ON pagos;

-- ============================================
-- GASTOS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view gastos" ON gastos;
DROP POLICY IF EXISTS "Users can view gastos in own organization" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can insert gastos" ON gastos;
DROP POLICY IF EXISTS "Users can insert gastos in own organization" ON gastos;
DROP POLICY IF EXISTS "Authenticated users can manage gastos" ON gastos;
DROP POLICY IF EXISTS "Users can manage gastos in own organization" ON gastos;
DROP POLICY IF EXISTS "Admins and supervisors can manage gastos" ON gastos;

-- ============================================
-- PRECIOS_CLIENTES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Users can view precios_clientes in own organization" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can insert precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Users can insert precios_clientes in own organization" ON precios_clientes;
DROP POLICY IF EXISTS "Authenticated users can manage precios_clientes" ON precios_clientes;
DROP POLICY IF EXISTS "Users can manage precios_clientes in own organization" ON precios_clientes;
DROP POLICY IF EXISTS "Admins and supervisors can manage precios_clientes" ON precios_clientes;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Políticas eliminadas correctamente. Ahora puedes ejecutar multi_tenant_rls.sql' as mensaje;

