const oracledb = require("oracledb");
const { getConnection } = require("../config/database");

const obtenerPreguntaPractico = async (connection, idPreguntaPractico) => {
  const result = await connection.execute(
    `SELECT 
       ID_PREGUNTA_PRACTICO,
       PREGUNTA_TEXTO,
       PUNTEO
     FROM PREGUNTAS_PRACTICO
     WHERE ID_PREGUNTA_PRACTICO = :idPreguntaPractico`,
    { idPreguntaPractico },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0] || null;
};

const verificarExamen = async (connection, idExamen) => {
  const result = await connection.execute(
    `SELECT ID_EXAMEN
     FROM EXAMEN
     WHERE ID_EXAMEN = :idExamen`,
    { idExamen },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.length > 0;
};

const validarNota = (nota, punteoMaximo = null) => {
  if (nota === undefined || nota === null || nota === "") {
    return "El campo nota es obligatorio";
  }

  if (isNaN(Number(nota))) {
    return "La nota debe ser un número";
  }

  if (Number(nota) < 0) {
    return "La nota no puede ser negativa";
  }

  if (punteoMaximo !== null && Number(nota) > Number(punteoMaximo)) {
    return `La nota no puede ser mayor al punteo máximo de la pregunta práctica: ${punteoMaximo}`;
  }

  return null;
};

const getRespuestasPracticoUsuario = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO,
         pp.PREGUNTA_TEXTO,
         pp.PUNTEO AS PUNTEO_MAXIMO,

         rpu.EXAMEN_ID_EXAMEN,
         r.NOMBRE_COMPLETO,
         co.NO_EXAMEN,

         rpu.NOTA,
         CASE
           WHEN rpu.NOTA >= (pp.PUNTEO * 0.70) THEN 'SI'
           ELSE 'NO'
         END AS APRUEBA_PRACTICO

       FROM RESPUESTA_PRACTICO_USUARIO rpu

       JOIN PREGUNTAS_PRACTICO pp
         ON rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO = pp.ID_PREGUNTA_PRACTICO

       JOIN EXAMEN ex
         ON rpu.EXAMEN_ID_EXAMEN = ex.ID_EXAMEN

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       ORDER BY rpu.EXAMEN_ID_EXAMEN, rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en getRespuestasPracticoUsuario:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener las respuestas prácticas de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getRespuestaPracticoUsuarioByIds = async (req, res) => {
  let connection;

  try {
    const { idPreguntaPractico, idExamen } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO,
         pp.PREGUNTA_TEXTO,
         pp.PUNTEO AS PUNTEO_MAXIMO,

         rpu.EXAMEN_ID_EXAMEN,
         r.NOMBRE_COMPLETO,
         co.NO_EXAMEN,

         rpu.NOTA,
         CASE
           WHEN rpu.NOTA >= (pp.PUNTEO * 0.70) THEN 'SI'
           ELSE 'NO'
         END AS APRUEBA_PRACTICO

       FROM RESPUESTA_PRACTICO_USUARIO rpu

       JOIN PREGUNTAS_PRACTICO pp
         ON rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO = pp.ID_PREGUNTA_PRACTICO

       JOIN EXAMEN ex
         ON rpu.EXAMEN_ID_EXAMEN = ex.ID_EXAMEN

       JOIN REGISTRO r
         ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO

       JOIN CORRELATIVO co
         ON ex.CORRELATIVO_ID_CORRELATIVO = co.ID_CORRELATIVO

       WHERE rpu.PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO = :idPreguntaPractico
         AND rpu.EXAMEN_ID_EXAMEN = :idExamen`,
      { idPreguntaPractico, idExamen },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta práctica de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en getRespuestaPracticoUsuarioByIds:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener la respuesta práctica de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const createRespuestaPracticoUsuario = async (req, res) => {
  let connection;

  try {
    const {
      preguntas_practico_id_pregunta_practico,
      examen_id_examen,
      nota,
    } = req.body;

    if (!preguntas_practico_id_pregunta_practico || !examen_id_examen) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos preguntas_practico_id_pregunta_practico, examen_id_examen y nota son obligatorios",
      });
    }

    connection = await getConnection();

    const preguntaPractico = await obtenerPreguntaPractico(
      connection,
      preguntas_practico_id_pregunta_practico
    );

    if (!preguntaPractico) {
      return res.status(404).json({
        success: false,
        message: "No existe la pregunta práctica indicada",
      });
    }

    const examenExiste = await verificarExamen(connection, examen_id_examen);

    if (!examenExiste) {
      return res.status(404).json({
        success: false,
        message: "No existe el examen indicado",
      });
    }

    const errorNota = validarNota(nota, preguntaPractico.PUNTEO);

    if (errorNota) {
      return res.status(400).json({
        success: false,
        message: errorNota,
      });
    }

    await connection.execute(
      `INSERT INTO RESPUESTA_PRACTICO_USUARIO (
         PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO,
         EXAMEN_ID_EXAMEN,
         NOTA
       )
       VALUES (
         :preguntas_practico_id_pregunta_practico,
         :examen_id_examen,
         :nota
       )`,
      {
        preguntas_practico_id_pregunta_practico,
        examen_id_examen,
        nota,
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      message: "Respuesta práctica de usuario creada correctamente",
      data: {
        preguntas_practico_id_pregunta_practico,
        examen_id_examen,
        nota,
      },
    });
  } catch (error) {
    console.error("Error en createRespuestaPracticoUsuario:", error);

    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una respuesta práctica para esa pregunta en ese examen",
        error: error.message,
      });
    }

    if (error.errorNum === 2291) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear la respuesta práctica porque la pregunta práctica o el examen no existe",
        error: error.message,
      });
    }

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La nota debe cumplir la restricción CHECK: nota mayor o igual a 0",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la respuesta práctica de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const updateRespuestaPracticoUsuario = async (req, res) => {
  let connection;

  try {
    const { idPreguntaPractico, idExamen } = req.params;
    const { nota } = req.body;

    connection = await getConnection();

    const preguntaPractico = await obtenerPreguntaPractico(
      connection,
      idPreguntaPractico
    );

    if (!preguntaPractico) {
      return res.status(404).json({
        success: false,
        message: "No existe la pregunta práctica indicada",
      });
    }

    const errorNota = validarNota(nota, preguntaPractico.PUNTEO);

    if (errorNota) {
      return res.status(400).json({
        success: false,
        message: errorNota,
      });
    }

    const result = await connection.execute(
      `UPDATE RESPUESTA_PRACTICO_USUARIO
       SET NOTA = :nota
       WHERE PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO = :idPreguntaPractico
         AND EXAMEN_ID_EXAMEN = :idExamen`,
      {
        idPreguntaPractico,
        idExamen,
        nota,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta práctica de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta práctica de usuario actualizada correctamente",
      data: {
        preguntas_practico_id_pregunta_practico: Number(idPreguntaPractico),
        examen_id_examen: Number(idExamen),
        nota,
      },
    });
  } catch (error) {
    console.error("Error en updateRespuestaPracticoUsuario:", error);

    if (error.errorNum === 2290) {
      return res.status(400).json({
        success: false,
        message: "La nota debe cumplir la restricción CHECK: nota mayor o igual a 0",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar la respuesta práctica de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const deleteRespuestaPracticoUsuario = async (req, res) => {
  let connection;

  try {
    const { idPreguntaPractico, idExamen } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM RESPUESTA_PRACTICO_USUARIO
       WHERE PREGUNTAS_PRACTICO_ID_PREGUNTA_PRACTICO = :idPreguntaPractico
         AND EXAMEN_ID_EXAMEN = :idExamen`,
      { idPreguntaPractico, idExamen },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Respuesta práctica de usuario no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta práctica de usuario eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en deleteRespuestaPracticoUsuario:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar la respuesta práctica de usuario",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = {
  getRespuestasPracticoUsuario,
  getRespuestaPracticoUsuarioByIds,
  createRespuestaPracticoUsuario,
  updateRespuestaPracticoUsuario,
  deleteRespuestaPracticoUsuario,
};