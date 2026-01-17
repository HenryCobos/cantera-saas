# 👤 Crear Usuario Administrador - Pasos Rápidos

## Paso 1: Crear Usuario en Supabase

1. **Abre Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy
   - O directamente: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy/auth/users

2. **Ir a Authentication > Users**
   - En el menú lateral izquierdo, haz clic en **"Authentication"**
   - Luego haz clic en **"Users"**

3. **Crear nuevo usuario**
   - Haz clic en el botón **"Add user"** (arriba a la derecha)
   - Selecciona **"Create new user"**
   - Completa el formulario:
     - **Email**: `admin@cantera.com` (o el email que prefieras)
     - **Password**: [Escribe una contraseña segura, anótala porque la necesitarás]
     - **Auto Confirm User**: ✅ Activa esta opción (marca la casilla)
   - Haz clic en **"Create user"**

4. **Verificar usuario creado**
   - Deberías ver el usuario en la lista
   - El usuario ya tiene un perfil creado automáticamente (por el trigger SQL)

## Paso 2: Cambiar Rol a Admin (Recomendado)

1. **Ir a SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"** o el botón **"+"**

2. **Ejecutar query para cambiar rol**
   - Copia y pega esta query (reemplaza el email si usaste uno diferente):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@cantera.com';
   ```

3. **Ejecutar la query**
   - Haz clic en **"RUN"** o presiona **Ctrl+Enter**
   - Deberías ver: "Success. No rows returned" o "UPDATE 1"

4. **Verificar cambio de rol**
   - Ve a **"Table Editor"** > **"profiles"**
   - Busca tu usuario y verifica que el campo `role` sea `admin`

## Paso 3: Probar la Aplicación

1. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Abrir en el navegador**
   - Ve a: http://localhost:3000
   - Deberías ver la página de login

3. **Iniciar sesión**
   - **Email**: `admin@cantera.com` (o el que usaste)
   - **Password**: [La contraseña que configuraste]
   - Haz clic en **"Iniciar Sesión"**

4. **Verificar acceso**
   - Deberías ser redirigido al dashboard
   - Verás estadísticas y el menú lateral completo

## ✅ Checklist

- [ ] Usuario creado en Authentication > Users
- [ ] Rol cambiado a 'admin' (opcional pero recomendado)
- [ ] Servidor ejecutándose (`npm run dev`)
- [ ] Página de login visible (http://localhost:3000)
- [ ] Puedes iniciar sesión correctamente
- [ ] Dashboard visible y funcionando

## 🎯 Siguiente Paso

Una vez que puedas iniciar sesión:
1. Crea tu primera cantera
2. Agrega tipos de agregados
3. Registra producción
4. Verifica que el inventario se actualiza automáticamente

¡Vamos a probarlo!

