-- ============================================
-- FIX: Políticas RLS para profiles
-- ============================================
-- Ejecuta este script en SQL Editor de Supabase para permitir
-- que los usuarios puedan crear y leer su propio perfil

-- Eliminar políticas existentes si es necesario (para evitar duplicados)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Política para que usuarios puedan VER su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para que usuarios puedan ACTUALIZAR su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para que usuarios puedan CREAR su propio perfil
-- IMPORTANTE: Esta política permite que los usuarios recién registrados
-- puedan crear su perfil automáticamente
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para que admins puedan VER todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar que las políticas estén creadas
SELECT * FROM pg_policies WHERE tablename = 'profiles';

