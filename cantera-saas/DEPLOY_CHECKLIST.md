# ✅ Checklist Rápido de Deploy a Vercel

## Pre-Deploy

- [ ] Verificar que `npm run build` funciona localmente
- [ ] Tener credenciales de Supabase listas
- [ ] Crear archivo `.env.local` para desarrollo local

## Variables de Entorno Necesarias

### En Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

### Opcionales (para Hotmart):
```env
HOTMART_SECRET=tu_secret
HOTMART_SANDBOX=false
```

## Pasos Rápidos

1. **Subir a GitHub** (si no está ya)
   ```bash
   git add .
   git commit -m "Preparado para producción"
   git push
   ```

2. **Conectar con Vercel**
   - Ve a vercel.com → New Project
   - Importa desde GitHub
   - Configura variables de entorno

3. **Deploy**
   - Vercel detectará Next.js automáticamente
   - Primer deploy tomará 2-3 minutos

4. **Post-Deploy**
   - [ ] Actualizar `NEXT_PUBLIC_APP_URL` con URL real de Vercel
   - [ ] Configurar URLs en Supabase (Redirect URLs)
   - [ ] Probar login/registro
   - [ ] Configurar dominio personalizado (opcional)

## Verificación

- [ ] App carga en https://tu-proyecto.vercel.app
- [ ] Puedes registrarte
- [ ] Puedes iniciar sesión
- [ ] Dashboard funciona

Ver guía completa en: `GUIA_DEPLOY_VERCEL.md`

