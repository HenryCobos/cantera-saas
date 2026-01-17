# 🚀 Primeros Pasos Después de Iniciar Sesión

## ✅ Ya tienes:
- ✅ Variables de entorno configuradas
- ✅ Base de datos con todas las tablas
- ✅ Usuario administrador creado
- ✅ Aplicación ejecutándose

## 📋 Pasos para Configurar tu Primera Cantera

### 1. Crear una Cantera

1. **Ir a Cantera**
   - En el menú lateral, haz clic en **"Cantera"**
   - Verás una lista vacía (por ahora)

2. **Crear nueva cantera**
   - Haz clic en el botón **"Nueva Cantera"** (arriba a la derecha)
   - Completa el formulario:
     ```
     Nombre: Cantera Principal
     Dirección: [Opcional - puedes dejar vacío]
     Teléfono: [Opcional]
     Email: [Opcional]
     ```
   - Haz clic en **"Guardar Cantera"**

3. **Verificar creación**
   - Serás redirigido al listado de canteras
   - Deberías ver tu cantera en la tabla

### 2. Agregar Tipos de Agregados

1. **Ver detalle de la cantera**
   - En la lista de canteras, haz clic en **"Ver"** de la cantera que creaste
   - Verás dos secciones: "Información General" y "Tipos de Agregados"

2. **Crear primer tipo de agregado**
   - En la sección "Tipos de Agregados", haz clic en **"Nuevo Tipo"**
   - Completa el formulario:
     ```
     Nombre del Agregado: Arena
     Unidad de Medida: m3
     Precio Base: 50.00
     ```
   - Haz clic en **"Guardar Tipo de Agregado"**

3. **Agregar más tipos (recomendado)**
   - Repite el paso anterior para crear:
     - **Grava**: m3, Precio: 45.00
     - **Piedra Triturada**: m3, Precio: 60.00
     - **Arena Fina**: m3, Precio: 55.00

### 3. Registrar Primera Producción

1. **Ir a Producción**
   - En el menú lateral, haz clic en **"Producción"**

2. **Registrar producción**
   - Haz clic en **"Nueva Producción"**
   - Completa el formulario:
     ```
     Fecha: [Fecha de hoy]
     Tipo de Agregado: Selecciona "Arena" (o el que creaste)
     Cantidad Producida: 100
     Merma: 5
     Máquina: Excavadora #1 [Opcional]
     ```
   - Haz clic en **"Registrar Producción"**

3. **Verificar en Producción**
   - Serás redirigido al listado de producción
   - Deberías ver tu registro con la fecha de hoy

4. **Verificar Inventario Actualizado** ⚡
   - En el menú lateral, haz clic en **"Inventario"**
   - Deberías ver "Arena" con stock de **95 m³** (100 - 5 de merma)
   - **¡El inventario se actualizó automáticamente!**

### 4. Crear un Cliente

1. **Ir a Clientes**
   - En el menú lateral, haz clic en **"Clientes"**

2. **Crear cliente**
   - Haz clic en **"Nuevo Cliente"**
   - Completa el formulario:
     ```
     Tipo de Cliente: Constructora
     Nombre o Razón Social: Constructora ABC S.A.
     Documento / RUC: 12345678901
     Teléfono: +1234567890 [Opcional]
     Email: contacto@abc.com [Opcional]
     Dirección: [Opcional]
     Límite de Crédito: 100000.00
     ```
   - Haz clic en **"Guardar Cliente"**

3. **Verificar creación**
   - Serás redirigido al listado de clientes
   - Deberías ver tu cliente en la tabla

### 5. Configurar Transporte

#### Crear Camión

1. **Ir a Transporte**
   - En el menú lateral, haz clic en **"Transporte"**

2. **Crear camión**
   - Haz clic en **"Nuevo Camión"**
   - Completa el formulario:
     ```
     Placa: ABC-123
     Capacidad (m³): 12.5
     Estado: Activo
     ```
   - Haz clic en **"Guardar Camión"**

#### Crear Chofer

1. **Crear chofer**
   - En la página de Transporte, haz clic en **"Nuevo Chofer"**
   - Completa el formulario:
     ```
     Nombre Completo: Juan Pérez
     Número de Licencia: L123456
     Teléfono: +1234567890
     Estado: Activo
     ```
   - Haz clic en **"Guardar Chofer"**

### 6. Registrar un Gasto

1. **Ir a Gastos**
   - En el menú lateral, haz clic en **"Gastos"**

2. **Registrar gasto**
   - Haz clic en **"Nuevo Gasto"**
   - Completa el formulario:
     ```
     Fecha: [Fecha de hoy]
     Categoría: Combustible
     Concepto: Combustible para excavadora
     Monto: 500.00
     Proveedor: Gasolinera ABC [Opcional]
     Referencia / Factura #: FAC-12345 [Opcional]
     ```
   - Haz clic en **"Registrar Gasto"**

3. **Verificar en Gastos**
   - Serás redirigido al listado de gastos
   - Verás el resumen con totales por categoría
   - Tu gasto debería aparecer en la tabla

### 7. Ver Reportes

1. **Ir a Reportes**
   - En el menú lateral, haz clic en **"Reportes"**

2. **Ver estadísticas**
   - Verás tarjetas con:
     - **Producción del Mes**: Total de m³ producidos
     - **Ventas del Mes**: (Aún no hay ventas registradas)
     - **Gastos del Mes**: Total de gastos del mes
     - **Utilidad Neta**: Ventas - Gastos

## ✅ Funcionalidades que Ya Funcionan

- ✅ **Registro de Cantera** - Crear y ver canteras
- ✅ **Tipos de Agregados** - Agregar materiales con precios base
- ✅ **Producción** - Registrar producción diaria
- ✅ **Inventario Automático** - Se actualiza automáticamente cuando registras producción
- ✅ **Clientes** - Base de datos de clientes
- ✅ **Transporte** - Gestión de camiones y choferes
- ✅ **Gastos** - Registro de gastos operativos
- ✅ **Reportes** - Estadísticas mensuales

## ⏳ Funcionalidades Pendientes (Próximos Pasos)

- ⏳ **Ventas** - Formulario complejo con múltiples productos
- ⏳ **Pagos** - Registro de pagos a ventas
- ⏳ **Viajes** - Asociar transporte con ventas
- ⏳ **Edición** - Editar registros existentes
- ⏳ **Búsqueda** - Buscar y filtrar en tablas

## 🎯 Siguiente Paso: Crear Ventas

Una vez que tengas:
- ✅ Cantera configurada
- ✅ Tipos de agregados creados
- ✅ Cliente creado
- ✅ Stock en inventario (producción registrada)

Podemos implementar el sistema de ventas que:
- Permite agregar múltiples productos
- Calcula totales automáticamente
- Asocia transporte opcionalmente
- Actualiza inventario automáticamente
- Maneja precios especiales por cliente

## 💡 Tips

- **Producción**: Cada vez que registras producción, el inventario se actualiza automáticamente
- **Inventario**: Si el stock está por debajo del mínimo, verás una alerta roja
- **Permisos**: Como admin, tienes acceso a todos los módulos
- **Reportes**: Los reportes se calculan automáticamente desde los datos

¡Explora el sistema y prueba todas las funcionalidades!

