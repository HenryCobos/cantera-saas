# 📝 Instrucciones Completas para Habilitar Registro

## ✅ Paso 1: Ejecutar Script SQL para Políticas RLS

1. **Abre Supabase SQL Editor**
   - Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/sql
   - Haz clic en "New query"

2. **Ejecuta el script completo**
   - Abre el archivo `supabase/rls_profiles_fix.sql` en tu proyecto
   - Copia TODO el contenido
   - Pega en el SQL Editor de Supabase
   - Haz clic en "RUN" o presiona Ctrl+Enter

3. **Verificar que se crearon las políticas**
   - Deberías ver un mensaje de éxito
   - Ejecuta esto para verificar:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   - Deberías ver 4 políticas:
     - "Users can view own profile"
     - "Users can update own profile"
     - "Users can insert own profile" ⭐ (IMPORTANTE - esta es nueva)
     - "Admins can view all profiles"

## ✅ Paso 2: Configurar Authentication en Supabase

### Opción A: Registro Rápido (sin confirmación de email) - Para Desarrollo

1. **Ir a Authentication > Providers**
   - Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/auth/providers

2. **Configurar Email Provider**
   - Asegúrate que "Email" esté habilitado
   - **Desactiva** "Enable email confirmations" (para pruebas rápidas)
   - Haz clic en "Save"

3. **Probar Registro**
   - Ve a: http://localhost:3000/auth/register
   - Crea una cuenta
   - Deberías ser redirigido al dashboard inmediatamente

### Opción B: Registro con Confirmación de Email - Para Producción

1. **Ir a Authentication > Providers**
   - Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/auth/providers

2. **Configurar Email Provider**
   - Asegúrate que "Email" esté habilitado
   - **Activa** "Enable email confirmations" (recomendado para producción)
   - Configura las plantillas de email si lo deseas
   - Haz clic en "Save"

3. **Probar Registro**
   - Ve a: http://localhost:3000/auth/register
   - Crea una cuenta
   - Revisa tu email para confirmar
   - Haz clic en el enlace de confirmación
   - Inicia sesión

## ✅ Paso 3: Probar el Registro

### Crear Nueva Cuenta

1. **Ir a la página de registro**
   - Ve a: http://localhost:3000/auth/register
   - O haz clic en "Crea una cuenta aquí" desde el login

2. **Completar el formulario**
   ```
   Nombre Completo: Juan Pérez
   Email: nuevo@ejemplo.com
   Contraseña: contraseña123
   Confirmar Contraseña: contraseña123
   ```

3. **Crear cuenta**
   - Haz clic en "Crear Cuenta"
   - Si el email confirmation está deshabilitado: serás redirigido al dashboard
   - Si está habilitado: verás un mensaje de éxito y debes confirmar el email

### Verificar que Funcionó

1. **Iniciar sesión**
   - Ve a: http://localhost:3000/auth/login
   - Usa las credenciales que creaste
   - Deberías ser redirigido al dashboard

2. **Verificar perfil creado**
   - En Supabase, ve a Table Editor > profiles
   - Deberías ver el nuevo perfil con email y role 'admin'

## 🔧 Funcionalidades del Registro

### Lo que se hace automáticamente:

1. **Usuario creado en Authentication**
   - Se crea el usuario en `auth.users`
   - Se envía email de confirmación (si está habilitado)

2. **Perfil creado automáticamente** (vía trigger SQL)
   - Cuando se crea un usuario en `auth.users`, el trigger `on_auth_user_created` crea el perfil
   - El perfil se crea con:
     - `id`: UUID del usuario
     - `email`: Email del usuario
     - `role`: 'operador' por defecto (se puede cambiar a 'admin' después)

3. **Si el trigger falla**, el dashboard layout crea el perfil automáticamente
   - Al intentar acceder al dashboard, verifica si existe el perfil
   - Si no existe, lo crea con role 'admin'

### Validaciones:

- ✅ Email válido requerido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Contraseñas deben coincidir
- ✅ Nombre completo requerido

## 🎯 Estado Actual

### ✅ Completado:
- Página de registro creada (`/auth/register`)
- Link al registro desde login
- Validación de formulario
- Creación automática de perfil (trigger + fallback en dashboard)
- Dashboard layout crea perfil si no existe
- Script SQL para políticas RLS

### ⏳ Pendiente (para implementar):
- Planes de pago (gratuito vs pagado)
- Límites por plan
- Panel de administración de planes
- Stripe/PayPal para pagos

## 📋 Script SQL Corregido

El archivo `supabase/rls_profiles_fix.sql` ya está corregido. Usa `DROP POLICY IF EXISTS` antes de crear cada política, ya que PostgreSQL no soporta `IF NOT EXISTS` en `CREATE POLICY`.

## 🚀 Próximos Pasos

Una vez que el registro funcione:

1. **Probar registro con varios usuarios**
2. **Implementar sistema de planes** (gratuito, básico, premium)
3. **Agregar límites por plan** (número de canteras, usuarios, etc.)
4. **Integrar sistema de pagos** (Stripe recomendado)

¿El script SQL ya se ejecutó correctamente? Si hay algún otro error, compártelo y lo corrigo.

