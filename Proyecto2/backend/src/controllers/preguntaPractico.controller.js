const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getPreguntasPractico = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_PREGUNTA_PRACTICO,
         PREGUNTA_TEXTO,
         PUNTEO
       FROM PREGUNTAS_PRACTICO
       ORDER BY ID_PREGUNTA_PRACTICO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getPreguntasPractico:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las preguntas prácticas",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getPreguntaPracticoById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_PREGUNTA_PRACTICO,
         PREGUNTA_TEXTO,
         PUNTEO
       FROM PREGUNTAS_PRACTICO
       WHERE ID_PREGUNTA_PRACTICO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta práctica no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getPreguntaPracticoById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la pregunta práctica",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createPreguntaPractico = async (req, res) => {
  let connection;

  try {
    const { pregunta_texto, punteo } = req.body;

    if (!pregunta_texto || punteo === undefined || punteo === null) {
      return res.status(400).json({
        success: false,
        message: "Los campos pregunta_texto y punteo son obligatorios",
      });
    }

    if (isNaN(Number(punteo)) || Number(punteo) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El punteo debe ser un número mayor a 0",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO PREGUNTAS_PRACTICO (
         PREGUNTA_TEXTO,
         PUNTEO
       )
       VALUES (
         :pregunta_texto,
         :punteo
       )
       RETURNING ID_PREGUNTA_PRACTICO INTO :id_pregunta_practico`,
      {
        pregunta_texto,
        punteo,
        id_pregunta_practico: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Pregunta práctica creada correctamente",
      data: {
        id_pregunta_practico: result.outBinds.id_pregunta_practico[0],
        pregunta_texto,
        punteo,
      },
    });
  } catch (error) {
    console.error("Error en createPreguntaPractico:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "El punteo debe cumplir la restricción CHECK: mayor a 0",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la pregunta práctica",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updatePreguntaPractico = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { pregunta_texto, punteo } = req.body;

    if (!pregunta_texto || punteo === undefined || punteo === null) {
      return res.status(400).json({
        success: false,
        message: "Los campos pregunta_texto y punteo son obligatorios",
      });
    }

    if (isNaN(Number(punteo)) || Number(punteo) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El punteo debe ser un número mayor a 0",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE PREGUNTAS_PRACTICO
       SET PREGUNTA_TEXTO = :pregunta_texto,
           PUNTEO = :punteo
       WHERE ID_PREGUNTA_PRACTICO = :id`,
      {
        id,
        pregunta_texto,
        punteo,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta práctica no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pregunta práctica actualizada correctamente",
      data: {
        id_pregunta_practico: Number(id),
        pregunta_texto,
        punteo,
      },
    });
  } catch (error) {
    console.error("Error en updatePreguntaPractico:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "El punteo debe cumplir la restricción CHECK: mayor a 0",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar la pregunta práctica porque tiene respuestas prácticas relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la pregunta práctica",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deletePreguntaPractico = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM PREGUNTAS_PRACTICO
       WHERE ID_PREGUNTA_PRACTICO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Pregunta práctica no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pregunta práctica eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deletePreguntaPractico:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar la pregunta práctica porque tiene respuestas prácticas relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la pregunta práctica",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getPreguntasPractico,
  getPreguntaPracticoById,
  createPreguntaPractico,
  updatePreguntaPractico,
  deletePreguntaPractico,
};