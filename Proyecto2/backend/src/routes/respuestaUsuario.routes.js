const express = require("express");
const router = express.Router();

const {
  getRespuestasUsuario,
  getRespuestaUsuarioByIds,
  createRespuestaUsuario,
  updateRespuestaUsuario,
  deleteRespuestaUsuario,
} = require("../controllers/respuestaUsuario.controller");

router.get("/", getRespuestasUsuario);

router.get(
  "/pregunta/:idPregunta/examen/:idExamen",
  getRespuestaUsuarioByIds
);

router.post("/", createRespuestaUsuario);

router.put(
  "/pregunta/:idPregunta/examen/:idExamen",
  updateRespuestaUsuario
);

router.delete(
  "/pregunta/:idPregunta/examen/:idExamen",
  deleteRespuestaUsuario
);

module.exports = router;