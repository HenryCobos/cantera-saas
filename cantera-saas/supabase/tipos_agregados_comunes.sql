-- ============================================
-- TIPOS DE AGREGADOS COMUNES
-- ============================================
-- Script para agregar tipos de agregados comunes a todas las canteras existentes
-- Ejecuta este script después de crear tus canteras

-- ============================================
-- 1. INSERTAR TIPOS DE AGREGADOS PARA CADA CANTERA
-- ============================================
DO $$
DECLARE
  cantera_record RECORD;
  tipo_record RECORD;
BEGIN
  -- Para cada cantera existente
  FOR cantera_record IN 
    SELECT id, name FROM canteras
  LOOP
    -- Tipos de agregados más comunes en canteras
    FOR tipo_record IN 
      SELECT * FROM (VALUES
        ('Arena', 'm3', 25.00),
        ('Grava', 'm3', 30.00),
        ('Piedra Triturada 3/4"', 'm3', 35.00),
        ('Piedra Triturada 1/2"', 'm3', 35.00),
        ('Piedra Triturada 1/4"', 'm3', 40.00),
        ('Base Granular', 'm3', 28.00),
        ('Subbase', 'm3', 22.00),
        ('Piedra Chancada', 'm3', 32.00),
        ('Ripio', 'm3', 26.00),
        ('Arena Gruesa', 'm3', 27.00),
        ('Arena Fina', 'm3', 29.00),
        ('Zahorra', 'm3', 24.00)
      ) AS tipos(nombre, unidad, precio)
    LOOP
      -- Insertar tipo de agregado si no existe ya
      INSERT INTO tipos_agregados (cantera_id, nombre, unidad_medida, precio_base)
      SELECT 
        cantera_record.id,
        tipo_record.nombre::text,
        tipo_record.unidad::text,
        tipo_record.precio::numeric
      WHERE NOT EXISTS (
        SELECT 1 FROM tipos_agregados 
        WHERE cantera_id = cantera_record.id 
        AND nombre = tipo_record.nombre::text
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Tipos de agregados comunes agregados a todas las canteras';
END $$;

-- ============================================
-- 2. VERIFICAR TIPOS AGREGADOS CREADOS
-- ============================================
SELECT 
  c.name as cantera,
  ta.nombre as tipo_agregado,
  ta.unidad_medida,
  ta.precio_base
FROM tipos_agregados ta
INNER JOIN canteras c ON ta.cantera_id = c.id
ORDER BY c.name, ta.nombre;

-- ============================================
-- 3. FUNCIÓN PARA AGREGAR TIPOS A UNA CANTERA ESPECÍFICA
-- ============================================
CREATE OR REPLACE FUNCTION public.add_common_aggregate_types(cantera_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Tipos de agregados más comunes
  INSERT INTO tipos_agregados (cantera_id, nombre, unidad_medida, precio_base)
  VALUES
    (cantera_uuid, 'Arena', 'm3', 25.00),
    (cantera_uuid, 'Grava', 'm3', 30.00),
    (cantera_uuid, 'Piedra Triturada 3/4"', 'm3', 35.00),
    (cantera_uuid, 'Piedra Triturada 1/2"', 'm3', 35.00),
    (cantera_uuid, 'Piedra Triturada 1/4"', 'm3', 40.00),
    (cantera_uuid, 'Base Granular', 'm3', 28.00),
    (cantera_uuid, 'Subbase', 'm3', 22.00),
    (cantera_uuid, 'Piedra Chancada', 'm3', 32.00),
    (cantera_uuid, 'Ripio', 'm3', 26.00),
    (cantera_uuid, 'Arena Gruesa', 'm3', 27.00),
    (cantera_uuid, 'Arena Fina', 'm3', 29.00),
    (cantera_uuid, 'Zahorra', 'm3', 24.00)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Tipos de agregados comunes agregados a la cantera';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTAS
-- ============================================
-- Este script agrega los siguientes tipos de agregados comunes:
-- 1. Arena - Material fino
-- 2. Grava - Material grueso
-- 3. Piedra Triturada 3/4" - Para concreto y base
-- 4. Piedra Triturada 1/2" - Para concreto
-- 5. Piedra Triturada 1/4" - Para concreto fino
-- 6. Base Granular - Para bases de carreteras
-- 7. Subbase - Para subbases de carreteras
-- 8. Piedra Chancada - Material procesado
-- 9. Ripio - Material de cantera sin procesar
-- 10. Arena Gruesa - Arena de grano grueso
-- 11. Arena Fina - Arena de grano fino
-- 12. Zahorra - Mezcla de arena y grava
--
-- Puedes ajustar los precios según tu mercado local.
-- Puedes ejecutar este script múltiples veces sin problemas.

