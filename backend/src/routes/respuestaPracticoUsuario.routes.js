const express = require("express");
const router = express.Router();

const {
  getRespuestasPracticoUsuario,
  getRespuestaPracticoUsuarioByIds,
  createRespuestaPracticoUsuario,
  updateRespuestaPracticoUsuario,
  deleteRespuestaPracticoUsuario,
} = require("../controllers/respuestaPracticoUsuario.controller");

router.get("/", getRespuestasPracticoUsuario);

router.get(
  "/pregunta-practico/:idPreguntaPractico/examen/:idExamen",
  getRespuestaPracticoUsuarioByIds
);

router.post("/", createRespuestaPracticoUsuario);

router.put(
  "/pregunta-practico/:idPreguntaPractico/examen/:idExamen",
  updateRespuestaPracticoUsuario
);

router.delete(
  "/pregunta-practico/:idPreguntaPractico/examen/:idExamen",
  deleteRespuestaPracticoUsuario
);

module.exports = router;