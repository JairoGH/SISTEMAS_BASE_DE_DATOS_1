const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const NOTA_MINIMA_APROBACION = 70;

const executeQuery = async (sql, binds = {}) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        return result.rows;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

const BASE_RESULTADOS_SQL = `
WITH teorico AS (
    SELECT
        e.id_examen,
        COUNT(p.id_pregunta) AS total_preguntas_teoricas,
        SUM(
            CASE
                WHEN UPPER(TRIM(NVL(ru.respuesta, ''))) = UPPER(TRIM(p.respuesta_correcta))
                THEN 1
                ELSE 0
            END
        ) AS respuestas_correctas,
        ROUND(
            SUM(
                CASE
                    WHEN UPPER(TRIM(NVL(ru.respuesta, ''))) = UPPER(TRIM(p.respuesta_correcta))
                    THEN 1
                    ELSE 0
                END
            ) * 100 / NULLIF(COUNT(p.id_pregunta), 0),
            2
        ) AS nota_teorica
    FROM examen e
    CROSS JOIN preguntas p
    LEFT JOIN respuesta_usuario ru
        ON ru.examen_id_examen = e.id_examen
       AND ru.preguntas_id_pregunta = p.id_pregunta
    GROUP BY e.id_examen
),
practico AS (
    SELECT
        e.id_examen,
        SUM(NVL(rpu.nota, 0)) AS puntos_obtenidos,
        SUM(pp.punteo) AS puntos_posibles,
        ROUND(
            SUM(NVL(rpu.nota, 0)) * 100 / NULLIF(SUM(pp.punteo), 0),
            2
        ) AS nota_practica
    FROM examen e
    CROSS JOIN preguntas_practico pp
    LEFT JOIN respuesta_practico_usuario rpu
        ON rpu.examen_id_examen = e.id_examen
       AND rpu.preguntas_practico_id_pregunta_practico = pp.id_pregunta_practico
    GROUP BY e.id_examen
),
resultados AS (
    SELECT
        e.id_examen,
        e.correlativo_id_correlativo,
        co.no_examen,
        r.id_registro,
        r.nombre_completo,
        r.tipo_licencia,
        esc.id_escuela,
        esc.nombre AS escuela,
        c.id_centro,
        c.nombre AS centro,
        NVL(t.nota_teorica, 0) AS nota_teorica,
        NVL(p.nota_practica, 0) AS nota_practica,
        ROUND(
            (NVL(t.nota_teorica, 0) + NVL(p.nota_practica, 0)) / 2,
            2
        ) AS resultado_final
    FROM examen e
    INNER JOIN registro r
        ON r.id_registro = e.registro_id_registro
       AND r.ubicacion_escuela_id_escuela = e.registro_ubicacion_escuela_id_escuela
       AND r.ubicacion_centro_id_centro = e.registro_ubicacion_centro_id_centro
       AND r.municipio_id_municipio = e.registro_municipio_id_municipio
       AND r.municipio_departamento_id_departamento = e.registro_municipio_departamento_id_departamento
    INNER JOIN escuela esc
        ON esc.id_escuela = r.ubicacion_escuela_id_escuela
    INNER JOIN centro c
        ON c.id_centro = r.ubicacion_centro_id_centro
    INNER JOIN correlativo co
        ON co.id_correlativo = e.correlativo_id_correlativo
    LEFT JOIN teorico t
        ON t.id_examen = e.id_examen
    LEFT JOIN practico p
        ON p.id_examen = e.id_examen
)
`;

const getEstadisticasEvaluaciones = async (req, res) => {
    try {
        const sql = `
    ${BASE_RESULTADOS_SQL}
    SELECT
        id_centro,
        centro,
        id_escuela,
        escuela,
        COUNT(id_examen) AS total_examenes,
        ROUND(AVG(nota_teorica), 2) AS promedio_examen_teorico,
        ROUND(AVG(nota_practica), 2) AS promedio_examen_practico,
        ROUND(AVG(resultado_final), 2) AS promedio_resultado_final,
        SUM(
            CASE
                WHEN resultado_final >= :notaMinima
                THEN 1
                ELSE 0
            END
        ) AS aprobados,
        SUM(
            CASE
                WHEN resultado_final < :notaMinima
                THEN 1
                ELSE 0
            END
        ) AS reprobados,
        ROUND(
            SUM(
                CASE
                    WHEN resultado_final >= :notaMinima
                    THEN 1
                    ELSE 0
                END
            ) * 100 / COUNT(id_examen),
            2
        ) AS porcentaje_aprobacion
    FROM resultados
    GROUP BY
        id_centro,
        centro,
        id_escuela,
        escuela
    ORDER BY
        centro,
        escuela
`;

        const data = await executeQuery(sql, {
            notaMinima: NOTA_MINIMA_APROBACION,
        });

        res.json({
            success: true,
            message: "Estadísticas de evaluaciones por centro y escuela",
            criterio_aprobacion: `Resultado final >= ${NOTA_MINIMA_APROBACION}`,
            data,
        });
    } catch (error) {
        console.error("Error en getEstadisticasEvaluaciones:", error);

        res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de evaluaciones",
            error: error.message,
        });
    }
};

const getRankingEvaluados = async (req, res) => {
    try {
        const limite = Number(req.query.limit || 10);

        const limiteSeguro =
            Number.isInteger(limite) && limite > 0 && limite <= 100
                ? limite
                : 10;

        const estado = req.query.estado
            ? String(req.query.estado).toUpperCase().trim()
            : null;

        let filtroEstado = "";

        if (estado === "APROBADO" || estado === "REPROBADO") {
            filtroEstado = "WHERE estado = :estado";
        }

        const sql = `
            ${BASE_RESULTADOS_SQL}
            SELECT *
            FROM (
                SELECT
                    ranking.*
                FROM (
                    SELECT
                        DENSE_RANK() OVER (
                            ORDER BY
                                resultado_final DESC,
                                nota_teorica DESC,
                                nota_practica DESC
                        ) AS posicion,
                        id_examen,
                        no_examen,
                        id_registro,
                        nombre_completo,
                        tipo_licencia,
                        centro,
                        escuela,
                        nota_teorica,
                        nota_practica,
                        resultado_final,
                        CASE
                            WHEN resultado_final >= :notaMinima
                            THEN 'APROBADO'
                            ELSE 'REPROBADO'
                        END AS estado
                    FROM resultados
                ) ranking
                ${filtroEstado}
            )
            WHERE posicion <= :limite
            ORDER BY posicion, resultado_final DESC, nombre_completo ASC
        `;

        const binds = {
            notaMinima: NOTA_MINIMA_APROBACION,
            limite: limiteSeguro,
        };

        if (estado === "APROBADO" || estado === "REPROBADO") {
            binds.estado = estado;
        }

        const data = await executeQuery(sql, binds);

        res.json({
            success: true,
            message: "Ranking de evaluados por resultado final",
            criterio_aprobacion: `Resultado final >= ${NOTA_MINIMA_APROBACION}`,
            filtros: {
                limit: limiteSeguro,
                estado: estado || "TODOS",
            },
            data,
        });
    } catch (error) {
        console.error("Error en getRankingEvaluados:", error);

        res.status(500).json({
            success: false,
            message: "Error al obtener ranking de evaluados",
            error: error.message,
        });
    }
};

const getPreguntaMenorAciertos = async (req, res) => {
    try {
        const sql = `
            WITH dificultad AS (
                SELECT
                    p.id_pregunta,
                    p.pregunta_texto,
                    p.respuesta_correcta,
                    COUNT(ru.examen_id_examen) AS total_respuestas,
                    SUM(
                        CASE
                            WHEN UPPER(TRIM(NVL(ru.respuesta, ''))) = UPPER(TRIM(p.respuesta_correcta))
                            THEN 1
                            ELSE 0
                        END
                    ) AS total_aciertos,
                    SUM(
                        CASE
                            WHEN ru.examen_id_examen IS NOT NULL
                             AND UPPER(TRIM(NVL(ru.respuesta, ''))) <> UPPER(TRIM(p.respuesta_correcta))
                            THEN 1
                            ELSE 0
                        END
                    ) AS total_errores,
                    CASE
                        WHEN COUNT(ru.examen_id_examen) = 0 THEN 0
                        ELSE ROUND(
                            SUM(
                                CASE
                                    WHEN UPPER(TRIM(NVL(ru.respuesta, ''))) = UPPER(TRIM(p.respuesta_correcta))
                                    THEN 1
                                    ELSE 0
                                END
                            ) * 100 / COUNT(ru.examen_id_examen),
                            2
                        )
                    END AS porcentaje_aciertos
                FROM preguntas p
                LEFT JOIN respuesta_usuario ru
                    ON ru.preguntas_id_pregunta = p.id_pregunta
                GROUP BY
                    p.id_pregunta,
                    p.pregunta_texto,
                    p.respuesta_correcta
            ),
            ranking_dificultad AS (
                SELECT
                    d.*,
                    DENSE_RANK() OVER (
                        ORDER BY
                            d.porcentaje_aciertos ASC
                    ) AS posicion_dificultad
                FROM dificultad d
                WHERE d.total_respuestas > 0
            )
            SELECT
                id_pregunta,
                pregunta_texto,
                respuesta_correcta,
                total_respuestas,
                total_aciertos,
                total_errores,
                porcentaje_aciertos
            FROM ranking_dificultad
            WHERE posicion_dificultad = 1
            ORDER BY id_pregunta
        `;

        const data = await executeQuery(sql);

        res.json({
            success: true,
            message: "Pregunta o preguntas con menor porcentaje de aciertos",
            total_preguntas_encontradas: data.length,
            data,
        });
    } catch (error) {
        console.error("Error en getPreguntaMenorAciertos:", error);

        res.status(500).json({
            success: false,
            message: "Error al obtener la pregunta con menor aciertos",
            error: error.message,
        });
    }
};

module.exports = {
    getEstadisticasEvaluaciones,
    getRankingEvaluados,
    getPreguntaMenorAciertos,
};