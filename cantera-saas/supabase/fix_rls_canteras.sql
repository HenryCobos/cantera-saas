-- ============================================
-- FIX: Políticas RLS para canteras
-- ============================================
-- Ejecuta este script en SQL Editor de Supabase para permitir
-- que los usuarios autenticados puedan leer canteras

-- Eliminar políticas existentes si es necesario
DROP POLICY IF EXISTS "Authenticated users can view canteras" ON canteras;
DROP POLICY IF EXISTS "Admins and supervisors can manage canteras" ON canteras;

-- Política para que usuarios autenticados puedan VER canteras
CREATE POLICY "Authenticated users can view canteras" ON canteras
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que admins y supervisores puedan GESTIONAR canteras
CREATE POLICY "Admins and supervisors can manage canteras" ON canteras
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Verificar que las políticas estén creadas
SELECT * FROM pg_policies WHERE tablename = 'canteras';

