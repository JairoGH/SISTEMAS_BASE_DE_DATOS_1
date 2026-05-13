-- =========================================================================
-- Listar las preguntas con mayores aciertos en base a un rango de fechas.
-- =========================================================================

-- PARAMETROS
WITH params AS (
  SELECT 
    DATE '2025-08-08' AS fecha_ini,
    DATE '2025-08-28' AS fecha_fin
  FROM dual
)
SELECT

-- SELECCIONAMOS LOS ATRIBUTOS
  p.id_pregunta,
  p.texto,
  
  -- CONTAMOS LA CANTIDAD DE INTENTOS
  COUNT(*) AS total_intentos,
  
  -- CALCULAMOS LOS ACIERTOS
  SUM(CASE WHEN ru.respuesta = p.correcta THEN 1 ELSE 0 END) AS aciertos,
  
  -- TOTAL INTENTOS - ACIERTOS = CANTIDAD DE ERRORES
  COUNT(*) - SUM(CASE WHEN ru.respuesta = p.correcta THEN 1 ELSE 0 END) AS errores,
  
  -- SE MULTIPLICA POR 100.0 PARA ASEGURAR LA PRECISION DECIMAL
  ROUND(
    100.0 * SUM(CASE WHEN ru.respuesta = p.correcta THEN 1 ELSE 0 END) / COUNT(*), 2) AS porcentaje_acierto
    
-- TABLA PRINCIPAL DE DONDE SE PARTE
FROM Respuesta_Usuario ru

-- SE UNEN LAS TABLAS NECESARIAS PARA OBTENER ID PREGUNTA, ID EXAMEN Y ID DEL CORRELATIVO
JOIN Pregunta p     ON p.id_pregunta = ru.pregunta_id_pregunta
JOIN Examen ex      ON ex.id_examen  = ru.examen_id_examen
JOIN Correlativo co ON co.id_correlativo = ex.correlativo_id_correlativo

-- COMBINAMOS LOS PARAMETROS 
CROSS JOIN params pa

-- EVALUAMOS DESDE EL INICIO DEL DIA. HASTA EL COMIENZO DEL SIGUIENTE DIA
WHERE co.fecha >= pa.fecha_ini 
  AND co.fecha <  pa.fecha_fin + 1

-- AGRUPAMOS Y ORDENAMOS DESCENDENTEMENTE 
GROUP BY p.id_pregunta, p.texto
ORDER BY aciertos DESC, porcentaje_acierto DESC, total_intentos DESC, p.id_pregunta;