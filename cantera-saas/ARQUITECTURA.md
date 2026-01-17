# Arquitectura del Sistema - Cantera SaaS

## 📐 Visión General

Este documento explica la arquitectura completa del sistema SaaS para gestión de canteras, diseñado para ser escalable, seguro y fácil de mantener.

## 🏗️ Arquitectura de la Aplicación

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Backend as a Service**: Supabase
  - Autenticación
  - Base de datos PostgreSQL
  - Realtime subscriptions
  - Storage (para documentos futuros)

### Estructura de Carpetas

```
cantera-saas/
├── app/                      # App Router de Next.js 14
│   ├── auth/                 # Autenticación
│   │   └── login/            # Página de login
│   ├── dashboard/            # Módulos principales (protegidos)
│   │   ├── layout.tsx        # Layout compartido del dashboard
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── cantera/          # Gestión de canteras
│   │   ├── produccion/       # Registro de producción
│   │   ├── inventario/       # Control de inventario
│   │   ├── transporte/       # Gestión de transporte
│   │   ├── ventas/           # Gestión de ventas
│   │   ├── clientes/         # Base de clientes
│   │   ├── pagos/            # Pagos y cobranzas
│   │   ├── gastos/           # Gastos operativos
│   │   └── reportes/         # Reportes y análisis
│   ├── layout.tsx            # Layout raíz
│   ├── page.tsx              # Página inicial (redirige)
│   └── globals.css           # Estilos globales
├── components/               # Componentes React reutilizables
│   └── layout/
│       ├── Sidebar.tsx       # Navegación lateral
│       └── Header.tsx        # Encabezado
├── lib/                      # Utilidades y configuraciones
│   ├── supabase/
│   │   ├── client.ts         # Cliente Supabase (cliente)
│   │   ├── server.ts         # Cliente Supabase (servidor)
│   │   ├── middleware.ts     # Lógica de middleware
│   │   └── database.types.ts # Tipos TypeScript generados
│   └── permissions.ts        # Sistema de permisos
├── hooks/                    # React Hooks personalizados
│   └── useAuth.ts            # Hook de autenticación
├── types/                    # Tipos TypeScript compartidos
│   └── index.ts              # Tipos principales
├── supabase/
│   └── schema.sql            # Esquema completo de base de datos
├── middleware.ts             # Middleware de Next.js
└── package.json              # Dependencias
```

## 🗄️ Arquitectura de Base de Datos

### Tablas Principales

#### 1. **profiles** - Perfiles de Usuario
Almacena información adicional de los usuarios autenticados.
- `id` (UUID, FK a auth.users)
- `email` (TEXT, UNIQUE)
- `full_name` (TEXT, nullable)
- `role` (ENUM: admin, supervisor, operador, ventas, contabilidad)
- Timestamps automáticos

#### 2. **canteras** - Información de Canteras
Datos principales de la cantera.
- `id` (UUID, PK)
- `name` (TEXT)
- `address`, `phone`, `email` (TEXT, nullable)
- Timestamps automáticos

#### 3. **tipos_agregados** - Tipos de Agregados
Tipos de materiales que produce la cantera.
- `id` (UUID, PK)
- `cantera_id` (UUID, FK)
- `nombre` (TEXT)
- `unidad_medida` (TEXT, default: 'm3')
- `precio_base` (DECIMAL)
- UNIQUE(cantera_id, nombre)
- Timestamps automáticos

#### 4. **produccion** - Registro de Producción
Registro diario de producción por tipo de agregado.
- `id` (UUID, PK)
- `cantera_id`, `tipo_agregado_id` (UUID, FK)
- `fecha` (DATE)
- `cantidad` (DECIMAL)
- `maquina` (TEXT, nullable)
- `operador_id` (UUID, FK a profiles, nullable)
- `merma` (DECIMAL, default: 0)
- `created_by` (UUID, FK a profiles)
- Índices en fecha, cantera_id, tipo_agregado_id

#### 5. **inventario** - Stock Actual
Inventario actual por tipo de agregado.
- `id` (UUID, PK)
- `cantera_id`, `tipo_agregado_id` (UUID, FK)
- `cantidad` (DECIMAL, default: 0)
- `cantidad_minima` (DECIMAL, default: 0)
- UNIQUE(cantera_id, tipo_agregado_id)
- Timestamps automáticos

#### 6. **movimientos_inventario** - Historial de Movimientos
Auditoría de todos los movimientos de inventario.
- `id` (UUID, PK)
- `inventario_id` (UUID, FK)
- `tipo` (ENUM: entrada, salida, ajuste)
- `cantidad` (DECIMAL)
- `motivo` (TEXT, nullable)
- `referencia_id` (UUID, nullable) - ID de producción, venta, etc.
- `referencia_tipo` (TEXT, nullable) - Tipo de referencia
- `created_by` (UUID, FK)
- Índices en inventario_id, created_at

#### 7. **camiones** - Flota de Vehículos
Información de los camiones.
- `id` (UUID, PK)
- `cantera_id` (UUID, FK)
- `placa` (TEXT, UNIQUE)
- `capacidad_metros` (DECIMAL)
- `estado` (ENUM: activo, mantenimiento, inactivo)
- Timestamps automáticos

#### 8. **choferes** - Choferes
Información de los choferes.
- `id` (UUID, PK)
- `cantera_id` (UUID, FK)
- `nombre` (TEXT)
- `licencia`, `telefono` (TEXT, nullable)
- `estado` (ENUM: activo, inactivo)
- Timestamps automáticos

#### 9. **viajes** - Viajes de Transporte
Registro de viajes realizados.
- `id` (UUID, PK)
- `cantera_id`, `camion_id`, `chofer_id` (UUID, FK)
- `venta_id` (UUID, FK, nullable) - Si está asociado a una venta
- `fecha` (DATE)
- `cantidad_metros` (DECIMAL)
- `costo_combustible`, `costo_peaje`, `otros_costos` (DECIMAL)
- `destino` (TEXT)
- `created_by` (UUID, FK)
- Índices en fecha, cantera_id, venta_id

#### 10. **clientes** - Base de Clientes
Información de clientes.
- `id` (UUID, PK)
- `cantera_id` (UUID, FK)
- `tipo` (ENUM: constructora, ferreteria, persona)
- `nombre` (TEXT)
- `documento`, `telefono`, `email`, `direccion` (TEXT, nullable)
- `limite_credito` (DECIMAL, default: 0)
- `estado` (ENUM: activo, inactivo)
- Timestamps automáticos
- Índices en cantera_id, tipo

#### 11. **ventas** - Ventas
Registro de ventas.
- `id` (UUID, PK)
- `cantera_id`, `cliente_id` (UUID, FK)
- `numero_factura` (TEXT, UNIQUE)
- `fecha` (DATE)
- `tipo_pago` (ENUM: contado, credito)
- `subtotal`, `descuento`, `total` (DECIMAL)
- `estado_pago` (ENUM: pendiente, parcial, pagado)
- `fecha_vencimiento` (DATE, nullable)
- `viaje_id` (UUID, FK, nullable)
- `created_by` (UUID, FK)
- Índices en fecha, cantera_id, cliente_id, estado_pago

#### 12. **ventas_detalle** - Detalle de Ventas
Productos por venta.
- `id` (UUID, PK)
- `venta_id`, `tipo_agregado_id` (UUID, FK)
- `cantidad` (DECIMAL)
- `precio_unitario`, `subtotal` (DECIMAL)
- Índice en venta_id

#### 13. **pagos** - Pagos Recibidos
Pagos realizados a las ventas.
- `id` (UUID, PK)
- `venta_id` (UUID, FK)
- `monto` (DECIMAL)
- `fecha` (DATE)
- `metodo_pago` (ENUM: efectivo, transferencia, cheque, otro)
- `referencia` (TEXT, nullable)
- `created_by` (UUID, FK)
- Índices en venta_id, fecha

#### 14. **gastos** - Gastos Operativos
Registro de gastos.
- `id` (UUID, PK)
- `cantera_id` (UUID, FK)
- `categoria` (ENUM: combustible, mantenimiento, sueldos, repuestos, otro)
- `concepto` (TEXT)
- `monto` (DECIMAL)
- `fecha` (DATE)
- `proveedor`, `referencia` (TEXT, nullable)
- `created_by` (UUID, FK)
- Índices en fecha, cantera_id, categoria

#### 15. **precios_clientes** - Precios Especiales
Precios personalizados por cliente y tipo de agregado.
- `id` (UUID, PK)
- `cliente_id`, `tipo_agregado_id` (UUID, FK)
- `precio` (DECIMAL)
- UNIQUE(cliente_id, tipo_agregado_id)
- Timestamps automáticos

### Funciones y Triggers Automáticos

#### 1. **update_updated_at_column()**
Función que actualiza automáticamente el campo `updated_at` en las tablas que lo tienen.

#### 2. **handle_new_user()**
Trigger que crea automáticamente un perfil cuando se registra un nuevo usuario en `auth.users`.

#### 3. **actualizar_inventario_produccion()**
- **Trigger**: Se ejecuta después de INSERT en `produccion`
- **Función**: 
  - Busca o crea el registro de inventario correspondiente
  - Actualiza la cantidad (cantidad - merma)
  - Registra un movimiento de inventario tipo "entrada"

#### 4. **actualizar_inventario_venta()**
- **Trigger**: Se ejecuta después de INSERT en `ventas_detalle`
- **Función**:
  - Reduce el stock según la cantidad vendida
  - Registra un movimiento de inventario tipo "salida"

#### 5. **actualizar_estado_pago_venta()**
- **Trigger**: Se ejecuta después de INSERT, UPDATE o DELETE en `pagos`
- **Función**:
  - Calcula el total pagado de la venta
  - Actualiza automáticamente el estado de pago (pendiente, parcial, pagado)

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas básicas:

- **Políticas de Lectura**: Usuarios autenticados pueden leer (en producción, más restrictivo)
- **Políticas de Escritura**: Solo admin y supervisor pueden escribir (en producción, más granular)

Las políticas se pueden refinar según necesidades específicas.

## 🔐 Sistema de Autenticación y Autorización

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales en `/auth/login`
2. **Supabase Auth**: Valida credenciales con Supabase
3. **Sesión**: Se crea una sesión persistente en cookies
4. **Middleware**: Verifica la sesión en cada request
5. **Redirección**: Usuario autenticado → `/dashboard`, No autenticado → `/auth/login`

### Roles y Permisos

El sistema define 5 roles:

1. **admin**: Acceso completo
2. **supervisor**: Gestión de operaciones
3. **operador**: Registro de producción e inventario
4. **ventas**: Gestión de ventas, clientes y transporte
5. **contabilidad**: Acceso a finanzas, pagos y gastos

Los permisos se definen en `lib/permissions.ts` y se validan en:
- Navegación (Sidebar solo muestra módulos permitidos)
- Rutas (middleware puede validar permisos)
- Componentes (verificación antes de mostrar acciones)

## 🎨 UI/UX - Diseño de Interfaces

### Componentes Base

1. **Sidebar** (`components/layout/Sidebar.tsx`)
   - Navegación lateral con iconos
   - Filtrado por permisos del usuario
   - Información del usuario actual
   - Botón de cerrar sesión

2. **Header** (`components/layout/Header.tsx`)
   - Título del módulo actual
   - Notificaciones (preparado para futuras implementaciones)

3. **Layout del Dashboard** (`app/dashboard/layout.tsx`)
   - Wrapper que incluye Sidebar y protege rutas
   - Verificación de autenticación

### Páginas Principales

Cada módulo tiene su propia página en `app/dashboard/[modulo]/page.tsx`:
- Listado de registros en tablas
- Tarjetas de resumen (cuando aplica)
- Botones de acción (crear, editar, ver)
- Filtros y búsqueda (a implementar)

## 🔄 Flujos de Datos Principales

### 1. Registro de Producción → Actualización de Inventario

```
Usuario registra producción
  ↓
INSERT en tabla `produccion`
  ↓
Trigger `actualizar_inventario_produccion()`
  ↓
UPDATE en `inventario` (cantidad = cantidad + (produccion - merma))
  ↓
INSERT en `movimientos_inventario` (tipo: entrada)
```

### 2. Registro de Venta → Actualización de Inventario

```
Usuario crea venta con detalle
  ↓
INSERT en `ventas` y `ventas_detalle`
  ↓
Trigger `actualizar_inventario_venta()`
  ↓
UPDATE en `inventario` (cantidad = cantidad - cantidad_vendida)
  ↓
INSERT en `movimientos_inventario` (tipo: salida)
```

### 3. Registro de Pago → Actualización de Estado de Venta

```
Usuario registra pago
  ↓
INSERT en `pagos`
  ↓
Trigger `actualizar_estado_pago_venta()`
  ↓
Calcula total pagado
  ↓
UPDATE en `ventas` (estado_pago: pendiente/parcial/pagado)
```

## 📊 Módulos del Sistema

### 1. Dashboard (`/dashboard`)
- Resumen de indicadores clave
- Producción del día
- Ventas del día
- Alertas (stock bajo, clientes morosos)

### 2. Cantera (`/dashboard/cantera`)
- Gestión de información de cantera
- Tipos de agregados
- Precios base

### 3. Producción (`/dashboard/produccion`)
- Registro diario de producción
- Búsqueda y filtros por fecha/tipo
- Actualización automática de inventario

### 4. Inventario (`/dashboard/inventario`)
- Vista de stock actual
- Alertas de stock bajo
- Historial de movimientos

### 5. Transporte (`/dashboard/transporte`)
- Gestión de camiones
- Gestión de choferes
- Registro de viajes

### 6. Ventas (`/dashboard/ventas`)
- Registro de ventas
- Estado de pago
- Asociación con transporte

### 7. Clientes (`/dashboard/clientes`)
- Base de datos de clientes
- Límites de crédito
- Historial de compras (a implementar)

### 8. Pagos (`/dashboard/pagos`)
- Registro de pagos
- Historial de cobranzas
- Métodos de pago

### 9. Gastos (`/dashboard/gastos`)
- Registro de gastos por categoría
- Análisis por categoría
- Historial

### 10. Reportes (`/dashboard/reportes`)
- Reportes mensuales
- Indicadores clave (KPIs)
- Exportación (a implementar)

## 🚀 Próximas Mejoras

### Funcionalidades Pendientes

1. **Formularios de Creación/Edición**
   - Formularios para crear/editar registros en cada módulo

2. **Búsqueda y Filtros**
   - Búsqueda en listados
   - Filtros por fecha, estado, etc.

3. **Exportación**
   - Exportar reportes a PDF
   - Exportar datos a Excel

4. **Notificaciones**
   - Alertas en tiempo real (stock bajo, clientes morosos)
   - Notificaciones push

5. **Gráficos**
   - Gráficos de producción mensual
   - Gráficos de ventas
   - Análisis de tendencias

6. **Multi-tenancy**
   - Soporte para múltiples canteras por usuario
   - Cambio de contexto entre canteras

7. **Auditoría**
   - Log de cambios en registros críticos
   - Historial de acciones por usuario

## 🔧 Configuración y Despliegue

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Scripts de Base de Datos

El archivo `supabase/schema.sql` contiene:
- Todas las tablas
- Índices
- Triggers y funciones
- Políticas RLS básicas

Ejecutar este script completo en el SQL Editor de Supabase antes de usar la aplicación.

### Despliegue

1. **Vercel** (recomendado para Next.js)
   - Conectar repositorio
   - Configurar variables de entorno
   - Deploy automático

2. **Otra plataforma**
   - Seguir guía de despliegue de Next.js
   - Configurar variables de entorno
   - Ejecutar `npm run build` y `npm start`

## 📝 Notas Técnicas

- **Type Safety**: Todo el código está tipado con TypeScript
- **Server Components**: Next.js 14 usa Server Components por defecto para mejor rendimiento
- **Client Components**: Solo se usan donde es necesario (interactividad, hooks)
- **Seguridad**: RLS en base de datos, validación en middleware
- **Escalabilidad**: Arquitectura preparada para crecimiento
- **Mantenibilidad**: Código organizado y documentado

## 🤝 Contribuciones

Este sistema está diseñado para ser extensible. Al agregar nuevas funcionalidades:

1. Seguir la estructura de carpetas establecida
2. Agregar tipos TypeScript correspondientes
3. Actualizar el esquema de base de datos si es necesario
4. Documentar cambios en este archivo

