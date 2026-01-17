# 🎯 Pasos Siguientes - Configuración y Prueba

## ✅ Paso 1: Variables de Entorno Configuradas

Ya has configurado las variables de entorno en `.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` configurado
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado

## 📋 Paso 2: Ejecutar el Script SQL en Supabase

**IMPORTANTE**: Debes ejecutar el script SQL antes de usar la aplicación.

### Instrucciones:

1. **Abrir SQL Editor en Supabase**
   - Ve a tu proyecto: https://supabase.com/dashboard/project/qpurlnilvoviitymikfy
   - En el menú lateral, haz clic en "SQL Editor" (ícono de base de datos)

2. **Crear nueva query**
   - Haz clic en "New query" o "+ New query"

3. **Ejecutar el esquema completo**
   - Abre el archivo `supabase/schema.sql` en tu proyecto
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pega en el SQL Editor de Supabase
   - Haz clic en "RUN" o presiona Ctrl+Enter
   - Deberías ver "Success. No rows returned" o similar

4. **Verificar creación de tablas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver estas tablas creadas:
     - ✅ profiles
     - ✅ canteras
     - ✅ tipos_agregados
     - ✅ produccion
     - ✅ inventario
     - ✅ movimientos_inventario
     - ✅ camiones
     - ✅ choferes
     - ✅ viajes
     - ✅ clientes
     - ✅ ventas
     - ✅ ventas_detalle
     - ✅ pagos
     - ✅ gastos
     - ✅ precios_clientes

## 🔐 Paso 3: Crear Usuario Administrador

1. **Ir a Authentication**
   - En el menú lateral de Supabase, clic en "Authentication"
   - Luego "Users"

2. **Crear nuevo usuario**
   - Haz clic en "Add user" > "Create new user"
   - Completa:
     ```
     Email: admin@cantera.com (o el que prefieras)
     Password: [Una contraseña segura]
     ```
   - Haz clic en "Create user"

3. **Cambiar rol a admin** (Opcional pero recomendado)
   - Ve al "SQL Editor" nuevamente
   - Ejecuta esta query (reemplaza el email con el que usaste):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'admin@cantera.com';
   ```

## 🚀 Paso 4: Ejecutar el Proyecto Local

1. **Verificar dependencias instaladas**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**
   - Ve a: http://localhost:3000
   - Deberías ver la página de login

4. **Iniciar sesión**
   - Usa las credenciales del usuario que creaste
   - Deberías ser redirigido al dashboard

## ✅ Paso 5: Probar Funcionalidades Básicas

### 1. Crear una Cantera
1. En el dashboard, haz clic en "Cantera" en el menú lateral
2. Haz clic en "Nueva Cantera"
3. Completa el formulario:
   - Nombre: "Cantera Principal" (o el que prefieras)
   - Dirección, teléfono, email (opcionales)
4. Haz clic en "Guardar Cantera"
5. Deberías ver la cantera en el listado

### 2. Agregar Tipos de Agregados
1. En la lista de canteras, haz clic en "Ver" de la cantera creada
2. Haz clic en "Nuevo Tipo" en la sección "Tipos de Agregados"
3. Completa el formulario:
   - Nombre: "Arena", "Grava", "Piedra Triturada" (ejemplos)
   - Unidad de medida: "m3"
   - Precio base: 50.00 (ejemplo)
4. Haz clic en "Guardar Tipo de Agregado"
5. Repite para agregar más tipos

### 3. Registrar Producción
1. En el menú lateral, haz clic en "Producción"
2. Haz clic en "Nueva Producción"
3. Completa el formulario:
   - Fecha: Selecciona la fecha de hoy
   - Tipo de Agregado: Selecciona uno de los tipos creados
   - Cantidad Producida: 100 (ejemplo)
   - Merma: 5 (opcional)
   - Máquina: "Excavadora #1" (opcional)
4. Haz clic en "Registrar Producción"
5. **IMPORTANTE**: El inventario se actualizará automáticamente (cantidad - merma)

### 4. Verificar Inventario
1. En el menú lateral, haz clic en "Inventario"
2. Deberías ver el stock actualizado con la producción registrada
3. Los agregados con stock bajo se mostrarán con alerta roja

### 5. Crear un Cliente
1. En el menú lateral, haz clic en "Clientes"
2. Haz clic en "Nuevo Cliente"
3. Completa el formulario:
   - Tipo: "Constructora" (ejemplo)
   - Nombre: "Constructora ABC S.A."
   - Documento: "12345678901"
   - Teléfono, email, dirección (opcionales)
   - Límite de crédito: 100000 (opcional)
4. Haz clic en "Guardar Cliente"

### 6. Crear Camión y Chofer
1. En el menú lateral, haz clic en "Transporte"
2. Haz clic en "Nuevo Camión":
   - Placa: "ABC-123"
   - Capacidad: 12.5 m³
   - Estado: "Activo"
3. Haz clic en "Nuevo Chofer":
   - Nombre: "Juan Pérez"
   - Licencia: "L123456"
   - Teléfono: "+1234567890"
   - Estado: "Activo"

### 7. Registrar un Gasto
1. En el menú lateral, haz clic en "Gastos"
2. Haz clic en "Nuevo Gasto"
3. Completa el formulario:
   - Fecha: Fecha de hoy
   - Categoría: "Combustible"
   - Concepto: "Combustible para excavadora"
   - Monto: 500.00
   - Proveedor: "Gasolinera ABC" (opcional)
4. Haz clic en "Registrar Gasto"

## 🎯 Paso 6: Verificar Funcionalidades Automáticas

### Triggers Automáticos (ya configurados en el SQL)

1. **Inventario automático desde producción** ✅
   - Al registrar producción, el inventario se actualiza automáticamente
   - Se crea un movimiento de inventario tipo "entrada"

2. **Inventario automático desde ventas** ✅
   - (Cuando implementes ventas) al crear una venta, el inventario se reduce
   - Se crea un movimiento de inventario tipo "salida"

3. **Estado de pago automático** ✅
   - (Cuando implementes pagos) al registrar un pago, el estado de la venta se actualiza
   - Cambia de "pendiente" a "parcial" o "pagado" según el monto

4. **Creación automática de perfil** ✅
   - Al crear un usuario en Authentication, se crea automáticamente un perfil
   - El rol por defecto es "operador"

## 🔍 Verificar que Todo Funciona

1. ✅ Inicias sesión correctamente
2. ✅ Ves el dashboard con estadísticas
3. ✅ Puedes crear una cantera
4. ✅ Puedes agregar tipos de agregados
5. ✅ Puedes registrar producción
6. ✅ El inventario se actualiza automáticamente
7. ✅ Puedes crear clientes, camiones y choferes
8. ✅ Puedes registrar gastos

## 📝 Notas Importantes

- **Primera cantera**: El sistema actualmente usa la primera cantera encontrada en la base de datos
- **Multi-tenancy**: En el futuro se puede mejorar para soportar múltiples canteras por usuario
- **Permisos**: Los permisos por rol ya están configurados en `lib/permissions.ts`
- **Alertas**: El sistema detecta stock bajo automáticamente en la vista de inventario

## ⚠️ Si Algo No Funciona

### Error de conexión a Supabase
- Verifica que `.env.local` tenga las credenciales correctas
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error de tablas no encontradas
- Asegúrate de haber ejecutado el script SQL completo
- Verifica en "Table Editor" de Supabase que todas las tablas existan

### Error de autenticación
- Verifica que hayas creado un usuario en Authentication
- Intenta cerrar sesión y volver a iniciar

### Error de permisos
- Verifica que el usuario tenga un perfil en la tabla `profiles`
- Puedes cambiar el rol ejecutando la query SQL mencionada arriba

## 🚀 Próximos Pasos

Una vez que todo funcione, podemos continuar con:

1. **Formulario de Nueva Venta** (complejo, con múltiples productos)
2. **Formulario de Registro de Pago**
3. **Formulario de Viaje**
4. **Edición de registros**
5. **Búsqueda y filtros**

¿Todo funciona correctamente? Si encuentras algún error, avísame y lo solucionamos.

