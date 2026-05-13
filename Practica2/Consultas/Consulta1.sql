-- =========================================================================
-- LISTADO DE TODAS LAS EVALUACIONES REALIZADAS EN EL DIA. LA CONSULTA DEBE RECIBIR DE PARAMETRO
-- LA FECHA A CONSULTAR Y COMO RESULTADO DEBERA MOSTRAR TODOS LOS DATOS GENERALES DEL EVALUADO
-- ASI COMO TAMBIEN LAS NOTAS OBTENIDAS Y SI FUE APROBADO O REPROBADO
-- =========================================================================
-- =========================================================================
-- Cálculo de la Nota Teórica
-- =========================================================================
WITH Nota_Teorica AS (
  SELECT 
    ru.examen_id_examen,
    -- SeCompara la respuesta del usuario con la correcta. 
    -- Se Saca el promedio se redondea a 2 decimales.
    ROUND(
      100 * SUM(CASE WHEN ru.respuesta = p.correcta THEN 1 ELSE 0 END) / COUNT(*)
    , 2) AS total_teorico
  FROM Respuesta_Usuario ru
  JOIN Pregunta p ON p.id_pregunta = ru.pregunta_id_pregunta
  GROUP BY ru.examen_id_examen
),

-- =========================================================================
-- Cálculo de la Nota Práctica
-- =========================================================================
Nota_Practica AS (
  SELECT 
    rpu.examen_id_examen,
    -- Se Multiplica la nota obtenida por el punteo real de la pregunta.
    -- El 10.0 asegura la precisión decimal en la división.
    ROUND(
      SUM(rpu.nota * (pp.punteo / 10.0))
    , 2) AS total_practico
  FROM Respuesta_Practico_Usuario rpu
  JOIN Pregunta_Practico pp ON pp.id_preg_practico = rpu.pregunta_practico_id_preg_practico
  GROUP BY rpu.examen_id_examen
)

-- =========================================================================
-- Consulta Principal: Unión de datos y evaluación final
-- =========================================================================
SELECT 
  -- Datos de control del examen
  ex.id_examen,
  TRUNC(co.fecha) AS fecha_evaluacion,
  co.no_examen,
  
  -- Datos del registro y del aspirante
  r.id_registro,
  r.fecha AS fecha_registro,
  r.escuela_id_escuela,
  r.centro_id_centro,
  r.municipio_id_municipio,
  r.t_tramite,
  r.t_licencia,
  r.nombre_completo,
  r.genero,
  
  -- Extraemos las notas calculadas. 
  -- Si no hay registro, asignamos 0 por defecto.
  NVL(nt.total_teorico, 0) AS nota_teorica,
  NVL(np.total_practico, 0) AS nota_practica,
  
  -- Lógica de aprobación: Requiere 70 o más en AMBAS pruebas
  CASE 
    WHEN NVL(nt.total_teorico, 0) >= 70 AND NVL(np.total_practico, 0) >= 70 THEN 'APROBADO'
    ELSE 'REPROBADO'
  END AS estado

FROM Examen ex

-- Union con las tablas necesarias para obtener la información completa del examen y el registro
JOIN Correlativo co ON co.id_correlativo = ex.correlativo_id_correlativo
JOIN Registro r     ON r.id_registro     = ex.registro_id_registro

-- LEFT JOIN para asegurar que el examen aparezca aunque falte alguna de las dos notas
LEFT JOIN Nota_Teorica nt  ON nt.examen_id_examen = ex.id_examen
LEFT JOIN Nota_Practica np ON np.examen_id_examen = ex.id_examen

-- Filtro de fecha exacto
WHERE TRUNC(co.fecha) = DATE '2025-08-10'

-- Ordenamiento final para la presentación del reporte
ORDER BY co.no_examen, ex.id_examen;