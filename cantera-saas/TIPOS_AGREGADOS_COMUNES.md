# ✅ Tipos de Agregados Comunes Agregados

## 📋 Tipos de Agregados Más Comunes

He agregado los siguientes **12 tipos de agregados comunes** que se usan frecuentemente en canteras:

### 1. **Arena** (m³) - $25.00
Material fino usado para concreto y morteros.

### 2. **Grava** (m³) - $30.00
Material grueso usado para concreto y bases.

### 3. **Piedra Triturada 3/4"** (m³) - $35.00
Piedra triturada de tamaño 3/4 pulgada, usada para concreto y bases de carreteras.

### 4. **Piedra Triturada 1/2"** (m³) - $35.00
Piedra triturada de tamaño 1/2 pulgada, usada para concreto.

### 5. **Piedra Triturada 1/4"** (m³) - $40.00
Piedra triturada de tamaño 1/4 pulgada, usada para concreto fino.

### 6. **Base Granular** (m³) - $28.00
Material para bases de carreteras y caminos.

### 7. **Subbase** (m³) - $22.00
Material para subbases de carreteras y caminos.

### 8. **Piedra Chancada** (m³) - $32.00
Piedra procesada manualmente o con maquinaria.

### 9. **Ripio** (m³) - $26.00
Material de cantera sin procesar.

### 10. **Arena Gruesa** (m³) - $27.00
Arena de grano grueso.

### 11. **Arena Fina** (m³) - $29.00
Arena de grano fino.

### 12. **Zahorra** (m³) - $24.00
Mezcla natural de arena y grava.

## 🚀 Cómo Agregar Tipos Comunes

### Opción 1: Desde la Página de Producción

Cuando veas el mensaje de error "No hay tipos de agregados configurados", verás un botón verde:
- **"Agregar Tipos de Agregados Comunes"** - Hace clic en este botón y se agregarán automáticamente todos los tipos comunes.

### Opción 2: Desde la Página de Detalle de Cantera

1. Ve a `/dashboard/cantera`
2. Haz clic en una cantera para ver su detalle
3. Si no hay tipos de agregados, verás un botón verde:
   - **"Agregar Tipos Comunes"** - Hace clic y se agregarán todos los tipos comunes.

### Opción 3: Ejecutar Script SQL (Para todas las canteras)

Ejecuta el script SQL `supabase/tipos_agregados_comunes.sql` en Supabase SQL Editor para agregar tipos comunes a todas las canteras existentes.

## ⚙️ Precios Ajustables

Los precios base son sugerencias y pueden ajustarse según tu mercado local:

- Puedes editar los precios desde la página de detalle de cantera
- O crear tipos personalizados con tus propios precios
- Los precios pueden variar por región y tipo de material

## ✅ Verificación

Después de agregar los tipos comunes:

1. Ve a `/dashboard/cantera/[id]` (detalle de cantera)
2. Verás los 12 tipos de agregados listados
3. Ahora puedes registrar producción desde `/dashboard/produccion/nuevo`
4. Los tipos aparecerán en el dropdown de "Tipo de Agregado"

## 🔄 Actualización de Precios

Si necesitas actualizar los precios de los tipos comunes:

1. Ve a `/dashboard/cantera/[id]`
2. Cada tipo muestra su precio actual
3. Puedes editar manualmente desde la base de datos o crear una nueva versión

## 📝 Notas

- Los precios son en la moneda configurada en tu sistema
- Puedes agregar más tipos personalizados además de los comunes
- Los tipos duplicados no se crean (se ignoran si ya existen)
- Puedes ejecutar el script múltiples veces sin problemas

