# Cantera SaaS - Sistema de Gestión Integral

Sistema SaaS completo para la gestión de canteras de agregados, desarrollado con Next.js 14, TypeScript, TailwindCSS y Supabase.

## 🚀 Características Principales

- ✅ **Autenticación y Roles**: Sistema completo de usuarios con permisos granulares
- ✅ **Gestión de Cantera**: Configuración de canteras, tipos de agregados y precios
- ✅ **Producción**: Registro diario de producción con actualización automática de inventario
- ✅ **Inventario**: Control de stock con alertas de stock bajo
- ✅ **Transporte**: Gestión de camiones, choferes y viajes
- ✅ **Ventas**: Registro de ventas al contado y crédito
- ✅ **Clientes**: Gestión de clientes con límites de crédito
- ✅ **Pagos y Cobranzas**: Seguimiento de pagos parciales y cuentas por cobrar
- ✅ **Gastos Operativos**: Registro de combustible, mantenimiento, sueldos, etc.
- ✅ **Reportes y Dashboard**: Indicadores en tiempo real

## 🛠️ Stack Tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth, Database, Realtime, Storage)
- **Heroicons**

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cantera-saas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Crear base de datos en Supabase**

Ejecutar el script SQL en `supabase/schema.sql` desde el SQL Editor de Supabase.

5. **Ejecutar el proyecto**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
cantera-saas/
├── app/                      # App Router de Next.js
│   ├── auth/                 # Páginas de autenticación
│   │   └── login/
│   ├── dashboard/            # Módulos principales
│   │   ├── cantera/
│   │   ├── produccion/
│   │   ├── inventario/
│   │   ├── ventas/
│   │   ├── clientes/
│   │   ├── transporte/
│   │   ├── pagos/
│   │   ├── gastos/
│   │   └── reportes/
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Componentes React
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/                      # Utilidades y configuraciones
│   ├── supabase/
│   │   ├── client.ts         # Cliente de Supabase (cliente)
│   │   ├── server.ts         # Cliente de Supabase (servidor)
│   │   ├── middleware.ts     # Middleware de autenticación
│   │   └── database.types.ts # Tipos TypeScript de la BD
│   └── permissions.ts        # Sistema de permisos
├── hooks/                    # React Hooks personalizados
│   └── useAuth.ts
├── types/                    # Tipos TypeScript
│   └── index.ts
├── supabase/
│   └── schema.sql            # Esquema de base de datos
└── middleware.ts             # Middleware de Next.js
```

## 🗄️ Esquema de Base de Datos

El sistema incluye las siguientes tablas principales:

- **profiles**: Perfiles de usuario con roles
- **canteras**: Información de canteras
- **tipos_agregados**: Tipos de agregados con precios base
- **produccion**: Registro diario de producción
- **inventario**: Stock actual por tipo de agregado
- **movimientos_inventario**: Historial de movimientos
- **camiones**: Gestión de flota de vehículos
- **choferes**: Choferes asignados
- **viajes**: Registro de viajes de transporte
- **clientes**: Base de datos de clientes
- **ventas**: Registro de ventas
- **ventas_detalle**: Detalle de productos por venta
- **pagos**: Pagos recibidos
- **gastos**: Gastos operativos
- **precios_clientes**: Precios especiales por cliente

### Funciones Automáticas

El esquema incluye triggers y funciones para:

- Actualización automática de inventario cuando se registra producción
- Actualización de inventario al registrar ventas
- Actualización automática del estado de pago de las ventas
- Creación automática de perfil al registrar usuario

## 👥 Roles y Permisos

El sistema soporta los siguientes roles:

- **admin**: Acceso completo al sistema
- **supervisor**: Gestión de operaciones
- **operador**: Registro de producción e inventario
- **ventas**: Gestión de ventas, clientes y transporte
- **contabilidad**: Acceso a finanzas, pagos y gastos

Los permisos se configuran en `lib/permissions.ts`.

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Middleware de autenticación en todas las rutas protegidas
- Validación de permisos por módulo y rol
- Sanitización de datos en formularios

## 📊 Características en Desarrollo

- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones en tiempo real
- [ ] Módulo de alertas inteligentes
- [ ] Integración con sistemas de facturación electrónica
- [ ] Dashboard con gráficos interactivos
- [ ] App móvil (PWA)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte, envía un email a [tu-email@ejemplo.com] o abre un issue en el repositorio.
