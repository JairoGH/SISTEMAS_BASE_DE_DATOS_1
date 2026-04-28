const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const validarFecha = (fecha) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
};

const getRegistros = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         r.ID_REGISTRO,
         r.UBICACION_ESCUELA_ID_ESCUELA,
         e.NOMBRE AS ESCUELA,
         r.UBICACION_CENTRO_ID_CENTRO,
         c.NOMBRE AS CENTRO,
         r.MUNICIPIO_ID_MUNICIPIO,
         m.NOMBRE AS MUNICIPIO,
         r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO,
         TO_CHAR(r.FECHA, 'YYYY-MM-DD') AS FECHA,
         r.TIPO_TRAMITE,
         r.TIPO_LICENCIA,
         r.NOMBRE_COMPLETO,
         r.GENERO
       FROM REGISTRO r
       JOIN ESCUELA e
         ON r.UBICACION_ESCUELA_ID_ESCUELA = e.ID_ESCUELA
       JOIN CENTRO c
         ON r.UBICACION_CENTRO_ID_CENTRO = c.ID_CENTRO
       JOIN MUNICIPIO m
         ON r.MUNICIPIO_ID_MUNICIPIO = m.ID_MUNICIPIO
        AND r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = m.DEPARTAMENTO_ID_DEPARTAMENTO
       JOIN DEPARTAMENTO d
         ON r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
       ORDER BY r.ID_REGISTRO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getRegistros:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los registros",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getRegistroById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         r.ID_REGISTRO,
         r.UBICACION_ESCUELA_ID_ESCUELA,
         e.NOMBRE AS ESCUELA,
         r.UBICACION_CENTRO_ID_CENTRO,
         c.NOMBRE AS CENTRO,
         r.MUNICIPIO_ID_MUNICIPIO,
         m.NOMBRE AS MUNICIPIO,
         r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO,
         TO_CHAR(r.FECHA, 'YYYY-MM-DD') AS FECHA,
         r.TIPO_TRAMITE,
         r.TIPO_LICENCIA,
         r.NOMBRE_COMPLETO,
         r.GENERO
       FROM REGISTRO r
       JOIN ESCUELA e
         ON r.UBICACION_ESCUELA_ID_ESCUELA = e.ID_ESCUELA
       JOIN CENTRO c
         ON r.UBICACION_CENTRO_ID_CENTRO = c.ID_CENTRO
       JOIN MUNICIPIO m
         ON r.MUNICIPIO_ID_MUNICIPIO = m.ID_MUNICIPIO
        AND r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = m.DEPARTAMENTO_ID_DEPARTAMENTO
       JOIN DEPARTAMENTO d
         ON r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
       WHERE r.ID_REGISTRO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getRegistroById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el registro",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createRegistro = async (req, res) => {
  let connection;

  try {
    const {
      ubicacion_escuela_id_escuela,
      ubicacion_centro_id_centro,
      municipio_id_municipio,
      municipio_departamento_id_departamento,
      fecha,
      tipo_tramite,
      tipo_licencia,
      nombre_completo,
      genero,
    } = req.body;

    if (
      !ubicacion_escuela_id_escuela ||
      !ubicacion_centro_id_centro ||
      !municipio_id_municipio ||
      !municipio_departamento_id_departamento ||
      !fecha ||
      !tipo_tramite ||
      !tipo_licencia ||
      !nombre_completo ||
      !genero
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if (!validarFecha(fecha)) {
      return res.status(400).json({
        success: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    if (!["M", "F"].includes(genero)) {
      return res.status(400).json({
        success: false,
        message: "El género debe ser M o F",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO REGISTRO (
         UBICACION_ESCUELA_ID_ESCUELA,
         UBICACION_CENTRO_ID_CENTRO,
         MUNICIPIO_ID_MUNICIPIO,
         MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
         FECHA,
         TIPO_TRAMITE,
         TIPO_LICENCIA,
         NOMBRE_COMPLETO,
         GENERO
       )
       VALUES (
         :ubicacion_escuela_id_escuela,
         :ubicacion_centro_id_centro,
         :municipio_id_municipio,
         :municipio_departamento_id_departamento,
         TO_DATE(:fecha, 'YYYY-MM-DD'),
         :tipo_tramite,
         :tipo_licencia,
         :nombre_completo,
         :genero
       )
       RETURNING ID_REGISTRO INTO :id_registro`,
      {
        ubicacion_escuela_id_escuela,
        ubicacion_centro_id_centro,
        municipio_id_municipio,
        municipio_departamento_id_departamento,
        fecha,
        tipo_tramite,
        tipo_licencia,
        nombre_completo,
        genero,
        id_registro: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Registro creado correctamente",
      data: {
        id_registro: result.outBinds.id_registro[0],
        ubicacion_escuela_id_escuela,
        ubicacion_centro_id_centro,
        municipio_id_municipio,
        municipio_departamento_id_departamento,
        fecha,
        tipo_tramite,
        tipo_licencia,
        nombre_completo,
        genero,
      },
    });
  } catch (error) {
    console.error("Error en createRegistro:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear el registro porque la ubicación o el municipio indicado no existe",
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
      message: "Error al crear el registro",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updateRegistro = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    const {
      ubicacion_escuela_id_escuela,
      ubicacion_centro_id_centro,
      municipio_id_municipio,
      municipio_departamento_id_departamento,
      fecha,
      tipo_tramite,
      tipo_licencia,
      nombre_completo,
      genero,
    } = req.body;

    if (
      !ubicacion_escuela_id_escuela ||
      !ubicacion_centro_id_centro ||
      !municipio_id_municipio ||
      !municipio_departamento_id_departamento ||
      !fecha ||
      !tipo_tramite ||
      !tipo_licencia ||
      !nombre_completo ||
      !genero
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if (!validarFecha(fecha)) {
      return res.status(400).json({
        success: false,
        message: "La fecha debe tener formato YYYY-MM-DD",
      });
    }

    if (!["M", "F"].includes(genero)) {
      return res.status(400).json({
        success: false,
        message: "El género debe ser M o F",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE REGISTRO
       SET UBICACION_ESCUELA_ID_ESCUELA = :ubicacion_escuela_id_escuela,
           UBICACION_CENTRO_ID_CENTRO = :ubicacion_centro_id_centro,
           MUNICIPIO_ID_MUNICIPIO = :municipio_id_municipio,
           MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = :municipio_departamento_id_departamento,
           FECHA = TO_DATE(:fecha, 'YYYY-MM-DD'),
           TIPO_TRAMITE = :tipo_tramite,
           TIPO_LICENCIA = :tipo_licencia,
           NOMBRE_COMPLETO = :nombre_completo,
           GENERO = :genero
       WHERE ID_REGISTRO = :id`,
      {
        id,
        ubicacion_escuela_id_escuela,
        ubicacion_centro_id_centro,
        municipio_id_municipio,
        municipio_departamento_id_departamento,
        fecha,
        tipo_tramite,
        tipo_licencia,
        nombre_completo,
        genero,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registro actualizado correctamente",
      data: {
        id_registro: Number(id),
        ubicacion_escuela_id_escuela,
        ubicacion_centro_id_centro,
        municipio_id_municipio,
        municipio_departamento_id_departamento,
        fecha,
        tipo_tramite,
        tipo_licencia,
        nombre_completo,
        genero,
      },
    });
  } catch (error) {
    console.error("Error en updateRegistro:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el registro porque la ubicación o municipio indicado no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el registro porque ya tiene exámenes relacionados",
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
      message: "Error al actualizar el registro",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deleteRegistro = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM REGISTRO
       WHERE ID_REGISTRO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registro eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteRegistro:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el registro porque tiene exámenes relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el registro",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getRegistros,
  getRegistroById,
  createRegistro,
  updateRegistro,
  deleteRegistro,
};