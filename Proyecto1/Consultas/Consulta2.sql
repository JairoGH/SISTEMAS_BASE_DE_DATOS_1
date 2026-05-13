WITH aprobados AS (
    SELECT
        a.ESTUDIANTE_carnet            AS carnet,
        i.CARRERA_cod_carrera          AS cod_carrera,
        p.PLAN_cod_plan                AS cod_plan,
        p.CURSO_cod_curso              AS cod_curso,
        p.obligatorio                  AS obligatorio,
        p.num_creditos                 AS num_creditos,
        a.nota                         AS nota
    FROM ASIGNACION a
    JOIN INSCRIPCION i
        ON i.ESTUDIANTE_carnet = a.ESTUDIANTE_carnet
    JOIN PENSUM p
        ON p.PLAN_CARRERA_cod_carrera = i.CARRERA_cod_carrera
       AND p.CURSO_cod_curso = a.SECCION_cod_curso
    WHERE a.zona >= p.zona_minima
      AND a.nota >= p.nota_aprobacion
),
resumen_cierre AS (
    SELECT
        ap.carnet,
        ap.cod_carrera,
        ap.cod_plan,
        ROUND(AVG(ap.nota), 2) AS promedio,
        SUM(ap.num_creditos)   AS creditos_ganados,
        COUNT(CASE WHEN ap.obligatorio = 1 THEN 1 END) AS obligatorios_aprobados
    FROM aprobados ap
    GROUP BY ap.carnet, ap.cod_carrera, ap.cod_plan
),
obligatorios_plan AS (
    SELECT
        p.PLAN_CARRERA_cod_carrera AS cod_carrera,
        p.PLAN_cod_plan            AS cod_plan,
        COUNT(*)                   AS total_obligatorios
    FROM PENSUM p
    WHERE p.obligatorio = 1
    GROUP BY p.PLAN_CARRERA_cod_carrera, p.PLAN_cod_plan
)
SELECT
    e.nombre_estudiante,
    c.nombre_carrera,
    r.promedio,
    r.creditos_ganados
FROM resumen_cierre r
JOIN obligatorios_plan o
    ON o.cod_carrera = r.cod_carrera
   AND o.cod_plan    = r.cod_plan
JOIN PLAN pl
    ON pl.CARRERA_cod_carrera = r.cod_carrera
   AND pl.cod_plan            = r.cod_plan
JOIN ESTUDIANTE e
    ON e.carnet = r.carnet
JOIN CARRERA c
    ON c.cod_carrera = r.cod_carrera
WHERE r.obligatorios_aprobados = o.total_obligatorios
  AND r.creditos_ganados >= pl.creditos_cierre
ORDER BY e.nombre_estudiante, c.nombre_carrera;