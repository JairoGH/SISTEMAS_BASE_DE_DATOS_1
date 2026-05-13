WITH parametros AS (
    SELECT 1001 AS carnet_objetivo
    FROM dual
),

mejor_intento AS (
    SELECT a.estudiante_carnet,
           a.seccion_cod_curso,
           a.zona,
           a.nota,
           ROW_NUMBER() OVER (
               PARTITION BY a.estudiante_carnet, a.seccion_cod_curso
               ORDER BY a.nota DESC, a.zona DESC
           ) AS rn
    FROM asignacion a
),

aprobados AS (
    SELECT mi.estudiante_carnet        AS carnet,
           pe.plan_carrera_cod_carrera AS cod_carrera,
           pe.plan_cod_plan            AS cod_plan,
           pe.curso_cod_curso          AS cod_curso,
           pe.obligatorio,
           pe.num_creditos,
           mi.nota
    FROM mejor_intento mi
    JOIN inscripcion i
      ON i.estudiante_carnet = mi.estudiante_carnet
    JOIN pensum pe
      ON pe.plan_carrera_cod_carrera = i.carrera_cod_carrera
     AND pe.curso_cod_curso = mi.seccion_cod_curso
    WHERE mi.rn = 1
      AND mi.zona >= pe.zona_minima
      AND mi.nota >= pe.nota_aprobacion
),

resumen_cierre AS (
    SELECT ap.carnet,
           ap.cod_carrera,
           ap.cod_plan,
           SUM(ap.num_creditos) AS creditos_ganados,
           SUM(CASE WHEN ap.obligatorio = 1 THEN 1 ELSE 0 END) AS obligatorios_aprobados
    FROM aprobados ap
    GROUP BY ap.carnet, ap.cod_carrera, ap.cod_plan
),

obligatorios_plan AS (
    SELECT p.plan_carrera_cod_carrera AS cod_carrera,
           p.plan_cod_plan            AS cod_plan,
           SUM(CASE WHEN p.obligatorio = 1 THEN 1 ELSE 0 END) AS total_obligatorios
    FROM pensum p
    GROUP BY p.plan_carrera_cod_carrera, p.plan_cod_plan
),

carreras_cerradas AS (
    SELECT r.carnet,
           r.cod_carrera,
           r.cod_plan
    FROM resumen_cierre r
    JOIN obligatorios_plan o
      ON o.cod_carrera = r.cod_carrera
     AND o.cod_plan = r.cod_plan
    JOIN plan pl
      ON pl.carrera_cod_carrera = r.cod_carrera
     AND pl.cod_plan = r.cod_plan
    JOIN parametros pa
      ON pa.carnet_objetivo = r.carnet
    WHERE r.obligatorios_aprobados = o.total_obligatorios
      AND r.creditos_ganados >= pl.creditos_cierre
),

cursos_objetivo_llevados AS (
    SELECT DISTINCT
           cc.cod_carrera,
           cc.cod_plan,
           a.seccion_cod_curso AS cod_curso
    FROM carreras_cerradas cc
    JOIN asignacion a
      ON a.estudiante_carnet = cc.carnet
    JOIN pensum pe
      ON pe.plan_carrera_cod_carrera = cc.cod_carrera
     AND pe.plan_cod_plan = cc.cod_plan
     AND pe.curso_cod_curso = a.seccion_cod_curso
),

candidatos AS (
    SELECT DISTINCT
           a.estudiante_carnet AS carnet
    FROM asignacion a
    JOIN cursos_objetivo_llevados co
      ON co.cod_curso = a.seccion_cod_curso
    JOIN parametros p
      ON a.estudiante_carnet <> p.carnet_objetivo
)

SELECT e.nombre_estudiante
FROM candidatos c
JOIN estudiante e
  ON e.carnet = c.carnet
WHERE NOT EXISTS (
    SELECT 1
    FROM cursos_objetivo_llevados co
    WHERE NOT EXISTS (
        SELECT 1
        FROM asignacion a2
        WHERE a2.estudiante_carnet = c.carnet
          AND a2.seccion_cod_curso = co.cod_curso
    )
)
ORDER BY e.nombre_estudiante;