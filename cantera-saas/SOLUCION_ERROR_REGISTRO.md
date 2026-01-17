# 🔧 Solución: Error al Registrar Nuevos Usuarios

## ❌ Error Identificado

**Error:** "Database error saving new user"

**Causa:** El trigger `handle_new_user()` intenta crear una organización y un perfil automáticamente cuando un usuario se registra, pero:

1. **Falta política RLS para INSERT en `organizations`**: La tabla tiene RLS habilitado pero solo hay políticas para SELECT y UPDATE, no para INSERT.
2. **Referencia circular**: `organizations.owner_id` referencia `profiles(id)`, pero el trigger intenta crear la organización antes que el perfil.

## ✅ Solución

He creado un script SQL que resuelve ambos problemas.

### Paso 1: Ejecutar el Script de Corrección

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en Supabase
   - Navega a **SQL Editor** (ícono de base de datos en el menú lateral)

2. **Ejecutar el script**
   - Abre el archivo `supabase/fix_registro_usuarios.sql`
   - Copia todo el contenido (Ctrl+A, Ctrl+C)
   - Pega el contenido en el SQL Editor de Supabase
   - Haz clic en **RUN** (o presiona Ctrl+Enter)
   - Deberías ver "Success" o mensajes de confirmación

### Paso 2: Verificar que Funcionó

El script hará lo siguiente:

1. ✅ **Agregar política RLS para INSERT en organizations**
   - Permite que el trigger inserte organizaciones durante el registro

2. ✅ **Hacer la foreign key DEFERRABLE**
   - Resuelve la referencia circular permitiendo crear la organización primero
   - La validación de la foreign key se pospone hasta el final de la transacción

3. ✅ **Actualizar el trigger con mejor manejo de errores**
   - Agrega manejo de excepciones para debugging

4. ✅ **Verificar que el trigger exista**
   - Asegura que el trigger esté correctamente configurado

### Paso 3: Probar el Registro

1. **Ir a la página de registro**
   - Ve a: `http://localhost:3000/auth/register`

2. **Crear una nueva cuenta**
   - Completa el formulario:
     - Nombre Completo: Juan Pérez
     - Email: prueba@ejemplo.com
     - Contraseña: contraseña123
     - Confirmar Contraseña: contraseña123

3. **Verificar que funcione**
   - Si todo está correcto, deberías ver:
     - Un mensaje de éxito (si email confirmation está habilitado)
     - O redirección al dashboard (si email confirmation está deshabilitado)

4. **Verificar en Supabase**
   - Ve a **Table Editor** > `profiles`
   - Deberías ver el nuevo perfil con `role = 'admin'` y `organization_id` asignado
   - Ve a **Table Editor** > `organizations`
   - Deberías ver una nueva organización con `owner_id` = ID del nuevo usuario

## 🔍 Si Aún Hay Problemas

Si después de ejecutar el script sigue habiendo errores:

1. **Verificar los logs en Supabase**
   - Ve a **Logs** > **Postgres Logs**
   - Busca errores relacionados con `handle_new_user`

2. **Verificar que las variables de entorno estén configuradas**
   - Asegúrate de que `.env.local` tenga:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=tu_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
     ```

3. **Reiniciar el servidor de desarrollo**
   ```bash
   # Detener el servidor (Ctrl+C)
   # Reiniciar:
   npm run dev
   ```

4. **Verificar políticas RLS**
   - El script incluye una query al final que muestra las políticas actuales
   - Verifica que aparezca "Trigger can insert organizations"

## 📝 Detalles Técnicos

### Cambios Realizados

1. **Política RLS Nueva:**
   ```sql
   CREATE POLICY "Trigger can insert organizations" ON organizations
     FOR INSERT WITH CHECK (true);
   ```

2. **Foreign Key DEFERRABLE:**
   ```sql
   ALTER TABLE organizations
   ADD CONSTRAINT organizations_owner_id_fkey 
   FOREIGN KEY (owner_id) 
   REFERENCES profiles(id) 
   DEFERRABLE INITIALLY DEFERRED;
   ```

3. **Trigger Mejorado:**
   - Mejor manejo de errores con EXCEPTION
   - Logging con RAISE WARNING para debugging

### Por Qué Funciona

- **SECURITY DEFINER**: El trigger se ejecuta con privilegios elevados, pero aún está sujeto a RLS
- **Política RLS con `WITH CHECK (true)`**: Permite que el trigger inserte organizaciones
- **DEFERRABLE INITIALLY DEFERRED**: Permite crear la organización antes que el perfil; la validación de la foreign key se hace al final de la transacción

## ✅ Resultado Esperado

Después de ejecutar el script:
- ✅ Los nuevos usuarios se pueden registrar sin errores
- ✅ Se crea automáticamente su organización
- ✅ Se crea automáticamente su perfil con `role = 'admin'`
- ✅ El perfil tiene `organization_id` correctamente asignado

