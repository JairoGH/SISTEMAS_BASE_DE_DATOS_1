const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getUbicaciones = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         u.ESCUELA_ID_ESCUELA,
         e.NOMBRE AS ESCUELA,
         u.CENTRO_ID_CENTRO,
         c.NOMBRE AS CENTRO
       FROM UBICACION u
       JOIN ESCUELA e
         ON u.ESCUELA_ID_ESCUELA = e.ID_ESCUELA
       JOIN CENTRO c
         ON u.CENTRO_ID_CENTRO = c.ID_CENTRO
       ORDER BY u.ESCUELA_ID_ESCUELA, u.CENTRO_ID_CENTRO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getUbicaciones:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las ubicaciones",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getUbicacionById = async (req, res) => {
  let connection;

  try {
    const { idEscuela, idCentro } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         u.ESCUELA_ID_ESCUELA,
         e.NOMBRE AS ESCUELA,
         u.CENTRO_ID_CENTRO,
         c.NOMBRE AS CENTRO
       FROM UBICACION u
       JOIN ESCUELA e
         ON u.ESCUELA_ID_ESCUELA = e.ID_ESCUELA
       JOIN CENTRO c
         ON u.CENTRO_ID_CENTRO = c.ID_CENTRO
       WHERE u.ESCUELA_ID_ESCUELA = :idEscuela
         AND u.CENTRO_ID_CENTRO = :idCentro`,
      {
        idEscuela,
        idCentro,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getUbicacionById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la ubicación",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const createUbicacion = async (req, res) => {
  let connection;

  try {
    const { escuela_id_escuela, centro_id_centro } = req.body;

    if (!escuela_id_escuela || !centro_id_centro) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos escuela_id_escuela y centro_id_centro son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO UBICACION (
         ESCUELA_ID_ESCUELA,
         CENTRO_ID_CENTRO
       )
       VALUES (
         :escuela_id_escuela,
         :centro_id_centro
       )`,
      {
        escuela_id_escuela,
        centro_id_centro,
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Ubicación creada correctamente",
      data: {
        escuela_id_escuela,
        centro_id_centro,
        rowsAffected: result.rowsAffected,
      },
    });
  } catch (error) {
    console.error("Error en createUbicacion:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una ubicación con esa escuela y ese centro",
        error: error.message,
      });
    }

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear la ubicación porque la escuela o el centro indicado no existe",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la ubicación",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const updateUbicacion = async (req, res) => {
  let connection;

  try {
    const { idEscuela, idCentro } = req.params;
    const { nueva_escuela_id_escuela, nuevo_centro_id_centro } = req.body;

    if (!nueva_escuela_id_escuela || !nuevo_centro_id_centro) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos nueva_escuela_id_escuela y nuevo_centro_id_centro son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE UBICACION
       SET ESCUELA_ID_ESCUELA = :nueva_escuela_id_escuela,
           CENTRO_ID_CENTRO = :nuevo_centro_id_centro
       WHERE ESCUELA_ID_ESCUELA = :idEscuela
         AND CENTRO_ID_CENTRO = :idCentro`,
      {
        idEscuela,
        idCentro,
        nueva_escuela_id_escuela,
        nuevo_centro_id_centro,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ubicación actualizada correctamente",
      data: {
        anterior: {
          escuela_id_escuela: Number(idEscuela),
          centro_id_centro: Number(idCentro),
        },
        nueva: {
          escuela_id_escuela: nueva_escuela_id_escuela,
          centro_id_centro: nuevo_centro_id_centro,
        },
      },
    });
  } catch (error) {
    console.error("Error en updateUbicacion:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una ubicación con esa escuela y ese centro",
        error: error.message,
      });
    }

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar la ubicación porque la nueva escuela o el nuevo centro no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar la ubicación porque ya tiene registros relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la ubicación",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const deleteUbicacion = async (req, res) => {
  let connection;

  try {
    const { idEscuela, idCentro } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM UBICACION
       WHERE ESCUELA_ID_ESCUELA = :idEscuela
         AND CENTRO_ID_CENTRO = :idCentro`,
      {
        idEscuela,
        idCentro,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ubicación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deleteUbicacion:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar la ubicación porque tiene registros relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la ubicación",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  getUbicaciones,
  getUbicacionById,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
};