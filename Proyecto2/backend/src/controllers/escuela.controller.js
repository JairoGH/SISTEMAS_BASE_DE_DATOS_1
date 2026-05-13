const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getEscuelas = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_ESCUELA,
         NOMBRE,
         DIRECCION,
         ACUERDO
       FROM ESCUELA
       ORDER BY ID_ESCUELA`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getEscuelas:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las escuelas",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getEscuelaById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_ESCUELA,
         NOMBRE,
         DIRECCION,
         ACUERDO
       FROM ESCUELA
       WHERE ID_ESCUELA = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Escuela no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getEscuelaById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la escuela",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const createEscuela = async (req, res) => {
  let connection;

  try {
    const { nombre, direccion, acuerdo } = req.body;

    if (!nombre || !direccion || !acuerdo) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre, direccion y acuerdo son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO ESCUELA (
         NOMBRE,
         DIRECCION,
         ACUERDO
       )
       VALUES (
         :nombre,
         :direccion,
         :acuerdo
       )
       RETURNING ID_ESCUELA INTO :id_escuela`,
      {
        nombre,
        direccion,
        acuerdo,
        id_escuela: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Escuela creada correctamente",
      data: {
        id_escuela: result.outBinds.id_escuela[0],
        nombre,
        direccion,
        acuerdo,
      },
    });
  } catch (error) {
    console.error("Error en createEscuela:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una escuela con ese acuerdo",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la escuela",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const updateEscuela = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { nombre, direccion, acuerdo } = req.body;

    if (!nombre || !direccion || !acuerdo) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre, direccion y acuerdo son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE ESCUELA
       SET NOMBRE = :nombre,
           DIRECCION = :direccion,
           ACUERDO = :acuerdo
       WHERE ID_ESCUELA = :id`,
      {
        id,
        nombre,
        direccion,
        acuerdo,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Escuela no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Escuela actualizada correctamente",
      data: {
        id_escuela: Number(id),
        nombre,
        direccion,
        acuerdo,
      },
    });
  } catch (error) {
    console.error("Error en updateEscuela:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una escuela con ese acuerdo",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la escuela",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const deleteEscuela = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM ESCUELA
       WHERE ID_ESCUELA = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Escuela no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Escuela eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deleteEscuela:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar la escuela porque tiene ubicaciones relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la escuela",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  getEscuelas,
  getEscuelaById,
  createEscuela,
  updateEscuela,
  deleteEscuela,
};