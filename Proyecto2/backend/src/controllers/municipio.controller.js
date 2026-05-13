const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getMunicipios = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         m.ID_MUNICIPIO,
         m.NOMBRE,
         m.CODIGO,
         m.DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO
       FROM MUNICIPIO m
       JOIN DEPARTAMENTO d
         ON m.DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
       ORDER BY m.ID_MUNICIPIO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getMunicipios:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los municipios",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getMunicipioById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         m.ID_MUNICIPIO,
         m.NOMBRE,
         m.CODIGO,
         m.DEPARTAMENTO_ID_DEPARTAMENTO,
         d.NOMBRE AS DEPARTAMENTO
       FROM MUNICIPIO m
       JOIN DEPARTAMENTO d
         ON m.DEPARTAMENTO_ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
       WHERE m.ID_MUNICIPIO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Municipio no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getMunicipioById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el municipio",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const createMunicipio = async (req, res) => {
  let connection;

  try {
    const { nombre, codigo, departamento_id_departamento } = req.body;

    if (!nombre || !codigo || !departamento_id_departamento) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos nombre, codigo y departamento_id_departamento son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO MUNICIPIO (
         NOMBRE,
         CODIGO,
         DEPARTAMENTO_ID_DEPARTAMENTO
       )
       VALUES (
         :nombre,
         :codigo,
         :departamento_id_departamento
       )
       RETURNING ID_MUNICIPIO INTO :id_municipio`,
      {
        nombre,
        codigo,
        departamento_id_departamento,
        id_municipio: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Municipio creado correctamente",
      data: {
        id_municipio: result.outBinds.id_municipio[0],
        nombre,
        codigo,
        departamento_id_departamento,
      },
    });
  } catch (error) {
    console.error("Error en createMunicipio:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear el municipio porque el departamento indicado no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un municipio con esos datos",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el municipio",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const updateMunicipio = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { nombre, codigo, departamento_id_departamento } = req.body;

    if (!nombre || !codigo || !departamento_id_departamento) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos nombre, codigo y departamento_id_departamento son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE MUNICIPIO
       SET NOMBRE = :nombre,
           CODIGO = :codigo,
           DEPARTAMENTO_ID_DEPARTAMENTO = :departamento_id_departamento
       WHERE ID_MUNICIPIO = :id`,
      {
        id,
        nombre,
        codigo,
        departamento_id_departamento,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Municipio no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Municipio actualizado correctamente",
      data: {
        id_municipio: Number(id),
        nombre,
        codigo,
        departamento_id_departamento,
      },
    });
  } catch (error) {
    console.error("Error en updateMunicipio:", error);

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el municipio porque el departamento indicado no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede cambiar el departamento del municipio porque ya tiene registros relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el municipio",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const deleteMunicipio = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM MUNICIPIO
       WHERE ID_MUNICIPIO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Municipio no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Municipio eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteMunicipio:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el municipio porque tiene registros relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el municipio",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  getMunicipios,
  getMunicipioById,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio,
};