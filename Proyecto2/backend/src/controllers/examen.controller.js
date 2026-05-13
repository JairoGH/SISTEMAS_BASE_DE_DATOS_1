const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const obtenerRegistroContexto = async (connection, idRegistro) => {
  const result = await connection.execute(
    `SELECT
       ID_REGISTRO,
       UBICACION_ESCUELA_ID_ESCUELA,
       UBICACION_CENTRO_ID_CENTRO,
       MUNICIPIO_ID_MUNICIPIO,
       MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO
     FROM REGISTRO
     WHERE ID_REGISTRO = :idRegistro`,
    { idRegistro },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0] || null;
};

const verificarCorrelativo = async (connection, idCorrelativo) => {
  const result = await connection.execute(
    `SELECT ID_CORRELATIVO
     FROM CORRELATIVO
     WHERE ID_CORRELATIVO = :idCorrelativo`,
    { idCorrelativo },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.length > 0;
};

const getExamenes = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ex.ID_EXAMEN,

         ex.REGISTRO_ID_REGISTRO,
         r.NOMBRE_COMPLETO,
         r.TIPO_TRAMITE,
         r.TIPO_LICENCIA,
         r.GENERO,
         TO_CHAR(r.FECHA, 'YYYY-MM-DD') AS FECHA_REGISTRO,

         ex.CORRELATIVO_ID_CORRELATIVO,
         TO_CHAR(co.FECHA, 'YYYY-MM-DD') AS FECHA_CORRELATIVO,
         co.NO_EXAMEN,

         ex.REGISTRO_UBICACION_ESCUELA_ID_ESCUELA,
         es.NOMBRE AS ESCUELA,

         ex.REGISTRO_UBICACION_CENTRO_ID_CENTRO,
         ce.NOMBRE AS CENTRO,

         ex.REGISTRO_MUNICIPIO_ID_MUNICIPIO,
         m.NOMBRE AS MUNICIPIO,

         ex.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO

       FROM EXAMEN ex

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO
        AND ex.REGISTRO_UBICACION_ESCUELA_ID_ESCUELA = r.UBICACION_ESCUELA_ID_ESCUELA
        AND ex.REGISTRO_UBICACION_CENTRO_ID_CENTRO = r.UBICACION_CENTRO_ID_CENTRO
        AND ex.REGISTRO_MUNICIPIO_ID_MUNICIPIO = r.MUNICIPIO_ID_MUNICIPIO
        AND ex.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       JOIN ESCUELA es
         ON r.UBICACION_ESCUELA_ID_ESCUELA = es.ID_ESCUELA

       JOIN CENTRO ce
         ON r.UBICACION_CENTRO_ID_CENTRO = ce.ID_CENTRO

       JOIN MUNICIPIO m
         ON r.MUNICIPIO_ID_MUNICIPIO = m.ID_MUNICIPIO
        AND r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = m.DEPARTAMENTO_ID_DEPARTAMENTO

       JOIN DEPARTAMENTO d
         ON r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO

       ORDER BY ex.ID_EXAMEN`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getExamenes:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los exámenes",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getExamenById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         ex.ID_EXAMEN,

         ex.REGISTRO_ID_REGISTRO,
         r.NOMBRE_COMPLETO,
         r.TIPO_TRAMITE,
         r.TIPO_LICENCIA,
         r.GENERO,
         TO_CHAR(r.FECHA, 'YYYY-MM-DD') AS FECHA_REGISTRO,

         ex.CORRELATIVO_ID_CORRELATIVO,
         TO_CHAR(co.FECHA, 'YYYY-MM-DD') AS FECHA_CORRELATIVO,
         co.NO_EXAMEN,

         ex.REGISTRO_UBICACION_ESCUELA_ID_ESCUELA,
         es.NOMBRE AS ESCUELA,

         ex.REGISTRO_UBICACION_CENTRO_ID_CENTRO,
         ce.NOMBRE AS CENTRO,

         ex.REGISTRO_MUNICIPIO_ID_MUNICIPIO,
         m.NOMBRE AS MUNICIPIO,

         ex.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO

       FROM EXAMEN ex

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO
        AND ex.REGISTRO_UBICACION_ESCUELA_ID_ESCUELA = r.UBICACION_ESCUELA_ID_ESCUELA
        AND ex.REGISTRO_UBICACION_CENTRO_ID_CENTRO = r.UBICACION_CENTRO_ID_CENTRO
        AND ex.REGISTRO_MUNICIPIO_ID_MUNICIPIO = r.MUNICIPIO_ID_MUNICIPIO
        AND ex.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       JOIN ESCUELA es
         ON r.UBICACION_ESCUELA_ID_ESCUELA = es.ID_ESCUELA

       JOIN CENTRO ce
         ON r.UBICACION_CENTRO_ID_CENTRO = ce.ID_CENTRO

       JOIN MUNICIPIO m
         ON r.MUNICIPIO_ID_MUNICIPIO = m.ID_MUNICIPIO
        AND r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = m.DEPARTAMENTO_ID_DEPARTAMENTO

       JOIN DEPARTAMENTO d
         ON r.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO

       WHERE ex.ID_EXAMEN = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Examen no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getExamenById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el examen",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createExamen = async (req, res) => {
  let connection;

  try {
    const { registro_id_registro, correlativo_id_correlativo } = req.body;

    if (!registro_id_registro || !correlativo_id_correlativo) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos registro_id_registro y correlativo_id_correlativo son obligatorios",
      });
    }

    connection = await getConnection();

    const registro = await obtenerRegistroContexto(
      connection,
      registro_id_registro
    );

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "No existe el registro indicado",
      });
    }

    const correlativoExiste = await verificarCorrelativo(
      connection,
      correlativo_id_correlativo
    );

    if (!correlativoExiste) {
      return res.status(404).json({
        success: false,
        message: "No existe el correlativo indicado",
      });
    }

    const result = await connection.execute(
      `INSERT INTO EXAMEN (
         REGISTRO_ID_REGISTRO,
         CORRELATIVO_ID_CORRELATIVO,
         REGISTRO_UBICACION_ESCUELA_ID_ESCUELA,
         REGISTRO_UBICACION_CENTRO_ID_CENTRO,
         REGISTRO_MUNICIPIO_ID_MUNICIPIO,
         REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO
       )
       VALUES (
         :registro_id_registro,
         :correlativo_id_correlativo,
         :registro_ubicacion_escuela_id_escuela,
         :registro_ubicacion_centro_id_centro,
         :registro_municipio_id_municipio,
         :registro_municipio_departamento_id_departamento
       )
       RETURNING ID_EXAMEN INTO :id_examen`,
      {
        registro_id_registro,
        correlativo_id_correlativo,
        registro_ubicacion_escuela_id_escuela:
          registro.UBICACION_ESCUELA_ID_ESCUELA,
        registro_ubicacion_centro_id_centro:
          registro.UBICACION_CENTRO_ID_CENTRO,
        registro_municipio_id_municipio: registro.MUNICIPIO_ID_MUNICIPIO,
        registro_municipio_departamento_id_departamento:
          registro.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
        id_examen: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Examen creado correctamente",
      data: {
        id_examen: result.outBinds.id_examen[0],
        registro_id_registro,
        correlativo_id_correlativo,
        registro_ubicacion_escuela_id_escuela:
          registro.UBICACION_ESCUELA_ID_ESCUELA,
        registro_ubicacion_centro_id_centro:
          registro.UBICACION_CENTRO_ID_CENTRO,
        registro_municipio_id_municipio: registro.MUNICIPIO_ID_MUNICIPIO,
        registro_municipio_departamento_id_departamento:
          registro.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
      },
    });
  } catch (error) {
    console.error("Error en createExamen:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear el examen porque el registro o correlativo indicado no existe",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el examen",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updateExamen = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { registro_id_registro, correlativo_id_correlativo } = req.body;

    if (!registro_id_registro || !correlativo_id_correlativo) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos registro_id_registro y correlativo_id_correlativo son obligatorios",
      });
    }

    connection = await getConnection();

    const registro = await obtenerRegistroContexto(
      connection,
      registro_id_registro
    );

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "No existe el registro indicado",
      });
    }

    const correlativoExiste = await verificarCorrelativo(
      connection,
      correlativo_id_correlativo
    );

    if (!correlativoExiste) {
      return res.status(404).json({
        success: false,
        message: "No existe el correlativo indicado",
      });
    }

    const result = await connection.execute(
      `UPDATE EXAMEN
       SET REGISTRO_ID_REGISTRO = :registro_id_registro,
           CORRELATIVO_ID_CORRELATIVO = :correlativo_id_correlativo,
           REGISTRO_UBICACION_ESCUELA_ID_ESCUELA = :registro_ubicacion_escuela_id_escuela,
           REGISTRO_UBICACION_CENTRO_ID_CENTRO = :registro_ubicacion_centro_id_centro,
           REGISTRO_MUNICIPIO_ID_MUNICIPIO = :registro_municipio_id_municipio,
           REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = :registro_municipio_departamento_id_departamento
       WHERE ID_EXAMEN = :id`,
      {
        id,
        registro_id_registro,
        correlativo_id_correlativo,
        registro_ubicacion_escuela_id_escuela:
          registro.UBICACION_ESCUELA_ID_ESCUELA,
        registro_ubicacion_centro_id_centro:
          registro.UBICACION_CENTRO_ID_CENTRO,
        registro_municipio_id_municipio: registro.MUNICIPIO_ID_MUNICIPIO,
        registro_municipio_departamento_id_departamento:
          registro.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Examen no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Examen actualizado correctamente",
      data: {
        id_examen: Number(id),
        registro_id_registro,
        correlativo_id_correlativo,
        registro_ubicacion_escuela_id_escuela:
          registro.UBICACION_ESCUELA_ID_ESCUELA,
        registro_ubicacion_centro_id_centro:
          registro.UBICACION_CENTRO_ID_CENTRO,
        registro_municipio_id_municipio: registro.MUNICIPIO_ID_MUNICIPIO,
        registro_municipio_departamento_id_departamento:
          registro.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
      },
    });
  } catch (error) {
    console.error("Error en updateExamen:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el examen porque el registro o correlativo indicado no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el examen porque ya tiene respuestas relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el examen",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deleteExamen = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM EXAMEN
       WHERE ID_EXAMEN = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Examen no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Examen eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteExamen:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el examen porque tiene respuestas relacionadas",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el examen",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getExamenes,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen,
};