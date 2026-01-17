# 🔐 Configurar Redirect URLs en Supabase - Guía Paso a Paso

**Tu dominio de Vercel:** `cantera-saas.vercel.app`

---

## 📍 **PASO 1: Acceder a la Configuración de Supabase**

1. **Ve a:** https://app.supabase.com
2. **Inicia sesión** con tu cuenta
3. **Selecciona tu proyecto** (el que corresponde a tu aplicación)
4. En el menú lateral izquierdo, haz clic en: **⚙️ Settings** (Configuración)
5. En el submenú que aparece, haz clic en: **🔗 API**

---

## 📋 **PASO 2: Ubicar la Sección "URL Configuration"**

En la página de configuración de API, encontrarás varias secciones. Busca la sección llamada:

**"URL Configuration"** o **"Configuración de URL"**

Está ubicada aproximadamente en la parte superior de la página, después de las credenciales de API.

---

## ✅ **PASO 3: Configurar Site URL**

En la sección **"URL Configuration"**, encontrarás dos campos principales:

### **Campo 1: Site URL**

**Ubicación:** Campo de texto en la parte superior

**Valor a configurar:**
```
https://cantera-saas.vercel.app
```

**⚠️ IMPORTANTE:**
- Debe empezar con `https://`
- NO debe terminar con `/` (sin barra al final)
- Debe ser la URL exacta de tu dominio en Vercel

---

## ✅ **PASO 4: Configurar Redirect URLs**

### **Campo 2: Redirect URLs (o Redirect URL Patterns)**

**Ubicación:** Campo de texto debajo de "Site URL" (puede ser un área de texto más grande o múltiples líneas)

**Valores a agregar (uno por línea o separados por comas):**

```
https://cantera-saas.vercel.app/**
https://cantera-saas.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

**Explicación de cada URL:**
- `https://cantera-saas.vercel.app/**` - Permite todas las rutas en producción (OBLIGATORIO)
- `https://cantera-saas.vercel.app/auth/callback` - Ruta específica de callback de autenticación (RECOMENDADO)
- `http://localhost:3000/**` - Para desarrollo local (OPCIONAL pero recomendado)
- `http://localhost:3000/auth/callback` - Callback para desarrollo local (OPCIONAL)

**⚠️ IMPORTANTE:**
- El patrón `/**` significa "todas las rutas debajo de esta"
- Debe incluir `https://` para producción
- Cada URL debe estar en una línea separada (o separada por comas, dependiendo del formato de Supabase)

---

## 🖼️ **VISUALIZACIÓN DE LA INTERFAZ**

```
┌─────────────────────────────────────────────────┐
│  Supabase Dashboard → Settings → API            │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔐 API Settings                                │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ URL Configuration                         │ │
│  ├───────────────────────────────────────────┤ │
│  │                                           │ │
│  │ Site URL:                                 │ │
│  │ ┌─────────────────────────────────────┐   │ │
│  │ │ https://cantera-saas.vercel.app     │   │ │
│  │ └─────────────────────────────────────┘   │ │
│  │                                           │ │
│  │ Redirect URLs:                            │ │
│  │ ┌─────────────────────────────────────┐   │ │
│  │ │ https://cantera-saas.vercel.app/**  │   │ │
│  │ │ https://cantera-saas.vercel.app/    │   │ │
│  │ │   auth/callback                     │   │ │
│  │ │ http://localhost:3000/**            │   │ │
│  │ └─────────────────────────────────────┘   │ │
│  │                                           │ │
│  │ [Save] button                             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📝 **PASO 5: Guardar los Cambios**

1. Después de agregar las URLs, desplázate hacia abajo
2. Haz clic en el botón **"Save"** o **"Guardar"** (generalmente está en la parte inferior de la sección)
3. Espera a que aparezca un mensaje de confirmación: **"Settings saved successfully"** o similar

---

## ✅ **PASO 6: Verificar la Configuración**

Después de guardar, verifica que:

1. **Site URL** muestra: `https://cantera-saas.vercel.app`
2. **Redirect URLs** incluye al menos:
   - `https://cantera-saas.vercel.app/**`
   - `https://cantera-saas.vercel.app/auth/callback` (opcional pero recomendado)

---

## 🔄 **PASO 7: Probar la Aplicación**

Después de configurar las URLs:

1. **Abre tu aplicación en Vercel:**
   - URL: https://cantera-saas.vercel.app

2. **Prueba el flujo de autenticación:**
   - Ve a: `https://cantera-saas.vercel.app/auth/login`
   - Intenta iniciar sesión
   - Si funciona, deberías ser redirigido correctamente

3. **Si aún hay problemas:**
   - Verifica que las variables de entorno en Vercel estén configuradas
   - Verifica que `NEXT_PUBLIC_APP_URL` en Vercel sea: `https://cantera-saas.vercel.app`

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Problema: No encuentro la sección "URL Configuration"**
**Solución:**
- Asegúrate de estar en: **Settings → API** (no en otra sección de Settings)
- Si no aparece, puede estar en **Settings → Authentication → URL Configuration**

### **Problema: El campo Redirect URLs no acepta `/**`**
**Solución:**
- Algunas versiones de Supabase requieren URLs específicas sin wildcards
- Prueba con: `https://cantera-saas.vercel.app` (sin `/**`)
- O intenta agregar múltiples URLs específicas, una por línea

### **Problema: Sigue apareciendo error 404**
**Solución:**
- Verifica que `NEXT_PUBLIC_APP_URL` en Vercel esté configurado como `https://cantera-saas.vercel.app`
- Verifica que las variables de entorno en Vercel estén aplicadas a Production
- Haz un redeploy en Vercel después de cambiar variables de entorno

---

## 📋 **CHECKLIST FINAL**

Antes de considerar resuelto, verifica:

- [ ] Site URL configurada: `https://cantera-saas.vercel.app`
- [ ] Redirect URLs incluye: `https://cantera-saas.vercel.app/**`
- [ ] Cambios guardados en Supabase
- [ ] `NEXT_PUBLIC_APP_URL` en Vercel configurado como `https://cantera-saas.vercel.app`
- [ ] Variables de entorno aplicadas a Production en Vercel
- [ ] Aplicación probada en: `https://cantera-saas.vercel.app`

---

## 🔗 **ENLACE DIRECTO (si tienes acceso)**

Una vez que estés en tu proyecto de Supabase, puedes acceder directamente a:

**Settings → API → URL Configuration**

La URL será algo como:
```
https://app.supabase.com/project/TU-PROYECTO-ID/settings/api
```

---

**Última actualización:** Enero 2026  
**Dominio configurado:** `cantera-saas.vercel.app`

