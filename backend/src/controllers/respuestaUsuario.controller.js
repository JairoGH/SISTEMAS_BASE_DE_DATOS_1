const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const respuestasValidas = ["A", "B", "C", "D"];

const normalizarRespuesta = (respuesta) => {
  return String(respuesta || "").trim().toUpperCase();
};

const verificarPregunta = async (connection, idPregunta) => {
  const result = await connection.execute(
    `SELECT ID_PREGUNTA
     FROM PREGUNTAS
     WHERE ID_PREGUNTA = :idPregunta`,
    { idPregunta },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.length > 0;
};

const verificarExamen = async (connection, idExamen) => {
  const result = await connection.execute(
    `SELECT ID_EXAMEN
     FROM EXAMEN
     WHERE ID_EXAMEN = :idExamen`,
    { idExamen },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.length > 0;
};

const getRespuestasUsuario = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ru.PREGUNTAS_ID_PREGUNTA,
         p.PREGUNTA_TEXTO,
         p.RESPUESTA_CORRECTA,

         ru.EXAMEN_ID_EXAMEN,
         r.NOMBRE_COMPLETO,
         co.NO_EXAMEN,

         ru.RESPUESTA,
         CASE
           WHEN TRIM(ru.RESPUESTA) = TRIM(p.RESPUESTA_CORRECTA) THEN 'SI'
           ELSE 'NO'
         END AS ES_CORRECTA

       FROM RESPUESTA_USUARIO ru

       JOIN PREGUNTAS p
         ON ru.PREGUNTAS_ID_PREGUNTA = p.ID_PREGUNTA

       JOIN EXAMEN ex
         ON ru.EXAMEN_ID_EXAMEN = ex.ID_EXAMEN

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       ORDER BY ru.EXAMEN_ID_EXAMEN, ru.PREGUNTAS_ID_PREGUNTA`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getRespuestasUsuario:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las respuestas de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getRespuestaUsuarioByIds = async (req, res) => {
  let connection;

  try {
    const { idPregunta, idExamen } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ru.PREGUNTAS_ID_PREGUNTA,
         p.PREGUNTA_TEXTO,
         p.RESPUESTA_CORRECTA,

         ru.EXAMEN_ID_EXAMEN,
         r.NOMBRE_COMPLETO,
         co.NO_EXAMEN,

         ru.RESPUESTA,
         CASE
           WHEN TRIM(ru.RESPUESTA) = TRIM(p.RESPUESTA_CORRECTA) THEN 'SI'
           ELSE 'NO'
         END AS ES_CORRECTA

       FROM RESPUESTA_USUARIO ru

       JOIN PREGUNTAS p
         ON ru.PREGUNTAS_ID_PREGUNTA = p.ID_PREGUNTA

       JOIN EXAMEN ex
         ON ru.EXAMEN_ID_EXAMEN = ex.ID_EXAMEN

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       WHERE ru.PREGUNTAS_ID_PREGUNTA = :idPregunta
         AND ru.EXAMEN_ID_EXAMEN = :idExamen`,
      { idPregunta, idExamen },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getRespuestaUsuarioByIds:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la respuesta de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createRespuestaUsuario = async (req, res) => {
  let connection;

  try {
    const { preguntas_id_pregunta, examen_id_examen, respuesta } = req.body;

    const respuestaNormalizada = normalizarRespuesta(respuesta);

    if (!preguntas_id_pregunta || !examen_id_examen || !respuesta) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos preguntas_id_pregunta, examen_id_examen y respuesta son obligatorios",
      });
    }

    if (!respuestasValidas.includes(respuestaNormalizada)) {
      return res.status(400).json({
        success: false,
        message: "La respuesta debe ser A, B, C o D",
      });
    }

    connection = await getConnection();

    const preguntaExiste = await verificarPregunta(
      connection,
      preguntas_id_pregunta
    );

    if (!preguntaExiste) {
      return res.status(404).json({
        success: false,
        message: "No existe la pregunta indicada",
      });
    }

    const examenExiste = await verificarExamen(connection, examen_id_examen);

    if (!examenExiste) {
      return res.status(404).json({
        success: false,
        message: "No existe el examen indicado",
      });
    }

    await connection.execute(
      `INSERT INTO RESPUESTA_USUARIO (
         PREGUNTAS_ID_PREGUNTA,
         EXAMEN_ID_EXAMEN,
         RESPUESTA
       )
       VALUES (
         :preguntas_id_pregunta,
         :examen_id_examen,
         :respuesta
       )`,
      {
        preguntas_id_pregunta,
        examen_id_examen,
        respuesta: respuestaNormalizada,
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Respuesta de usuario creada correctamente",
      data: {
        preguntas_id_pregunta,
        examen_id_examen,
        respuesta: respuestaNormalizada,
      },
    });
  } catch (error) {
    console.error("Error en createRespuestaUsuario:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una respuesta para esa pregunta en ese examen",
        error: error.message,
      });
    }

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear la respuesta porque la pregunta o el examen no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La respuesta debe cumplir la restricción CHECK: A, B, C o D",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la respuesta de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updateRespuestaUsuario = async (req, res) => {
  let connection;

  try {
    const { idPregunta, idExamen } = req.params;
    const { respuesta } = req.body;

    const respuestaNormalizada = normalizarRespuesta(respuesta);

    if (!respuesta) {
      return res.status(400).json({
        success: false,
        message: "El campo respuesta es obligatorio",
      });
    }

    if (!respuestasValidas.includes(respuestaNormalizada)) {
      return res.status(400).json({
        success: false,
        message: "La respuesta debe ser A, B, C o D",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE RESPUESTA_USUARIO
       SET RESPUESTA = :respuesta
       WHERE PREGUNTAS_ID_PREGUNTA = :idPregunta
         AND EXAMEN_ID_EXAMEN = :idExamen`,
      {
        idPregunta,
        idExamen,
        respuesta: respuestaNormalizada,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta de usuario actualizada correctamente",
      data: {
        preguntas_id_pregunta: Number(idPregunta),
        examen_id_examen: Number(idExamen),
        respuesta: respuestaNormalizada,
      },
    });
  } catch (error) {
    console.error("Error en updateRespuestaUsuario:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La respuesta debe cumplir la restricción CHECK: A, B, C o D",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la respuesta de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deleteRespuestaUsuario = async (req, res) => {
  let connection;

  try {
    const { idPregunta, idExamen } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM RESPUESTA_USUARIO
       WHERE PREGUNTAS_ID_PREGUNTA = :idPregunta
         AND EXAMEN_ID_EXAMEN = :idExamen`,
      { idPregunta, idExamen },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta de usuario eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deleteRespuestaUsuario:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la respuesta de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getRespuestasUsuario,
  getRespuestaUsuarioByIds,
  createRespuestaUsuario,
  updateRespuestaUsuario,
  deleteRespuestaUsuario,
};