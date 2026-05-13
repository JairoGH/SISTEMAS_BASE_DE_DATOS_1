const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const validarFecha = (fecha) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
};

const getCorrelativos = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_CORRELATIVO,
         TO_CHAR(FECHA, 'YYYY-MM-DD') AS FECHA,
         NO_EXAMEN
       FROM CORRELATIVO
       ORDER BY ID_CORRELATIVO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getCorrelativos:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los correlativos",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getCorrelativoById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ID_CORRELATIVO,
         TO_CHAR(FECHA, 'YYYY-MM-DD') AS FECHA,
         NO_EXAMEN
       FROM CORRELATIVO
       WHERE ID_CORRELATIVO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Correlativo no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getCorrelativoById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el correlativo",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createCorrelativo = async (req, res) => {
  let connection;

  try {
    const { fecha, no_examen } = req.body;

    if (!fecha || no_examen === undefined || no_examen === null) {
      return res.status(400).json({
        success: false,
        message: "Los campos fecha y no_examen son obligatorios",
      });
    }

    if (!validarFecha(fecha)) {
      return res.status(400).json({
        success: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    if (isNaN(Number(no_examen)) || Number(no_examen) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El campo no_examen debe ser un número mayor a 0",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO CORRELATIVO (
         FECHA,
         NO_EXAMEN
       )
       VALUES (
         TO_DATE(:fecha, 'YYYY-MM-DD'),
         :no_examen
       )
       RETURNING ID_CORRELATIVO INTO :id_correlativo`,
      {
        fecha,
        no_examen,
        id_correlativo: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Correlativo creado correctamente",
      data: {
        id_correlativo: result.outBinds.id_correlativo[0],
        fecha,
        no_examen,
      },
    });
  } catch (error) {
    console.error("Error en createCorrelativo:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un correlativo con esos datos",
        error: error.message,
      });
    }

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "Algún dato no cumple una restricción CHECK",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el correlativo",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updateCorrelativo = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { fecha, no_examen } = req.body;

    if (!fecha || no_examen === undefined || no_examen === null) {
      return res.status(400).json({
        success: false,
        message: "Los campos fecha y no_examen son obligatorios",
      });
    }

    if (!validarFecha(fecha)) {
      return res.status(400).json({
        success: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    if (isNaN(Number(no_examen)) || Number(no_examen) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El campo no_examen debe ser un número mayor a 0",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE CORRELATIVO
       SET FECHA = TO_DATE(:fecha, 'YYYY-MM-DD'),
           NO_EXAMEN = :no_examen
       WHERE ID_CORRELATIVO = :id`,
      {
        id,
        fecha,
        no_examen,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Correlativo no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Correlativo actualizado correctamente",
      data: {
        id_correlativo: Number(id),
        fecha,
        no_examen,
      },
    });
  } catch (error) {
    console.error("Error en updateCorrelativo:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un correlativo con esos datos",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el correlativo porque ya tiene exámenes relacionados",
        error: error.message,
      });
    }

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "Algún dato no cumple una restricción CHECK",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el correlativo",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deleteCorrelativo = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM CORRELATIVO
       WHERE ID_CORRELATIVO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Correlativo no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Correlativo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteCorrelativo:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el correlativo porque tiene exámenes relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el correlativo",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getCorrelativos,
  getCorrelativoById,
  createCorrelativo,
  updateCorrelativo,
  deleteCorrelativo,
};