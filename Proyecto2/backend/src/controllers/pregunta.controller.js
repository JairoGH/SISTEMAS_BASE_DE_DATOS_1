const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const respuestasValidas = ["A", "B", "C", "D"];

const normalizarRespuesta = (respuesta) => {
  return String(respuesta || "").trim().toUpperCase();
};

const getPreguntas = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_PREGUNTA,
         PREGUNTA_TEXTO,
         RESPUESTA_A,
         RESPUESTA_B,
         RESPUESTA_C,
         RESPUESTA_D,
         RESPUESTA_CORRECTA
       FROM PREGUNTAS
       ORDER BY ID_PREGUNTA`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getPreguntas:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las preguntas",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getPreguntaById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_PREGUNTA,
         PREGUNTA_TEXTO,
         RESPUESTA_A,
         RESPUESTA_B,
         RESPUESTA_C,
         RESPUESTA_D,
         RESPUESTA_CORRECTA
       FROM PREGUNTAS
       WHERE ID_PREGUNTA = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getPreguntaById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la pregunta",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createPregunta = async (req, res) => {
  let connection;

  try {
    const {
      pregunta_texto,
      respuesta_a,
      respuesta_b,
      respuesta_c,
      respuesta_d,
      respuesta_correcta,
    } = req.body;

    const respuestaCorrectaNormalizada = normalizarRespuesta(respuesta_correcta);

    if (
      !pregunta_texto ||
      !respuesta_a ||
      !respuesta_b ||
      !respuesta_c ||
      !respuesta_d ||
      !respuesta_correcta
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d y respuesta_correcta son obligatorios",
      });
    }

    if (!respuestasValidas.includes(respuestaCorrectaNormalizada)) {
      return res.status(400).json({
        success: false,
        message: "La respuesta correcta debe ser A, B, C o D",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO PREGUNTAS (
         PREGUNTA_TEXTO,
         RESPUESTA_A,
         RESPUESTA_B,
         RESPUESTA_C,
         RESPUESTA_D,
         RESPUESTA_CORRECTA
       )
       VALUES (
         :pregunta_texto,
         :respuesta_a,
         :respuesta_b,
         :respuesta_c,
         :respuesta_d,
         :respuesta_correcta
       )
       RETURNING ID_PREGUNTA INTO :id_pregunta`,
      {
        pregunta_texto,
        respuesta_a,
        respuesta_b,
        respuesta_c,
        respuesta_d,
        respuesta_correcta: respuestaCorrectaNormalizada,
        id_pregunta: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Pregunta creada correctamente",
      data: {
        id_pregunta: result.outBinds.id_pregunta[0],
        pregunta_texto,
        respuesta_a,
        respuesta_b,
        respuesta_c,
        respuesta_d,
        respuesta_correcta: respuestaCorrectaNormalizada,
      },
    });
  } catch (error) {
    console.error("Error en createPregunta:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La respuesta correcta debe cumplir la restricción CHECK: A, B, C o D",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la pregunta",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updatePregunta = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    const {
      pregunta_texto,
      respuesta_a,
      respuesta_b,
      respuesta_c,
      respuesta_d,
      respuesta_correcta,
    } = req.body;

    const respuestaCorrectaNormalizada = normalizarRespuesta(respuesta_correcta);

    if (
      !pregunta_texto ||
      !respuesta_a ||
      !respuesta_b ||
      !respuesta_c ||
      !respuesta_d ||
      !respuesta_correcta
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d y respuesta_correcta son obligatorios",
      });
    }

    if (!respuestasValidas.includes(respuestaCorrectaNormalizada)) {
      return res.status(400).json({
        success: false,
        message: "La respuesta correcta debe ser A, B, C o D",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE PREGUNTAS
       SET PREGUNTA_TEXTO = :pregunta_texto,
           RESPUESTA_A = :respuesta_a,
           RESPUESTA_B = :respuesta_b,
           RESPUESTA_C = :respuesta_c,
           RESPUESTA_D = :respuesta_d,
           RESPUESTA_CORRECTA = :respuesta_correcta
       WHERE ID_PREGUNTA = :id`,
      {
        id,
        pregunta_texto,
        respuesta_a,
        respuesta_b,
        respuesta_c,
        respuesta_d,
        respuesta_correcta: respuestaCorrectaNormalizada,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pregunta actualizada correctamente",
      data: {
        id_pregunta: Number(id),
        pregunta_texto,
        respuesta_a,
        respuesta_b,
        respuesta_c,
        respuesta_d,
        respuesta_correcta: respuestaCorrectaNormalizada,
      },
    });
  } catch (error) {
    console.error("Error en updatePregunta:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La respuesta correcta debe cumplir la restricción CHECK: A, B, C o D",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la pregunta",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deletePregunta = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM PREGUNTAS
       WHERE ID_PREGUNTA = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pregunta eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deletePregunta:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar la pregunta porque tiene respuestas de usuarios relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la pregunta",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getPreguntas,
  getPreguntaById,
  createPregunta,
  updatePregunta,
  deletePregunta,
};