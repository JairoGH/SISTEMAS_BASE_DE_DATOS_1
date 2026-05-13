WITH parametros AS (
    SELECT 
        2014 AS anio_busqueda,
        'CICLO9' AS ciclo_busqueda,
        TO_NUMBER(REGEXP_SUBSTR('CICLO9', '[0-9]+')) AS num_ciclo_busqueda
    FROM dual
),
catedraticos_objetivo AS (
    SELECT DISTINCT
           s.catedratico_cod_catedratico AS cod_catedratico
    FROM seccion s
    JOIN parametros par
      ON par.anio_busqueda = s.anio
     AND par.ciclo_busqueda = s.ciclo
    JOIN pensum pe
      ON pe.curso_cod_curso = s.curso_cod_curso
    JOIN plan p
      ON p.carrera_cod_carrera = pe.plan_carrera_cod_carrera
     AND p.cod_plan = pe.plan_cod_plan
    JOIN carrera c
      ON c.cod_carrera = p.carrera_cod_carrera
    WHERE UPPER(c.nombre_carrera) LIKE '%SISTEMAS%'
      AND (
            par.anio_busqueda > p.anio_inicio
         OR (par.anio_busqueda = p.anio_inicio
             AND par.num_ciclo_busqueda >= TO_NUMBER(REGEXP_SUBSTR(p.ciclo_inicio, '[0-9]+')))
          )
      AND (
            par.anio_busqueda < p.anio_fin
         OR (par.anio_busqueda = p.anio_fin
             AND par.num_ciclo_busqueda <= TO_NUMBER(REGEXP_SUBSTR(p.ciclo_fin, '[0-9]+')))
          )
)
SELECT DISTINCT
       e.nombre_estudiante
FROM asignacion a
JOIN seccion s
  ON s.cod_seccion = a.seccion_cod_seccion
 AND s.anio = a.seccion_anio
 AND s.ciclo = a.seccion_ciclo
 AND s.curso_cod_curso = a.seccion_cod_curso
JOIN catedraticos_objetivo co
  ON co.cod_catedratico = s.catedratico_cod_catedratico
JOIN estudiante e
  ON e.carnet = a.estudiante_carnet
JOIN inscripcion i
  ON i.estudiante_carnet = a.estudiante_carnet
JOIN pensum pe
  ON pe.plan_carrera_cod_carrera = i.carrera_cod_carrera
 AND pe.curso_cod_curso = a.seccion_cod_curso
WHERE a.nota >= pe.nota_aprobacion
  AND a.zona >= pe.zona_minima
ORDER BY e.nombre_estudiante;