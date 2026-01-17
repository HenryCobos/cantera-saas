# 🔍 Diagnóstico de Problemas de Login

## Pasos para Diagnosticar

### 1. Abrir la Consola del Navegador

1. Presiona **F12** o **Ctrl+Shift+I** para abrir DevTools
2. Ve a la pestaña **"Console"**
3. Intenta iniciar sesión
4. Revisa los mensajes que aparecen (deberían verse logs como "Iniciando login...", "Autenticación exitosa...", etc.)

### 2. Verificar en Supabase que el Usuario Existe

1. Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/auth/users
2. Verifica que el usuario con email `hcobos99@gmail.com` exista
3. Si no existe, créalo:
   - Authentication > Users > Add user > Create new user
   - Email: `hcobos99@gmail.com`
   - Password: [tu contraseña]
   - Marca "Auto Confirm User"

### 3. Verificar que el Usuario Tenga Perfil

1. Ve a SQL Editor en Supabase
2. Ejecuta esta query:
   ```sql
   SELECT * FROM profiles WHERE email = 'hcobos99@gmail.com';
   ```
3. **Si NO devuelve ningún resultado**, el perfil no existe. Crea el perfil:
   ```sql
   INSERT INTO profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'hcobos99@gmail.com';
   ```

### 4. Verificar RLS (Row Level Security)

Si el perfil existe pero aún no funciona, puede ser un problema de permisos RLS. Ejecuta:

```sql
-- Verificar políticas de profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Si es necesario, dar acceso completo temporalmente para testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**IMPORTANTE**: Solo deshabilita RLS para pruebas. Luego vuelve a habilitarlo:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 5. Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga las credenciales correctas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qpurlnilvoviitymikfy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Limpiar Cookies y LocalStorage

En el navegador:
1. Abre DevTools (F12)
2. Ve a Application > Storage
3. Limpia:
   - Cookies (todos los de localhost)
   - Local Storage
   - Session Storage
4. Recarga la página

## Mensajes de Error Comunes

### "Invalid login credentials"
- **Solución**: Verifica que el email y password sean correctos en Supabase

### "User not found"
- **Solución**: Crea el usuario en Supabase Authentication

### "Profile not found"
- **Solución**: Crea el perfil en la tabla profiles (ver paso 3)

### La página se recarga pero no redirige
- **Solución**: Revisa la consola del navegador para ver errores JavaScript
- Verifica que las cookies se estén estableciendo correctamente

## Solución Rápida: Crear Perfil Manualmente

Si el trigger no funcionó, ejecuta esto en SQL Editor:

```sql
-- Crear perfil para el usuario si no existe
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'hcobos99@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Probar Login Después de Correcciones

1. Recarga la página (Ctrl+F5 para forzar recarga completa)
2. Abre la consola (F12 > Console)
3. Intenta iniciar sesión
4. Observa los logs en la consola
5. Si hay errores, cópialos y compártelos

