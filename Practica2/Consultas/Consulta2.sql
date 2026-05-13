-- =========================================================================
-- En base a un rango de fechas, mostrar las notas de las evaluaciones
-- considerando solo las evaluaciones APROBADAS.
-- =========================================================================

WITH
-- Parámetros del rango (cambia aquí)
params AS (
  SELECT
    DATE '2025-08-08' AS fecha_ini,
    DATE '2025-08-28' AS fecha_fin
  FROM dual
),

-- =========================================================================
-- Cálculo de la Nota Teórica (por examen)
-- =========================================================================
Nota_Teorica AS (
  SELECT 
    ru.examen_id_examen,
    ROUND(
      100 * SUM(CASE WHEN ru.respuesta = p.correcta THEN 1 ELSE 0 END) / COUNT(*)
    , 2) AS total_teorico
  FROM Respuesta_Usuario ru
  JOIN Pregunta p ON p.id_pregunta = ru.pregunta_id_pregunta
  GROUP BY ru.examen_id_examen
),

-- =========================================================================
-- Cálculo de la Nota Práctica (por examen)
-- =========================================================================
Nota_Practica AS (
  SELECT 
    rpu.examen_id_examen,
    ROUND(
      SUM(rpu.nota * (pp.punteo / 10.0))
    , 2) AS total_practico
  FROM Respuesta_Practico_Usuario rpu
  JOIN Pregunta_Practico pp ON pp.id_preg_practico = rpu.pregunta_practico_id_preg_practico
  GROUP BY rpu.examen_id_examen
)

-- =========================================================================
-- Consulta principal (solo aprobadas)
-- =========================================================================
SELECT 
  ex.id_examen,
  TRUNC(co.fecha) AS fecha_evaluacion,
  co.no_examen,

  r.nombre_completo,
  r.t_tramite,
  r.t_licencia,

  NVL(nt.total_teorico, 0) AS nota_teorica,
  NVL(np.total_practico, 0) AS nota_practica,

  'APROBADO' AS estado
FROM Examen ex
JOIN Correlativo co ON co.id_correlativo = ex.correlativo_id_correlativo
JOIN Registro r     ON r.id_registro     = ex.registro_id_registro

LEFT JOIN Nota_Teorica nt  ON nt.examen_id_examen = ex.id_examen
LEFT JOIN Nota_Practica np ON np.examen_id_examen = ex.id_examen
CROSS JOIN params pa

WHERE TRUNC(co.fecha) BETWEEN pa.fecha_ini AND pa.fecha_fin
  AND NVL(nt.total_teorico, 0) >= 70
  AND NVL(np.total_practico, 0) >= 70

ORDER BY TRUNC(co.fecha), co.no_examen, ex.id_examen;