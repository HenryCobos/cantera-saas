# 🚀 Guía de Integración de Hotmart - Fase 1

Esta guía explica cómo completar la integración de Hotmart con tu sistema Cantera SaaS.

---

## ✅ **Lo que ya está implementado (Fase 1)**

### **1. Base de Datos**
- ✅ Tabla `subscriptions` creada
- ✅ Tabla `subscription_history` creada  
- ✅ Funciones helper para obtener suscripciones activas
- ✅ Triggers para actualizar automáticamente el plan en `organizations`

### **2. Backend**
- ✅ Endpoint `/api/webhooks/hotmart` creado
- ✅ Validación HMAC de webhooks (preparado)
- ✅ Lógica para procesar eventos de Hotmart
- ✅ Función `getUserPlan()` actualizada para usar suscripciones

### **3. Utilidades**
- ✅ `lib/subscriptions.ts` con funciones helper
- ✅ `lib/hotmart-config.ts` para configuración

---

## 📋 **PASOS PARA COMPLETAR LA INTEGRACIÓN**

### **PASO 1: Ejecutar Script SQL** ⚠️ **OBLIGATORIO**

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta el script: `supabase/create_subscriptions_schema.sql`
3. Verifica que no haya errores
4. Confirma que las tablas se crearon:
   ```sql
   SELECT * FROM subscriptions LIMIT 1;
   SELECT * FROM subscription_history LIMIT 1;
   ```

---

### **PASO 2: Configurar Variables de Entorno** ⚠️ **OBLIGATORIO**

Agrega estas variables en tu `.env.local` o en Vercel:

```env
# Hotmart Webhook Secret (obtener desde Hotmart Dashboard)
HOTMART_SECRET=tu_secret_key_aqui

# Hotmart Sandbox (opcional, usar 'true' para pruebas)
HOTMART_SANDBOX=false

# URL base de tu aplicación (para return URLs)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

**Cómo obtener HOTMART_SECRET:**
1. Accede a Hotmart Dashboard
2. Ve a Configuración → Webhooks
3. Copia el "Secret" o "Webhook Secret"

---

### **PASO 3: Configurar Product IDs** ⚠️ **OBLIGATORIO**

Edita `lib/hotmart-config.ts` y mapea tus Product IDs reales:

```typescript
export const HOTMART_PRODUCT_TO_PLAN: Record<string, {
  plan: 'starter' | 'profesional' | 'business';
  billingPeriod: 'monthly' | 'yearly';
}> = {
  '12345678901': { plan: 'starter', billingPeriod: 'monthly' },
  '12345678902': { plan: 'starter', billingPeriod: 'yearly' },
  '12345678903': { plan: 'profesional', billingPeriod: 'monthly' },
  '12345678904': { plan: 'profesional', billingPeriod: 'yearly' },
  '12345678905': { plan: 'business', billingPeriod: 'monthly' },
  '12345678906': { plan: 'business', billingPeriod: 'yearly' },
};
```

**Cómo encontrar tus Product IDs:**
1. En Hotmart Dashboard → Productos
2. Haz clic en cada producto
3. El Product ID aparece en la URL o en los detalles

---

### **PASO 4: Configurar Webhook en Hotmart** ⚠️ **OBLIGATORIO**

1. Ve a Hotmart Dashboard → Configuración → Webhooks
2. Agrega nueva URL de webhook:
   ```
   https://tu-dominio.com/api/webhooks/hotmart
   ```
3. Selecciona los eventos que quieres recibir:
   - ✅ `PURCHASE_APPROVED`
   - ✅ `PURCHASE_COMPLETE`
   - ✅ `SUBSCRIPTION_CANCELLATION`
   - ✅ `SUBSCRIPTION_REACTIVATED`
   - ✅ `PURCHASE_CANCELED`
   - ✅ `PURCHASE_REFUNDED`
   - ✅ `PURCHASE_CHARGEBACK`

4. Guarda la configuración

---

### **PASO 5: Crear Flujo de Compra** (Siguiente fase)

Una vez completados los pasos anteriores, necesitarás:
- Modificar `/dashboard/planes` para agregar botones de compra
- Crear páginas de éxito/cancelación
- Implementar redirección a Hotmart

---

## 🧪 **TESTING**

### **Probar Webhook Localmente (usando ngrok o similar)**

1. Ejecuta ngrok para exponer tu servidor local:
   ```bash
   ngrok http 3000
   ```

2. Usa la URL de ngrok en Hotmart webhook:
   ```
   https://abc123.ngrok.io/api/webhooks/hotmart
   ```

3. Realiza una compra de prueba en Hotmart sandbox

4. Verifica en Supabase que se creó la suscripción:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM subscription_history ORDER BY created_at DESC LIMIT 5;
   ```

---

## 🔍 **VERIFICACIÓN**

Después de completar los pasos, verifica:

1. **Tablas creadas:**
   ```sql
   \d subscriptions
   \d subscription_history
   ```

2. **Funciones creadas:**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name LIKE '%subscription%';
   ```

3. **Webhook responde:**
   ```bash
   curl https://tu-dominio.com/api/webhooks/hotmart
   ```
   Debe retornar: `{"message":"Hotmart webhook endpoint is active","status":"ok"}`

---

## 📝 **NOTAS IMPORTANTES**

1. **Seguridad:**
   - ⚠️ NUNCA commits `HOTMART_SECRET` en el código
   - ⚠️ Usa variables de entorno siempre
   - ⚠️ Valida HMAC en producción (puedes deshabilitarlo en desarrollo)

2. **Idempotencia:**
   - El sistema evita duplicados usando `hotmart_transaction_id` UNIQUE
   - Si Hotmart reenvía un webhook, se actualizará la suscripción existente

3. **Estados de Suscripción:**
   - `active`: Suscripción activa y vigente
   - `cancelled`: Suscripción cancelada por el usuario
   - `expired`: Suscripción vencida (no renovada)
   - `trial`: Período de prueba (si lo implementas)
   - `pending_payment`: Pago pendiente

4. **Fallback:**
   - Si no hay suscripción activa, el sistema usa el plan de `organizations`
   - Esto permite que usuarios sin suscripción sigan usando el plan 'free'

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Webhook no recibe eventos:**
- Verifica que la URL esté configurada correctamente en Hotmart
- Verifica que el endpoint sea accesible (no bloqueado por firewall)
- Revisa los logs de Hotmart para ver intentos de webhook

### **Error "Unknown product ID":**
- Verifica que los Product IDs estén correctamente mapeados en `hotmart-config.ts`
- Revisa el payload del webhook en los logs para ver el `product_id` real

### **Suscripción no se activa:**
- Verifica que el email del comprador coincida con un usuario en el sistema
- Revisa que el `organization_id` esté correctamente asignado al usuario
- Revisa los logs de Supabase para errores de inserción

---

## 📚 **PRÓXIMOS PASOS (Fase 2)**

Después de verificar que Fase 1 funciona:

1. Crear botones de compra en `/dashboard/planes`
2. Crear páginas de éxito/cancelación
3. Implementar verificación de estado en login
4. Agregar notificaciones de vencimiento
5. Crear dashboard de suscripción

---

**Última actualización:** Enero 2026

