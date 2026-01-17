# ✅ Verificación de Service Role Key

## 🔐 Service Role Key Configurada

La Service Role Key ha sido agregada a tu `.env.local`.

**Importante de Seguridad:**
- ⚠️ **NUNCA** compartas tu Service Role Key públicamente
- ⚠️ **NO** la incluyas en repositorios Git (debe estar en `.gitignore`)
- ✅ Solo se usa en el servidor (API Routes)
- ✅ Nunca se expone al cliente

## 🔄 Reiniciar Servidor

Después de agregar la Service Role Key, **DEBES reiniciar** el servidor de desarrollo:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## ✅ Verificar que Funciona

1. **Reinicia el servidor de desarrollo**
2. **Inicia sesión como admin**
3. **Ve a `/dashboard/organizacion/usuarios`**
4. **Haz clic en "Crear Usuario"**
5. **Completa el formulario y crea un usuario**

Si todo está configurado correctamente, deberías poder crear usuarios sin problemas.

## 🐛 Si Hay Errores

### Error: "Service Role Key no configurada"
- Verifica que `.env.local` tenga la línea: `SUPABASE_SERVICE_ROLE_KEY=...`
- Reinicia el servidor después de agregar la variable

### Error: "No autorizado"
- Asegúrate de estar iniciado sesión
- Verifica que tu usuario tenga rol `admin` en la tabla `profiles`

### Error: "Solo administradores pueden crear usuarios"
- Solo usuarios con `role = 'admin'` pueden crear usuarios
- Verifica tu rol en Supabase Dashboard > Table Editor > profiles

## 📝 Notas

- La Service Role Key tiene privilegios completos en Supabase
- Se usa SOLO en el servidor (nunca se expone al cliente)
- Es segura usarla en API Routes de Next.js

