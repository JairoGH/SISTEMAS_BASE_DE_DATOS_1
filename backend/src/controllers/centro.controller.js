const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getCentros = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
         ID_CENTRO,
         NOMBRE
       FROM CENTRO
       ORDER BY ID_CENTRO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getCentros:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los centros",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getCentroById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
         ID_CENTRO,
         NOMBRE
       FROM CENTRO
       WHERE ID_CENTRO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Centro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getCentroById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el centro",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const createCentro = async (req, res) => {
  let connection;

  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El campo nombre es obligatorio",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO CENTRO (NOMBRE)
       VALUES (:nombre)
       RETURNING ID_CENTRO INTO :id_centro`,
      {
        nombre,
        id_centro: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Centro creado correctamente",
      data: {
        id_centro: result.outBinds.id_centro[0],
        nombre,
      },
    });
  } catch (error) {
    console.error("Error en createCentro:", error);

    return res.status(500).json({
      success: false,
      message: "Error al crear el centro",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const updateCentro = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El campo nombre es obligatorio",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE CENTRO
       SET NOMBRE = :nombre
       WHERE ID_CENTRO = :id`,
      { id, nombre },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Centro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Centro actualizado correctamente",
      data: {
        id_centro: Number(id),
        nombre,
      },
    });
  } catch (error) {
    console.error("Error en updateCentro:", error);

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el centro",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const deleteCentro = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM CENTRO
       WHERE ID_CENTRO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Centro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Centro eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteCentro:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el centro",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  getCentros,
  getCentroById,
  createCentro,
  updateCentro,
  deleteCentro,
};
