# 🚀 Guía Completa: Configuración de Supabase y Continuación del Desarrollo

## 📋 Parte 1: Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. **Ir a Supabase**
   - Abre tu navegador y ve a: https://supabase.com
   - Haz clic en "Start your project" o "Sign in" si ya tienes cuenta

2. **Crear cuenta (si no tienes)**
   - Clic en "Sign Up"
   - Usa GitHub, GitLab o tu email
   - Confirma tu email si es necesario

3. **Crear nuevo proyecto**
   - En el dashboard, clic en "New Project"
   - Configura los siguientes datos:
     ```
     Name: cantera-saas (o el nombre que prefieras)
     Database Password: [Genera una contraseña segura - GUÁRDALA]
     Region: [Selecciona la más cercana a tus usuarios, ej: US East, EU West]
     Pricing Plan: Free (para desarrollo)
     ```

4. **Esperar aprovisionamiento**
   - Esto toma aproximadamente 2 minutos
   - Verás un spinner "Setting up your project"

### Paso 2: Ejecutar el Script SQL

1. **Abrir SQL Editor**
   - En el menú lateral izquierdo, clic en "SQL Editor"
   - O usa el ícono de base de datos en la barra superior

2. **Crear nueva query**
   - Clic en "New query"
   - O usa el botón "+ New query"

3. **Copiar el esquema completo**
   - Abre el archivo `supabase/schema.sql` en tu proyecto
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)

4. **Pegar y ejecutar**
   - Pega el contenido en el editor SQL de Supabase
   - Revisa que no haya errores de sintaxis
   - Clic en "RUN" o presiona Ctrl+Enter
   - Deberías ver "Success. No rows returned" o similar

5. **Verificar creación de tablas**
   - En el menú lateral, ve a "Table Editor"
   - Deberías ver todas las tablas creadas:
     - profiles
     - canteras
     - tipos_agregados
     - produccion
     - inventario
     - movimientos_inventario
     - camiones
     - choferes
     - viajes
     - clientes
     - ventas
     - ventas_detalle
     - pagos
     - gastos
     - precios_clientes

### Paso 3: Obtener Credenciales

1. **Ir a Settings > API**
   - En el menú lateral, clic en el ícono de configuración (⚙️)
   - Selecciona "API" del submenú

2. **Copiar las siguientes credenciales**:
   ```
   Project URL: [Algo como: https://xxxxx.supabase.co]
   anon public key: [Una clave larga que empieza con eyJ...]
   ```

3. **Guardar en archivo .env.local**
   - En la raíz de tu proyecto, crea el archivo `.env.local`
   - Agrega las siguientes líneas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - **IMPORTANTE**: Reemplaza los valores con los que copiaste de Supabase

### Paso 4: Configurar Authentication

1. **Ir a Authentication > Providers**
   - En el menú lateral, clic en "Authentication"
   - Luego "Providers"

2. **Configurar Email Provider (ya está activo por defecto)**
   - Asegúrate que "Email" esté habilitado
   - Para desarrollo, puedes deshabilitar "Confirm email" si quieres registro rápido:
     - Desactiva "Enable email confirmations"
     - Haz clic en "Save"

3. **Crear primer usuario (Opcional - puedes hacerlo desde la app)**
   - Ve a "Authentication > Users"
   - Clic en "Add user" > "Create new user"
   - Completa:
     ```
     Email: admin@cantera.com
     Password: [Una contraseña segura]
     ```
   - Clic en "Create user"
   - **Nota**: Este usuario tendrá rol 'operador' por defecto (según el trigger)

### Paso 5: Modificar Rol del Primer Usuario (Opcional)

Si quieres que tu primer usuario sea admin:

1. **Ir a SQL Editor nuevamente**
2. **Ejecutar esta query** (reemplaza el email con el que usaste):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@cantera.com';
   ```

### Paso 6: Verificar la Conexión

1. **En tu proyecto local, verifica que `.env.local` existe**
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   
   # Linux/Mac
   cat .env.local
   ```

2. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**
   - Ve a http://localhost:3000
   - Deberías ver la página de login

4. **Iniciar sesión**
   - Usa las credenciales del usuario que creaste
   - Deberías ser redirigido al dashboard

## 📋 Parte 2: Continuar con el Desarrollo

### Verificaciones Previas

Antes de continuar, verifica que:

- ✅ El proyecto en Supabase esté creado y funcionando
- ✅ El script SQL se haya ejecutado correctamente
- ✅ Las variables de entorno estén configuradas
- ✅ Puedas iniciar sesión en la aplicación

### Funcionalidades Pendientes a Implementar

1. **Formularios de Creación/Edición** (Prioridad Alta)
   - Formulario de nueva cantera
   - Formulario de nuevo tipo de agregado
   - Formulario de registro de producción
   - Formulario de nueva venta
   - Formulario de nuevo cliente
   - Formulario de nuevo camión/chofer
   - Formulario de registro de viaje
   - Formulario de registro de pago
   - Formulario de registro de gasto

2. **Búsqueda y Filtros** (Prioridad Media)
   - Búsqueda en tablas de ventas, clientes, producción
   - Filtros por fecha, estado, tipo
   - Paginación en listados largos

3. **Funcionalidades Adicionales** (Prioridad Media)
   - Edición de registros existentes
   - Eliminación de registros (con confirmación)
   - Vista detallada de registros
   - Cálculo automático de totales en formularios

4. **Mejoras de UI** (Prioridad Baja)
   - Gráficos en dashboard
   - Notificaciones toast
   - Loading states
   - Mejor manejo de errores

## 🔄 Próximos Pasos

Una vez completada la configuración de Supabase, continuaremos con:

1. Implementar formularios de creación para cada módulo
2. Agregar funcionalidad de edición
3. Implementar búsqueda y filtros
4. Mejorar la experiencia de usuario con feedback visual

¿Listo para continuar? Ejecuta la configuración de Supabase siguiendo esta guía y luego continuamos con el desarrollo de las funcionalidades.

