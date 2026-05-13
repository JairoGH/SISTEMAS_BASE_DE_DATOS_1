const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const getDepartamentos = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
         ID_DEPARTAMENTO,
         NOMBRE,
         CODIGO
       FROM DEPARTAMENTO
       ORDER BY ID_DEPARTAMENTO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getDepartamentos:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener los departamentos",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getDepartamentoById = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
         ID_DEPARTAMENTO,
         NOMBRE,
         CODIGO
       FROM DEPARTAMENTO
       WHERE ID_DEPARTAMENTO = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getDepartamentoById:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el departamento",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const createDepartamento = async (req, res) => {
  let connection;

  try {
    const { nombre, codigo } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre y codigo son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO DEPARTAMENTO (
         NOMBRE,
         CODIGO
       )
       VALUES (
         :nombre,
         :codigo
       )
       RETURNING ID_DEPARTAMENTO INTO :id_departamento`,
      {
        nombre,
        codigo,
        id_departamento: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Departamento creado correctamente",
      data: {
        id_departamento: result.outBinds.id_departamento[0],
        nombre,
        codigo,
      },
    });
  } catch (error) {
    console.error("Error en createDepartamento:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un departamento con ese código",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el departamento",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const updateDepartamento = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { nombre, codigo } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre y codigo son obligatorios",
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE DEPARTAMENTO
       SET NOMBRE = :nombre,
           CODIGO = :codigo
       WHERE ID_DEPARTAMENTO = :id`,
      {
        id,
        nombre,
        codigo,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Departamento actualizado correctamente",
      data: {
        id_departamento: Number(id),
        nombre,
        codigo,
      },
    });
  } catch (error) {
    console.error("Error en updateDepartamento:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un departamento con ese código",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el departamento",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const deleteDepartamento = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM DEPARTAMENTO
       WHERE ID_DEPARTAMENTO = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Departamento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Departamento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteDepartamento:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el departamento porque tiene municipios relacionados",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el departamento",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
};