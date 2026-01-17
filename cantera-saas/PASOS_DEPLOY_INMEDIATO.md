# 🚀 Pasos Inmediatos para Deploy a Vercel

Sigue estos pasos en orden para desplegar tu aplicación.

---

## ✅ **PASO 1: Verificar que el Build Funciona**

Ejecuta en tu terminal (en el directorio del proyecto):

```bash
npm run build
```

**Si hay errores:**
- Copia el error completo
- Corrígelos antes de continuar

**Si el build es exitoso:**
- Verás "Build successful" o similar
- Continúa al siguiente paso

---

## 📦 **PASO 2: Verificar/Inicializar Git**

Ejecuta:

```bash
git status
```

**Si Git NO está inicializado:**
```bash
git init
git add .
git commit -m "Preparado para producción"
```

**Si Git está inicializado pero hay cambios:**
```bash
git add .
git commit -m "Correcciones pre-deploy"
```

**Si necesitas subir a GitHub:**
```bash
# Si no tienes remote:
git remote add origin https://github.com/TU-USUARIO/cantera-saas.git

# Si ya tienes remote:
git push origin main
```

---

## 🌐 **PASO 3: Crear Cuenta/Proyecto en Vercel**

1. Ve a **https://vercel.com**
2. Crea cuenta o inicia sesión (puedes usar GitHub para registro rápido)
3. Haz clic en **"Add New..."** → **"Project"**
4. Si conectaste GitHub, verás tus repositorios
   - Selecciona `cantera-saas`
   - Si no lo ves, haz clic en **"Import Git Repository"** y conéctalos

---

## ⚙️ **PASO 4: Configurar Proyecto en Vercel**

En la pantalla de configuración:

1. **Framework Preset:** Next.js (debe detectarse automáticamente)
2. **Root Directory:** `./` (raíz)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

**NO hagas click en "Deploy" todavía** - primero configura las variables de entorno.

---

## 🔐 **PASO 5: Configurar Variables de Entorno ANTES del Deploy**

En la misma pantalla de configuración, desplázate hacia abajo hasta **"Environment Variables"**.

Agrega estas variables (haz clic en "Add" para cada una):

### **Variable 1:**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 2:**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Tu anon key de Supabase
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 3:**
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://tu-proyecto.vercel.app` (o déjala vacía por ahora, la actualizarás después)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 4 (Opcional - para Hotmart):**
- **Name:** `HOTMART_SECRET`
- **Value:** Tu secret de Hotmart (si ya lo tienes)
- **Environments:** ✅ Production, ✅ Preview

---

## 🚀 **PASO 6: Hacer el Deploy**

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel:
   - Instala dependencias
   - Compila el proyecto
   - Despliega la aplicación

3. Cuando termine, verás una URL como:
   ```
   https://cantera-saas-abc123.vercel.app
   ```

---

## ✅ **PASO 7: Actualizar Variables de Entorno con URL Real**

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Edita `NEXT_PUBLIC_APP_URL` y pon tu URL real de Vercel
4. Haz clic en **"Save"**
5. Ve a **Deployments** → selecciona el último deployment → **"..."** → **"Redeploy"**

---

## 🔗 **PASO 8: Configurar Supabase**

1. Ve a **Supabase Dashboard** → Tu proyecto → **Settings** → **API**
2. En **"URL Configuration"**, agrega:
   - **Site URL:** `https://tu-proyecto.vercel.app`
   - **Redirect URLs:** `https://tu-proyecto.vercel.app/**`
3. Guarda los cambios

---

## 🧪 **PASO 9: Probar la Aplicación**

1. Abre tu URL de Vercel en el navegador
2. Prueba:
   - [ ] La landing page carga
   - [ ] Puedes registrarte (`/auth/register`)
   - [ ] Puedes iniciar sesión (`/auth/login`)
   - [ ] El dashboard funciona

---

## 📝 **CHECKLIST FINAL**

- [ ] Build funciona localmente
- [ ] Código subido a GitHub (o listo para subir)
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Primer deploy completado
- [ ] `NEXT_PUBLIC_APP_URL` actualizado con URL real
- [ ] Supabase configurado con URLs de redirect
- [ ] Aplicación probada y funcionando

---

## 🆘 **SI ALGO FALLA**

### **Build falla en Vercel:**
1. Ve a **Deployments** → selecciona el deployment fallido
2. Revisa los logs para ver el error
3. Corrige el error localmente
4. Haz push a GitHub
5. Vercel redeployará automáticamente

### **Error "Environment variables not found":**
- Verifica que las variables estén en **Settings** → **Environment Variables**
- Asegúrate de seleccionar todos los ambientes (Production, Preview, Development)

### **Error de autenticación:**
- Verifica que las URLs de redirect estén configuradas en Supabase
- Verifica que `NEXT_PUBLIC_APP_URL` esté configurado correctamente

---

## 📞 **SIGUIENTE PASO DESPUÉS DEL DEPLOY**

Una vez que tu aplicación esté funcionando en Vercel:

1. **Copia tu URL de producción** (ej: `https://cantera-saas.vercel.app`)
2. **Configura Hotmart:**
   - Área de Miembros Externa: `https://tu-url.vercel.app/auth/login`
   - Webhook URL: `https://tu-url.vercel.app/api/webhooks/hotmart`

---

**¡Éxito con el deploy!** 🎉

