# 🚀 Guía Completa: Deploy a Producción con Vercel

Esta guía te llevará paso a paso para desplegar Cantera SaaS en producción usando Vercel.

---

## 📋 **PREPARACIÓN ANTES DEL DEPLOY**

### **1. Verificar que el proyecto compile localmente**

```bash
# Instalar dependencias
npm install

# Hacer build local para verificar que no hay errores
npm run build

# Si todo está bien, deberías ver "Build successful"
```

Si hay errores, corrígelos antes de continuar.

---

## 🔧 **PASO 1: CONFIGURAR VARIABLES DE ENTORNO**

### **1.1 Crear archivo `.env.local` (para desarrollo local)**

Crea un archivo `.env.local` en la raíz del proyecto con estas variables:

```env
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# URL de la aplicación (OBLIGATORIO para producción)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hotmart (OPCIONAL - para cuando actives la integración)
HOTMART_SECRET=tu_hotmart_secret_aqui
HOTMART_SANDBOX=false
```

**⚠️ IMPORTANTE:** El archivo `.env.local` NO debe subirse a Git (debe estar en `.gitignore`)

### **1.2 Obtener credenciales de Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📦 **PASO 2: PREPARAR EL PROYECTO PARA VERCEL**

### **2.1 Verificar que `next.config.ts` existe y está configurado**

El archivo `next.config.ts` ya existe en tu proyecto. Verifica que tenga esta estructura básica:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes si las usas
  images: {
    domains: [], // Agrega dominios externos si necesitas cargar imágenes
  },
  // Otras configuraciones...
};

export default nextConfig;
```

### **2.2 Crear archivo `.vercelignore` (opcional)**

Crea un archivo `.vercelignore` en la raíz para excluir archivos innecesarios:

```
node_modules
.next
.env*.local
.git
.DS_Store
*.md
supabase/
```

---

## 🚀 **PASO 3: DEPLOY EN VERCEL**

### **Opción A: Deploy desde la CLI (Recomendado)**

1. **Instalar Vercel CLI (si no lo tienes):**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión en Vercel:**
   ```bash
   vercel login
   ```

3. **Hacer deploy:**
   ```bash
   # Deploy a preview (recomendado primero)
   vercel

   # Si todo está bien, deploy a producción
   vercel --prod
   ```

### **Opción B: Deploy desde GitHub (Recomendado para CI/CD)**

1. **Subir código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/cantera-saas.git
   git push -u origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Crea una cuenta o inicia sesión
   - Haz clic en **"New Project"**
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configurar el proyecto:**
   - Framework Preset: **Next.js** (auto-detectado)
   - Root Directory: `./` (raíz)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

---

## ⚙️ **PASO 4: CONFIGURAR VARIABLES DE ENTORNO EN VERCEL**

**⚠️ CRÍTICO:** Debes configurar las variables de entorno en Vercel Dashboard.

### **4.1 Acceder a configuración de variables**

1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en **Settings** → **Environment Variables**

### **4.2 Agregar variables de entorno**

Agrega estas variables para **Production**, **Preview** y **Development**:

#### **OBLIGATORIAS:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

#### **OPCIONALES (para integración Hotmart):**
```env
HOTMART_SECRET=tu_hotmart_secret
HOTMART_SANDBOX=false
```

### **4.3 Actualizar NEXT_PUBLIC_APP_URL después del primer deploy**

Después del primer deploy, Vercel te dará una URL como `https://cantera-saas-abc123.vercel.app`. 

1. Copia esa URL
2. Ve a **Settings** → **Environment Variables**
3. Actualiza `NEXT_PUBLIC_APP_URL` con tu URL de Vercel
4. Haz un nuevo deploy para aplicar los cambios

---

## 🔐 **PASO 5: CONFIGURAR DOMINIO PERSONALIZADO (OPCIONAL)**

Si tienes un dominio propio:

1. Ve a **Settings** → **Domains** en Vercel
2. Agrega tu dominio (ej: `canterasaas.com`)
3. Sigue las instrucciones de Vercel para configurar DNS:
   - Agregar registro CNAME apuntando a `cname.vercel-dns.com`
   - O registrar nameservers si usas Vercel como DNS

4. **Actualizar variables de entorno:**
   - Cambia `NEXT_PUBLIC_APP_URL` a `https://tu-dominio.com`
   - Haz un nuevo deploy

---

## ✅ **PASO 6: VERIFICACIONES POST-DEPLOY**

### **6.1 Verificar que la aplicación carga**

1. Abre la URL de tu deploy (ej: `https://tu-proyecto.vercel.app`)
2. Verifica que la landing page carga correctamente

### **6.2 Probar autenticación**

1. Ve a `/auth/register` y crea una cuenta de prueba
2. Verifica que puedas iniciar sesión
3. Verifica que puedas acceder al dashboard

### **6.3 Verificar funcionalidades críticas**

- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Se pueden crear canteras
- [ ] Las operaciones básicas funcionan

### **6.4 Verificar variables de entorno**

Puedes crear una página de prueba temporal para verificar:

```typescript
// app/test-env/page.tsx (solo para verificación, eliminar después)
export default function TestEnv() {
  return (
    <div>
      <h1>Environment Check</h1>
      <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
      <p>APP_URL: {process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing'}</p>
      <p>HOTMART_SECRET: {process.env.HOTMART_SECRET ? '✅ Set' : '⚠️ Optional'}</p>
    </div>
  );
}
```

**⚠️ Elimina esta página después de verificar.**

---

## 🔧 **PASO 7: CONFIGURAR SUPABASE PARA PRODUCCIÓN**

### **7.1 Agregar URL de producción a Supabase**

1. Ve a Supabase Dashboard → **Settings** → **API**
2. En **URL Configuration**, agrega tu dominio de Vercel a:
   - **Allowed Redirect URLs**: `https://tu-dominio.vercel.app/**`
   - **Site URL**: `https://tu-dominio.vercel.app`

### **7.2 Verificar RLS (Row Level Security)**

Asegúrate de que todas las políticas RLS estén configuradas correctamente en producción.

### **7.3 Ejecutar migraciones de base de datos**

Si hay scripts SQL pendientes (como `create_subscriptions_schema.sql`):

1. Ve a Supabase Dashboard → **SQL Editor**
2. Ejecuta los scripts necesarios
3. Verifica que no haya errores

---

## 🌐 **PASO 8: CONFIGURAR WEBHOOK DE HOTMART**

Una vez que tengas tu URL de producción, configura el webhook de Hotmart:

1. Ve a Hotmart Dashboard → **Configuración** → **Webhooks**
2. Agrega URL: `https://tu-dominio.vercel.app/api/webhooks/hotmart`
3. Selecciona los eventos necesarios
4. Guarda la configuración

---

## 📊 **PASO 9: MONITOREO Y LOGS**

### **9.1 Ver logs en Vercel**

1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en **Deployments**
3. Selecciona un deployment → **Functions** → Ver logs

### **9.2 Ver logs de Supabase**

1. Ve a Supabase Dashboard → **Logs**
2. Revisa logs de autenticación, API, etc.

---

## 🐛 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: "Environment variables not found"**

**Solución:** Verifica que las variables estén configuradas en Vercel Dashboard → Settings → Environment Variables

### **Error: "Invalid Supabase URL"**

**Solución:** 
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` tenga el formato correcto
- No debe terminar con `/`
- Debe ser `https://xxx.supabase.co`

### **Error: "Build failed"**

**Solución:**
- Revisa los logs de build en Vercel
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm run build` localmente para ver el error específico

### **Error: "CORS" o problemas de autenticación**

**Solución:**
- Verifica que las URLs de redirect estén configuradas en Supabase
- Asegúrate de que `NEXT_PUBLIC_APP_URL` esté configurado correctamente

### **La aplicación carga pero no funciona correctamente**

**Solución:**
- Verifica que las variables de entorno estén disponibles en el runtime
- Las variables `NEXT_PUBLIC_*` están disponibles en el cliente
- Las variables sin `NEXT_PUBLIC_*` solo están en el servidor

---

## 📝 **CHECKLIST PRE-DEPLOY**

Antes de hacer deploy, verifica:

- [ ] `npm run build` funciona sin errores localmente
- [ ] Todas las variables de entorno están documentadas
- [ ] `.env.local` está en `.gitignore`
- [ ] No hay código de desarrollo/debug en producción
- [ ] Los scripts SQL necesarios están documentados
- [ ] Tienes acceso a Supabase Dashboard
- [ ] Tienes una cuenta de Vercel

---

## 📝 **CHECKLIST POST-DEPLOY**

Después del deploy, verifica:

- [ ] La aplicación carga correctamente
- [ ] Puedes registrarte e iniciar sesión
- [ ] El dashboard funciona
- [ ] Las operaciones básicas (crear cantera, venta, etc.) funcionan
- [ ] Variables de entorno están configuradas en Vercel
- [ ] URLs de redirect están configuradas en Supabase
- [ ] Webhook de Hotmart está configurado (si aplica)

---

## 🎯 **PRÓXIMOS PASOS**

Una vez en producción:

1. **Actualizar configuración de Hotmart:**
   - URL del webhook: `https://tu-dominio.vercel.app/api/webhooks/hotmart`
   - URL del área de miembros: `https://tu-dominio.vercel.app/auth/login`

2. **Configurar monitoreo:**
   - Considera usar servicios como Sentry para errores
   - Configura alertas en Vercel

3. **Optimización:**
   - Revisa métricas de performance en Vercel Analytics
   - Optimiza imágenes y assets si es necesario

---

## 📚 **RECURSOS ÚTILES**

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js Deployment](https://nextjs.org/docs/deployment)
- [Documentación de Supabase](https://supabase.com/docs)

---

**Última actualización:** Enero 2026

