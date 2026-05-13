WITH plan_sistemas AS (
		SELECT p.carrera_cod_carrera AS cod_carrera,
					 p.cod_plan,
					 p.creditos_cierre
		FROM plan p
		JOIN carrera c
			ON c.cod_carrera = p.carrera_cod_carrera
		WHERE UPPER(c.nombre_carrera) = 'INGENIERIA EN CIENCIAS Y SISTEMAS'
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
				estudiantes_sistemas AS (
				    SELECT DISTINCT i.estudiante_carnet,
					    i.carrera_cod_carrera
				    FROM inscripcion i
				    JOIN plan_sistemas ps
				      ON ps.cod_carrera = i.carrera_cod_carrera
				),
cursos_aprobados AS (
		SELECT mi.estudiante_carnet,
					 pe.plan_carrera_cod_carrera AS cod_carrera,
					 pe.plan_cod_plan AS cod_plan,
					 pe.curso_cod_curso,
					 pe.obligatorio,
					 pe.num_creditos,
					 mi.nota
		FROM mejor_intento mi
		JOIN estudiantes_sistemas es
			ON es.estudiante_carnet = mi.estudiante_carnet
		JOIN plan_sistemas ps
			ON ps.cod_carrera = es.carrera_cod_carrera
		JOIN pensum pe
			ON pe.plan_carrera_cod_carrera = ps.cod_carrera
		 AND pe.plan_cod_plan = ps.cod_plan
		 AND pe.curso_cod_curso = mi.seccion_cod_curso
		WHERE mi.rn = 1
			AND mi.nota >= pe.nota_aprobacion
			AND mi.zona >= pe.zona_minima
),
resumen AS (
		SELECT ca.estudiante_carnet,
					 ca.cod_carrera,
					 ca.cod_plan,
					 SUM(ca.num_creditos) AS creditos_ganados,
					 ROUND(AVG(ca.nota), 2) AS promedio,
					 SUM(CASE WHEN ca.obligatorio = 1 THEN 1 ELSE 0 END) AS obligatorios_aprobados
		FROM cursos_aprobados ca
		GROUP BY ca.estudiante_carnet, ca.cod_carrera, ca.cod_plan
),
obligatorios_plan AS (
		SELECT pe.plan_carrera_cod_carrera AS cod_carrera,
					 pe.plan_cod_plan AS cod_plan,
					 SUM(CASE WHEN pe.obligatorio = 1 THEN 1 ELSE 0 END) AS total_obligatorios
		FROM pensum pe
		GROUP BY pe.plan_carrera_cod_carrera, pe.plan_cod_plan
)
SELECT e.nombre_estudiante,
			 r.promedio,
			 r.creditos_ganados
FROM resumen r
JOIN estudiante e
	ON e.carnet = r.estudiante_carnet
JOIN plan_sistemas ps
	ON ps.cod_carrera = r.cod_carrera
 AND ps.cod_plan = r.cod_plan
JOIN obligatorios_plan op
	ON op.cod_carrera = r.cod_carrera
 AND op.cod_plan = r.cod_plan
WHERE r.creditos_ganados >= ps.creditos_cierre
	AND r.obligatorios_aprobados = op.total_obligatorios
ORDER BY e.nombre_estudiante;
