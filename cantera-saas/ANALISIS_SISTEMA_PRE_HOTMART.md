# 📊 Análisis Completo del Sistema - Pre-Integración Hotmart

**Fecha:** Enero 2026  
**Propósito:** Evaluación del estado actual del sistema antes de integrar Hotmart como pasarela de pagos

---

## ✅ **1. ESTADO GENERAL DEL SISTEMA**

### **1.1 Arquitectura**
- ✅ **Framework:** Next.js 14+ (App Router)
- ✅ **Base de Datos:** Supabase (PostgreSQL)
- ✅ **Autenticación:** Supabase Auth
- ✅ **Estilo:** Tailwind CSS
- ✅ **Deployment:** Preparado para Vercel/Producción

### **1.2 Estructura Multi-Tenant**
- ✅ Sistema multi-tenant implementado con `organizations`
- ✅ Cada usuario pertenece a una organización
- ✅ Los datos están aislados por `organization_id`
- ✅ Trigger automático crea organización al registrar usuario

---

## ✅ **2. SISTEMA DE PLANES Y SUSCRIPCIONES**

### **2.1 Planes Definidos** (`lib/plans.ts`)
```typescript
Planes disponibles:
- free: $0/mes - Plan gratuito con límites básicos
- starter: $29/mes - Plan inicial
- profesional: $79/mes - Plan intermedio (más popular)
- business: $149/mes - Plan empresarial
```

**Estado:** ✅ **Bien definido y estructurado**

### **2.2 Almacenamiento de Planes**
- ✅ Tabla `organizations` con campo `plan` (TEXT)
- ✅ Constraint: `CHECK (plan IN ('free', 'starter', 'profesional', 'business'))`
- ✅ Default: `'free'`
- ✅ Campo `status`: `'activa' | 'suspendida'`

**Problema identificado:** ⚠️ **FALTA información de suscripción**

### **2.3 Lo que FALTA para Hotmart:**
```
❌ No hay tabla de suscripciones
❌ No se guarda información de:
   - ID de transacción de Hotmart
   - Fecha de inicio de suscripción
   - Fecha de renovación/vencimiento
   - Estado de pago (activa, cancelada, vencida)
   - Período de facturación (mensual/anual)
   - Referencia de pago externa
   - Historial de pagos/renovaciones
```

---

## ✅ **3. SISTEMA DE LÍMITES Y VERIFICACIONES**

### **3.1 API de Límites** (`/api/limits/check`)
- ✅ Endpoint funcional para verificar límites
- ✅ Acciones protegidas: `create_cantera`, `add_cliente`, `register_produccion`, `register_venta`, `add_user`, `export_pdf`, `export_excel`

**Estado:** ✅ **Funcionando correctamente**

### **3.2 Lógica de Límites** (`lib/limits.ts`)
- ✅ Verificación basada en plan actual
- ✅ Conteo de recursos actuales
- ✅ Mensajes descriptivos cuando se alcanzan límites

**Estado:** ✅ **Implementado correctamente**

---

## ⚠️ **4. PROBLEMAS Y ÁREAS DE MEJORA IDENTIFICADOS**

### **4.1 Críticos (Bloquean integración Hotmart):**

#### **A. Falta Tabla de Suscripciones**
```sql
-- NECESARIO CREAR:
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  plan TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
  billing_period TEXT, -- 'monthly', 'yearly'
  hotmart_transaction_id TEXT UNIQUE,
  hotmart_subscription_id TEXT,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **B. No hay Webhook Handler para Hotmart**
- ❌ Falta endpoint `/api/webhooks/hotmart` para recibir notificaciones
- ❌ No hay lógica para actualizar estado de suscripción automáticamente
- ❌ No hay validación de webhooks de Hotmart

#### **C. Falta Gestión de Períodos de Facturación**
- ❌ Los planes tienen `price.monthly` y `price.yearly` pero no se usa en la BD
- ❌ No se distingue entre suscripción mensual vs anual
- ❌ No hay cálculo de próximos pagos

### **4.2 Importantes (Mejoran la experiencia):**

#### **D. Página de Planes no tiene Flujo de Compra**
- ⚠️ La página `/dashboard/planes` solo muestra planes
- ⚠️ No hay botón "Comprar/Actualizar" que redirija a Hotmart
- ⚠️ Los botones en `/precios` redirigen a `/auth/register` (correcto para nuevos usuarios)
- ❌ Falta redirección específica para actualización de planes

#### **E. No hay Gestión de Estados de Suscripción**
- ❌ No se maneja período de gracia
- ❌ No se suspende acceso automáticamente al vencer
- ❌ No hay notificaciones de vencimiento

#### **F. Falta Historial de Suscripciones**
- ❌ No hay registro de cambios de plan
- ❌ No hay historial de pagos externos
- ❌ No hay registro de cancelaciones/reactivaciones

### **4.3 Menores (Mejoras de calidad):**

#### **G. Dashboard de Planes podría mejorarse**
- ⚠️ Podría mostrar fecha de renovación
- ⚠️ Podría mostrar historial de pagos
- ⚠️ Podría mostrar próximas facturaciones

---

## ✅ **5. LO QUE ESTÁ BIEN IMPLEMENTADO**

### **5.1 Autenticación y Autorización**
- ✅ Sistema de autenticación robusto con Supabase
- ✅ RLS (Row Level Security) configurado
- ✅ Multi-tenant funcionando correctamente
- ✅ Roles y permisos definidos

### **5.2 Gestión de Datos**
- ✅ CRUD completo en todos los módulos
- ✅ Validaciones de negocio implementadas
- ✅ Triggers para actualización automática (inventario, estado de pago)
- ✅ Foreign keys bien configuradas

### **5.3 Funcionalidades Core**
- ✅ Producción, Inventario, Transporte, Ventas, Clientes, Pagos, Gastos
- ✅ Dashboard mejorado con métricas financieras
- ✅ Reportes funcionando
- ✅ Exportación PDF implementada (ventas, viajes)

### **5.4 UX/UI**
- ✅ Diseño moderno y consistente
- ✅ Componentes reutilizables
- ✅ Navegación intuitiva
- ✅ Alertas y validaciones visibles

---

## 📋 **6. PLAN DE ACCIÓN PARA INTEGRACIÓN HOTMART**

### **Fase 1: Preparación de Base de Datos** ⚠️ **CRÍTICO**

#### **6.1 Crear Tabla de Suscripciones**
```sql
-- Nueva tabla para gestionar suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'profesional', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'pending_payment')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- IDs de Hotmart
  hotmart_transaction_id TEXT UNIQUE,
  hotmart_subscription_id TEXT,
  hotmart_product_id TEXT,
  
  -- Fechas importantes
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  metadata JSONB, -- Para guardar datos adicionales de Hotmart
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_hotmart ON subscriptions(hotmart_transaction_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### **6.2 Agregar Campos a Organizations (opcional pero recomendado)**
```sql
-- Campos adicionales útiles para tracking
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_failed_count INTEGER DEFAULT 0;
```

#### **6.3 Crear Historial de Cambios de Plan**
```sql
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT, -- 'upgrade', 'downgrade', 'renewal', 'cancellation', 'hotmart_webhook'
  hotmart_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_subscription_history_subscription ON subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_organization ON subscription_history(organization_id);
```

### **Fase 2: Crear Webhook Handler** ⚠️ **CRÍTICO**

#### **6.4 Endpoint para Webhooks de Hotmart**
```
/app/api/webhooks/hotmart/route.ts

Debe manejar eventos:
- PURCHASE_APPROVED: Primera compra
- PURCHASE_BILLET_PRINTED: Pago pendiente
- PURCHASE_CANCELED: Compra cancelada
- PURCHASE_CHARGEBACK: Chargeback
- SUBSCRIPTION_CANCELLATION: Cancelación de suscripción
- SUBSCRIPTION_PAUSED: Suscripción pausada
- SUBSCRIPTION_REACTIVATED: Reactivación
```

#### **6.5 Validación de Webhooks**
- Validar firma HMAC de Hotmart
- Verificar que el webhook sea legítimo
- Idempotencia (evitar procesar mismo evento dos veces)

### **Fase 3: Actualizar Lógica de Planes** ⚠️ **IMPORTANTE**

#### **6.6 Modificar `getUserPlan()`**
- Primero verificar `subscriptions` activa
- Si no hay suscripción activa, usar plan de `organizations`
- Si hay suscripción vencida, aplicar plan 'free'

#### **6.7 Crear Sistema de Renovación**
- Verificar suscripciones que expiran pronto (tarea cron o verificación en login)
- Notificar usuarios antes de expiración
- Suspender acceso automáticamente si no se renueva

### **Fase 4: Flujo de Compra** ⚠️ **IMPORTANTE**

#### **6.8 Página de Actualización de Planes**
- Modificar `/dashboard/planes/PlansSection.tsx`
- Agregar botones "Actualizar Plan" para planes superiores
- Redirigir a URL de Hotmart con parámetros:
  - `organization_id`
  - `plan_id` (mapeo a Hotmart product ID)
  - `billing_period` (monthly/yearly)
  - `return_url` (URL de retorno después del pago)

#### **6.9 Página de Éxito/Cancelación**
- `/dashboard/planes/success?transaction_id=XXX`
- `/dashboard/planes/cancel`
- Verificar transacción con Hotmart
- Actualizar suscripción automáticamente

### **Fase 5: Mejoras Adicionales** 💡 **RECOMENDADO**

#### **6.10 Dashboard de Suscripción**
- Mostrar estado actual de suscripción
- Mostrar próxima fecha de facturación
- Mostrar historial de pagos
- Botón para cancelar/reactivar

#### **6.11 Notificaciones**
- Email cuando suscripción está por vencer
- Email cuando pago falla
- Notificaciones en-app de cambios de plan

---

## 🔐 **7. SEGURIDAD Y VALIDACIONES NECESARIAS**

### **7.1 Webhook Security**
- ✅ Validar HMAC signature de Hotmart
- ✅ Verificar IP ranges (si Hotmart las proporciona)
- ✅ Rate limiting en endpoint de webhooks
- ✅ Logging de todos los webhooks recibidos

### **7.2 Validación de Estados**
- ✅ Solo permitir un upgrade si la suscripción está activa
- ✅ Prevenir downgrade inmediato sin período de gracia (si aplica)
- ✅ Validar que organización existe antes de procesar webhook

---

## 📊 **8. ESTRUCTURA DE DATOS RECOMENDADA**

### **8.1 Mapeo Hotmart → Sistema**

```
Hotmart Product ID → Plan del Sistema:
- PRODUCT_STARTER_MONTHLY → 'starter' (billing_period: 'monthly')
- PRODUCT_STARTER_YEARLY → 'starter' (billing_period: 'yearly')
- PRODUCT_PROFESIONAL_MONTHLY → 'profesional' (billing_period: 'monthly')
- PRODUCT_PROFESIONAL_YEARLY → 'profesional' (billing_period: 'yearly')
- PRODUCT_BUSINESS_MONTHLY → 'business' (billing_period: 'monthly')
- PRODUCT_BUSINESS_YEARLY → 'business' (billing_period: 'yearly')
```

### **8.2 Flujo de Compra Propuesto**

```
1. Usuario hace clic en "Actualizar Plan" en /dashboard/planes
2. Sistema genera URL de Hotmart con:
   - Product ID correspondiente
   - Buyer email (usuario actual)
   - Return URL: /dashboard/planes/success
   - Custom params: organization_id
3. Usuario completa pago en Hotmart
4. Hotmart redirige a /dashboard/planes/success?transaction_id=XXX
5. Sistema verifica transacción con Hotmart API
6. Sistema crea/actualiza suscripción
7. Sistema actualiza plan en organizations
8. Hotmart envía webhook (PURCHASE_APPROVED) para confirmar
```

---

## ⚠️ **9. RIESGOS Y CONSIDERACIONES**

### **9.1 Riesgos Identificados**
1. **Race Conditions:** Webhook y redirect pueden llegar simultáneamente
   - **Solución:** Usar transacciones DB y verificar estado antes de actualizar

2. **Pagos Fallidos:** Usuario "compra" pero pago falla después
   - **Solución:** No activar plan hasta confirmación vía webhook

3. **Cancelaciones:** Usuario cancela pero sigue usando plan
   - **Solución:** Verificar estado de suscripción en cada login/acción crítica

4. **Downgrade de Plan:** Usuario reduce plan pero excede nuevos límites
   - **Solución:** Permitir downgrade pero mantener acceso hasta fin de período, o migrar a 'free' automáticamente

### **9.2 Consideraciones de Negocio**
- **Período de gracia:** ¿Cuántos días después del vencimiento permitir acceso?
- **Refunds:** ¿Cómo manejar reembolsos de Hotmart?
- **Trial periods:** ¿Implementar períodos de prueba gratis para planes pagos?

---

## ✅ **10. CHECKLIST PRE-INTEGRACIÓN**

### **Base de Datos:**
- [ ] Crear tabla `subscriptions`
- [ ] Crear tabla `subscription_history`
- [ ] Agregar índices necesarios
- [ ] Crear triggers para actualizar `updated_at`
- [ ] Agregar funciones helper para obtener suscripción activa

### **Backend/API:**
- [ ] Crear endpoint `/api/webhooks/hotmart`
- [ ] Implementar validación HMAC
- [ ] Crear funciones para actualizar suscripciones
- [ ] Crear endpoint `/api/subscriptions/current` (opcional)

### **Frontend:**
- [ ] Actualizar página `/dashboard/planes` con botones de compra
- [ ] Crear página `/dashboard/planes/success`
- [ ] Crear página `/dashboard/planes/cancel`
- [ ] Actualizar `getUserPlan()` para usar suscripciones
- [ ] Agregar componente de estado de suscripción en dashboard

### **Configuración:**
- [ ] Obtener credenciales de Hotmart (API key, secret)
- [ ] Configurar webhook URL en Hotmart dashboard
- [ ] Mapear Product IDs de Hotmart a planes del sistema
- [ ] Configurar URLs de retorno (success/cancel)

### **Testing:**
- [ ] Probar webhook con Hotmart sandbox
- [ ] Probar flujo de compra completo
- [ ] Probar actualización de plan
- [ ] Probar cancelación
- [ ] Probar renovación automática
- [ ] Probar escenarios de error

---

## 📝 **11. RECOMENDACIONES FINALES**

### **Prioridad ALTA (Antes de lanzar):**
1. ✅ Crear tabla de suscripciones
2. ✅ Implementar webhook handler básico
3. ✅ Actualizar lógica de obtención de plan
4. ✅ Crear flujo de compra básico

### **Prioridad MEDIA (Primera semana):**
5. ✅ Implementar validación HMAC robusta
6. ✅ Agregar logging de webhooks
7. ✅ Crear página de gestión de suscripción
8. ✅ Implementar verificación de estado en login

### **Prioridad BAJA (Mejoras continuas):**
9. ⭐ Notificaciones de vencimiento
10. ⭐ Dashboard de suscripción con historial
11. ⭐ Período de gracia automático
12. ⭐ Migración de datos de plan existentes a suscripciones

---

## 🎯 **CONCLUSIÓN**

### **Estado Actual:**
✅ **Sistema estable y funcional** - La base está sólida

### **Preparación para Hotmart:**
⚠️ **Requiere trabajo preparatorio** - Faltan componentes críticos pero son manejables

### **Estimación de Trabajo:**
- **Mínimo viable:** 2-3 días (tabla suscripciones + webhook básico + flujo de compra)
- **Completo y robusto:** 5-7 días (incluyendo validaciones, historial, notificaciones)

### **Recomendación:**
**✅ Proceder con la integración** - El sistema está en buen estado y la integración es factible. Se recomienda hacerlo por fases, empezando con el MVP y luego añadiendo mejoras.

---

**Preparado por:** Auto (AI Assistant)  
**Fecha:** Enero 2026

