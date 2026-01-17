# 📚 Guía Completa del Sistema de Gestión de Cantera

## 🎯 Visión General

Este sistema permite gestionar completamente una cantera, desde la producción de agregados hasta las ventas, pagos y reportes. Todo está organizado por organización (multi-tenant) para que cada empresa tenga sus propios datos.

---

## 🏗️ Estructura del Sistema

### Módulos Principales

1. **Cantera** - Configuración de canteras y tipos de agregados
2. **Producción** - Registro diario de producción de agregados
3. **Inventario** - Control de stock de materiales
4. **Transporte** - Gestión de camiones, choferes y viajes
5. **Clientes** - Base de datos de clientes
6. **Ventas** - Registro de ventas y facturas
7. **Pagos** - Registro de pagos recibidos de clientes
8. **Gastos** - Control de gastos operativos
9. **Reportes** - Análisis financiero y operativo

---

## 📋 Ejemplo Real: Flujo Completo de Trabajo

### Escenario: Venta Completa de Material

**Situación:** Una constructora necesita 50 m³ de Arena y 30 m³ de Grava para una obra.

---

## 🚀 Paso 1: Configuración Inicial (Solo Primera Vez)

### 1.1 Crear Cantera

1. Ve a **Dashboard > Cantera**
2. Haz clic en **"Nueva Cantera"**
3. Completa:
   - **Nombre:** Cantera San José
   - **Ubicación:** Km 15 Carretera Norte
   - **Descripción:** Cantera principal
4. Haz clic en **"Crear Cantera"**

### 1.2 Tipos de Agregados (Se crean automáticamente)

Los tipos de agregados comunes se crean automáticamente cuando accedes a la sección de producción:
- Arena (m³) - $25.00
- Grava (m³) - $30.00
- Piedra Triturada 3/4" - $35.00
- Y otros 9 tipos más

**Si necesitas agregar un tipo personalizado:**
1. Ve a **Cantera > [Tu Cantera]**
2. Haz clic en **"Nuevo Tipo de Agregado"**
3. Completa: Nombre, Unidad de Medida, Precio Base
4. Guarda

---

## 🚀 Paso 2: Registrar Producción

**Objetivo:** Registrar que produjiste material en la cantera

1. Ve a **Dashboard > Producción**
2. Haz clic en **"Nueva Producción"**
3. Completa el formulario:
   - **Fecha:** 16/01/2026
   - **Tipo de Agregado:** Arena
   - **Cantidad Producida:** 100 m³
   - **Merma:** 2 m³
   - **Máquina:** Excavadora #1
4. Haz clic en **"Registrar Producción"**

**Resultado:** 
- Se registran 98 m³ netos de Arena (100 - 2 de merma)
- El inventario se actualiza automáticamente
- Ahora tienes 98 m³ de Arena disponibles

**Repite para Grava:**
- **Fecha:** 16/01/2026
- **Tipo de Agregado:** Grava
- **Cantidad Producida:** 80 m³
- **Merma:** 1.5 m³
- Guarda

**Resultado:** Tienes 78.5 m³ de Grava en inventario

---

## 🚀 Paso 3: Verificar Inventario

1. Ve a **Dashboard > Inventario**
2. Verás el stock actual:
   - Arena: 98 m³
   - Grava: 78.5 m³

**Importante:** El inventario se actualiza automáticamente cuando:
- Produces material (aumenta)
- Realizas una venta (disminuye)

---

## 🚀 Paso 4: Crear Cliente

1. Ve a **Dashboard > Clientes**
2. Haz clic en **"Nuevo Cliente"**
3. Completa:
   - **Tipo:** Constructora
   - **Nombre:** Constructora ABC S.A.
   - **Documento:** 12345678-9
   - **Teléfono:** 2234-5678
   - **Email:** contacto@abc.com
   - **Dirección:** Av. Principal #123
   - **Límite de Crédito:** $10,000.00 (si aplica)
4. Haz clic en **"Crear Cliente"**

---

## 🚀 Paso 5: Crear Venta

**Objetivo:** Registrar la venta de 50 m³ de Arena y 30 m³ de Grava a la Constructora ABC

1. Ve a **Dashboard > Ventas**
2. Haz clic en **"Nueva Venta"**
3. Completa el formulario:

   **Información General:**
   - **Número de Factura:** FAC-20260116-001 (se genera automáticamente si lo dejas vacío)
   - **Fecha:** 16/01/2026
   - **Cliente:** Constructora ABC S.A.
   - **Tipo de Pago:** Crédito (puede pagar después)
   - **Fecha de Vencimiento:** 16/02/2026 (30 días)

   **Productos:**
   - **Fila 1:**
     - Tipo de Agregado: Arena
     - Cantidad: 50
     - Precio Unitario: $25.00
     - Subtotal: $1,250.00 (se calcula automáticamente)
   
   - Haz clic en **"Agregar Producto"** para agregar la segunda fila
   
   - **Fila 2:**
     - Tipo de Agregado: Grava
     - Cantidad: 30
     - Precio Unitario: $30.00
     - Subtotal: $900.00

   **Total:** $2,150.00

4. Haz clic en **"Registrar Venta"**

**Resultado:**
- ✅ Se crea la factura #FAC-20260116-001
- ✅ El inventario se actualiza automáticamente:
  - Arena: 98 - 50 = **48 m³ disponibles**
  - Grava: 78.5 - 30 = **48.5 m³ disponibles**
- ✅ La venta queda en estado **"Pendiente"** (porque es crédito)
- ✅ Puedes ver la venta en **Dashboard > Ventas**

**Si fuera venta de CONTADO:**
- El sistema crea automáticamente el pago por el monto total
- La venta queda marcada como **"Pagada"** inmediatamente

---

## 🚀 Paso 6: Programar Transporte (Opcional)

Si necesitas entregar el material:

### 6.1 Registrar Camión

1. Ve a **Dashboard > Transporte > Camiones**
2. Haz clic en **"Nuevo Camión"**
3. Completa:
   - **Placa:** ABC-1234
   - **Modelo:** Volvo FH16
   - **Capacidad:** 15 m³
   - **Año:** 2020
   - **Estado:** Activo
4. Guarda

### 6.2 Registrar Chofer

1. Ve a **Dashboard > Transporte > Choferes**
2. Haz clic en **"Nuevo Chofer"**
3. Completa:
   - **Nombre:** Juan Pérez
   - **Licencia:** 12345678
   - **Teléfono:** 7890-1234
   - **Estado:** Activo
4. Guarda

### 6.3 Registrar Viaje

1. Ve a **Dashboard > Transporte > Viajes**
2. Haz clic en **"Nuevo Viaje"**
3. Completa:
   - **Cantera:** Cantera San José
   - **Camión:** ABC-1234
   - **Chofer:** Juan Pérez
   - **Venta Asociada:** FAC-20260116-001 (opcional)
   - **Fecha:** 17/01/2026
   - **Cantidad de Metros:** 80 m³ (50 Arena + 30 Grava)
   - **Destino:** Obra Calle Principal #456
   - **Costo Combustible:** $50.00
   - **Costo Peaje:** $5.00
   - **Otros Costos:** $10.00
4. Guarda

**Nota:** Los costos de transporte se pueden registrar como gastos después si deseas.

---

## 🚀 Paso 7: Registrar Pago del Cliente

**Escenario:** El cliente paga parcialmente $1,000.00 el 20/01/2026

1. Ve a **Dashboard > Pagos**
2. Haz clic en **"Registrar Pago"**
3. El sistema mostrará todas las ventas con saldo pendiente, incluyendo:
   - **FAC-20260116-001** - Constructora ABC S.A. - Pendiente: $2,150.00
4. Completa:
   - **Venta:** Selecciona FAC-20260116-001
   - **Fecha:** 20/01/2026
   - **Monto a Pagar:** $1,000.00 (el sistema muestra automáticamente el pendiente)
   - **Método de Pago:** Transferencia
   - **Referencia:** TRANS-20260120-001 (número de transferencia)
   - **Observaciones:** Pago parcial del 50%
5. Haz clic en **"Registrar Pago"**

**Resultado:**
- ✅ Se registra el pago de $1,000.00
- ✅ El estado de la venta cambia a **"Parcial"** automáticamente
- ✅ Saldo pendiente: $2,150.00 - $1,000.00 = **$1,150.00**

**Pago Final (15/02/2026):**
1. Ve a **Dashboard > Pagos > Registrar Pago**
2. Selecciona la misma venta (FAC-20260116-001)
3. El sistema muestra automáticamente el pendiente restante: **$1,150.00**
4. Completa:
   - **Fecha:** 15/02/2026
   - **Monto:** $1,150.00
   - **Método:** Efectivo
5. Guarda

**Resultado:**
- ✅ La venta queda marcada como **"Pagada"** automáticamente
- ✅ Saldo pendiente: $0.00

---

## 🚀 Paso 8: Registrar Gastos Operativos

**Ejemplo:** Registrar gastos del día

1. Ve a **Dashboard > Gastos**
2. Haz clic en **"Nuevo Gasto"**

### Gasto 1: Combustible

- **Categoría:** Combustible
- **Concepto:** Combustible excavadora
- **Monto:** $150.00
- **Fecha:** 16/01/2026
- **Proveedor:** Gasolinera XYZ
- **Referencia:** FACT-001234
- Guarda

### Gasto 2: Mantenimiento

- **Categoría:** Mantenimiento
- **Concepto:** Reparación de máquina trituradora
- **Monto:** $500.00
- **Fecha:** 16/01/2026
- **Proveedor:** Taller Mecánico ABC
- Guarda

### Gasto 3: Sueldos

- **Categoría:** Sueldos
- **Concepto:** Pago quincenal personal
- **Monto:** $2,000.00
- **Fecha:** 16/01/2026
- Guarda

**Total de Gastos del día:** $2,650.00

---

## 🚀 Paso 9: Ver Reportes

1. Ve a **Dashboard > Reportes**

Verás un resumen del mes actual:

- **Total Producción:** Suma de todos los materiales producidos
- **Total Ventas:** $2,150.00 (solo la venta que hiciste)
- **Total Gastos:** $2,650.00 (suma de tus gastos)
- **Total Pagos:** $1,000.00 (el pago parcial que recibiste)
- **Utilidad:** Ventas - Gastos = $2,150 - $2,650 = **-$500.00** (pérdida este día)

**Nota:** Los reportes se calculan automáticamente basándose en las fechas de los registros.

---

## 📊 Diferencias Clave: Ventas vs Pagos

### **VENTAS** (Dashboard > Ventas)
- **Propósito:** Registrar la venta/factura de material al cliente
- **Cuándo usar:** Cuando vendes material (aunque no hayas recibido el pago)
- **Resultado:** 
  - Se crea una factura
  - Se descuenta del inventario
  - Se registra el total a cobrar
- **Tipos:**
  - **Contado:** El pago se crea automáticamente
  - **Crédito:** Queda pendiente hasta que registres el pago

### **PAGOS** (Dashboard > Pagos)
- **Propósito:** Registrar los pagos que recibes de los clientes
- **Cuándo usar:** Cuando el cliente te paga (total o parcial)
- **Resultado:**
  - Se registra el pago recibido
  - Se actualiza el estado de la venta (pendiente → parcial → pagado)
  - Se reduce el saldo pendiente
- **Requisito:** Debe estar asociado a una venta existente

**Resumen:** 
- **Ventas** = "Vendí X cantidad de material por $Y"
- **Pagos** = "El cliente me pagó $Y de la venta X"

---

## 🔄 Flujo Completo Resumido

```
1. PRODUCCIÓN → Produces material → Aumenta INVENTARIO
                                    ↓
2. CLIENTES → Registras cliente
                                    ↓
3. VENTAS → Vendes material → Disminuye INVENTARIO → Queda PENDIENTE
                                    ↓
4. PAGOS → Cliente paga → Actualiza estado VENTA (Pendiente → Parcial → Pagado)
                                    ↓
5. GASTOS → Registras gastos operativos
                                    ↓
6. REPORTES → Analizas utilidad (Ventas - Gastos)
```

---

## 💡 Consejos y Mejores Prácticas

### ✅ Hacer

1. **Registra la producción diariamente** para mantener el inventario actualizado
2. **Crea clientes antes de hacer ventas** para tener un historial organizado
3. **Usa ventas de CONTADO** cuando recibes el pago inmediatamente
4. **Usa ventas de CRÉDITO** cuando el cliente pagará después
5. **Registra todos los gastos** para tener reportes precisos
6. **Revisa reportes mensualmente** para analizar la rentabilidad

### ❌ Evitar

1. **No crear ventas sin producción registrada** (no tendrás inventario)
2. **No registrar pagos sin ventas** (todos los pagos deben asociarse a una venta)
3. **No olvidar registrar gastos** (afectará tus reportes de utilidad)
4. **No mezclar tipos de pago** - Usa "Contado" solo si recibes el pago inmediatamente

---

## 🎯 Casos de Uso Comunes

### Caso 1: Venta de Contado (Pago Inmediato)

1. Cliente compra 20 m³ de Arena por $500.00
2. **Dashboard > Ventas > Nueva Venta:**
   - Tipo de Pago: **Contado**
   - Producto: 20 m³ Arena × $25.00 = $500.00
3. ✅ Sistema crea automáticamente el pago
4. ✅ Venta queda como "Pagada"
5. ✅ Inventario se actualiza

### Caso 2: Venta a Crédito (Pago Posterior)

1. Cliente compra 100 m³ de Grava por $3,000.00
2. **Dashboard > Ventas > Nueva Venta:**
   - Tipo de Pago: **Crédito**
   - Fecha de Vencimiento: 30 días
   - Producto: 100 m³ Grava × $30.00 = $3,000.00
3. ✅ Venta queda como "Pendiente"
4. ✅ Cliente paga después: **Dashboard > Pagos > Registrar Pago**

### Caso 3: Pago Parcial

1. Venta de $5,000.00 (Pendiente)
2. Cliente paga $2,000.00 (Parcial)
3. ✅ Estado cambia a "Parcial"
4. ✅ Saldo pendiente: $3,000.00
5. Cliente paga $3,000.00 después
6. ✅ Estado cambia a "Pagado"

### Caso 4: Múltiples Pagos

1. Venta de $10,000.00
2. Primer pago: $3,000.00 → Estado: Parcial
3. Segundo pago: $4,000.00 → Estado: Parcial
4. Tercer pago: $3,000.00 → Estado: Pagado ✅

---

## 📱 Navegación Rápida

| Quiero... | Ve a... |
|-----------|---------|
| Ver qué material tengo disponible | **Dashboard > Inventario** |
| Registrar que produje material hoy | **Dashboard > Producción > Nueva Producción** |
| Vender material a un cliente | **Dashboard > Ventas > Nueva Venta** |
| Registrar que me pagaron | **Dashboard > Pagos > Registrar Pago** |
| Ver cuánto me deben | **Dashboard > Ventas** (ver columna Estado) |
| Registrar un gasto | **Dashboard > Gastos > Nuevo Gasto** |
| Ver cuánto gané este mes | **Dashboard > Reportes** |
| Agregar un nuevo cliente | **Dashboard > Clientes > Nuevo Cliente** |
| Ver historial de una venta | **Dashboard > Ventas > [Click en la venta]** |

---

## 🔍 Preguntas Frecuentes

### ¿Por qué no aparece mi venta en el formulario de pagos?

**Solución:** 
- Verifica que la venta tenga saldo pendiente (total > monto_pagado)
- Las ventas de "contado" se marcan como pagadas automáticamente
- Solo aparecen ventas con saldo pendiente

### ¿Cómo sé cuánto me debe un cliente?

1. Ve a **Dashboard > Ventas**
2. Busca las ventas de ese cliente
3. Suma las que tengan estado "Pendiente" o "Parcial"
4. O ve a **Dashboard > Pagos** para ver el historial de pagos

### ¿Qué pasa si registro una venta sin tener inventario?

El sistema permite registrar la venta, pero verifica siempre tu inventario antes de vender para no comprometer entregas.

### ¿Puedo editar una venta después de crearla?

Por ahora el sistema no permite editar ventas después de crearlas. Debes crear una nueva venta o un ajuste manual.

### ¿Cómo cancelo una venta?

No hay funcionalidad de cancelación directa. Puedes crear un ajuste manual en inventario si necesitas devolver el material.

---

## 📞 Soporte

Si tienes dudas o encuentras algún problema:
1. Revisa esta guía primero
2. Verifica que hayas seguido todos los pasos en orden
3. Revisa los mensajes de error en la interfaz

---

**¡Listo! Ya sabes cómo usar el sistema completo.** 🎉

