# ✅ Checklist Inmediato: Deploy a Vercel

**Fecha:** Enero 2026  
**Estado del Proyecto:** ✅ **LISTO PARA DEPLOY**

---

## 🎯 **RESUMEN EJECUTIVO**

✅ **Build local:** Funciona correctamente  
✅ **Configuración:** Middleware, Supabase SSR, rutas protegidas configuradas  
⏳ **Pendiente:** Configurar variables de entorno en Vercel y Supabase redirect URLs

---

## 📋 **CHECKLIST PRE-DEPLOY (5 minutos)**

### **Paso 1: Obtener Credenciales de Supabase**
- [ ] Ir a: https://app.supabase.com
- [ ] Seleccionar tu proyecto
- [ ] Ir a: **Settings** → **API**
- [ ] Copiar:
  - **Project URL** → Usar como `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → Usar como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Paso 2: Verificar Build Local**
- [x] ✅ `npm run build` funciona correctamente (ya verificado)

### **Paso 3: Subir Código a GitHub (si no está ya)**
- [ ] Verificar estado: `git status`
- [ ] Si hay cambios: `git add . && git commit -m "Preparado para deploy"`
- [ ] Subir: `git push origin main`

---

## 🚀 **CHECKLIST DE DEPLOY EN VERCEL (10 minutos)**

### **Paso 4: Crear/Importar Proyecto en Vercel**
- [ ] Ir a: https://vercel.com
- [ ] Iniciar sesión o crear cuenta
- [ ] **New Project** → **Import Git Repository**
- [ ] Seleccionar `cantera-saas`

### **Paso 5: Configurar Proyecto**
En la pantalla de configuración, verificar:
- [ ] Framework Preset: **Next.js** (auto-detectado)
- [ ] Root Directory: `./` (raíz)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)

### **⚠️ CRÍTICO - Paso 6: Configurar Variables de Entorno**

**ANTES de hacer clic en "Deploy":**

Desplazarse a **Environment Variables** y agregar:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://tu-proyecto.supabase.co (tu URL real)
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: tu_anon_key_aqui (tu anon key real)
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Variable 3:**
```
Name: NEXT_PUBLIC_APP_URL
Value: (dejar vacío por ahora, lo actualizaremos después)
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Variable 4 (Opcional - para Hotmart):**
```
Name: HOTMART_SECRET
Value: tu_hotmart_secret (si lo tienes)
Environments: ✅ Production, ✅ Preview
```

### **Paso 7: Hacer el Deploy**
- [ ] Hacer clic en **Deploy**
- [ ] Esperar 2-3 minutos
- [ ] Copiar la URL de producción (ej: `https://cantera-saas-abc123.vercel.app`)

---

## ✅ **CHECKLIST POST-DEPLOY (5 minutos)**

### **Paso 8: Actualizar NEXT_PUBLIC_APP_URL**
- [ ] Ir a: Vercel Dashboard → **Settings** → **Environment Variables**
- [ ] Editar `NEXT_PUBLIC_APP_URL`
- [ ] Poner: `https://cantera-saas.vercel.app`
- [ ] Guardar
- [ ] Ir a: **Deployments** → Último deployment → **...** → **Redeploy**

### **Paso 9: Configurar Supabase Redirect URLs**
- [ ] Ir a: Supabase Dashboard → **Settings** → **API**
- [ ] En **URL Configuration**, agregar:
  - **Site URL:** `https://cantera-saas.vercel.app`
  - **Redirect URLs:** `https://cantera-saas.vercel.app/**`
- [ ] Guardar
- [ ] **📖 Ver guía detallada:** `CONFIGURAR_SUPABASE_REDIRECT_URLS.md`

### **Paso 10: Probar la Aplicación**
- [ ] Abrir: `https://cantera-saas.vercel.app`
- [ ] Verificar que la landing page carga: `/`
- [ ] Probar registro: `/auth/register`
- [ ] Probar login: `/auth/login`
- [ ] Verificar dashboard: `/dashboard`

---

## 🐛 **SI ALGO FALLA**

### **Error: "Environment variables not found"**
**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar que las variables estén agregadas
3. Asegurarse de seleccionar todos los ambientes
4. Hacer redeploy

### **Error: "Build failed"**
**Solución:**
1. Ver logs en Vercel → Deployments → [deployment fallido]
2. Ejecutar `npm run build` localmente para ver el error
3. Corregir el error
4. Hacer push a GitHub
5. Vercel redeployará automáticamente

### **Error: "CORS" o autenticación no funciona**
**Solución:**
1. Verificar que Supabase Redirect URLs estén configuradas
2. Verificar que `NEXT_PUBLIC_APP_URL` esté configurado correctamente
3. Verificar formato: `https://tu-proyecto.vercel.app/**` (sin espacios)

---

## 📝 **VARIABLES DE ENTORNO REQUERIDAS**

### **En Vercel Dashboard → Settings → Environment Variables:**

```env
# OBLIGATORIAS:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_APP_URL=https://cantera-saas.vercel.app

# OPCIONALES (para Hotmart):
HOTMART_SECRET=tu_hotmart_secret
HOTMART_SANDBOX=false
```

---

## ✅ **VERIFICACIÓN FINAL**

Antes de considerar el deploy completo:

- [ ] ✅ Build se completó exitosamente en Vercel
- [ ] ✅ La aplicación carga en la URL de Vercel
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ `NEXT_PUBLIC_APP_URL` actualizado con URL real
- [ ] ✅ Supabase Redirect URLs configuradas
- [ ] ✅ Landing page carga correctamente
- [ ] ✅ Registro de usuarios funciona
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard carga correctamente

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **Análisis completo:** `ANALISIS_DEPLOY_VERCEL.md`
- **Guía detallada:** `GUIA_DEPLOY_VERCEL.md`
- **Pasos inmediatos:** `PASOS_DEPLOY_INMEDIATO.md`

---

**Tiempo estimado total:** 20 minutos  
**Estado:** ✅ **Proyecto listo para deploy**

