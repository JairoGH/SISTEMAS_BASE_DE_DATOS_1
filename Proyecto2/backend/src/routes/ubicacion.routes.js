const express = require("express");
const router = express.Router();

const {
  getUbicaciones,
  getUbicacionById,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
} = require("../controllers/ubicacion.controller");

router.get("/", getUbicaciones);
router.get("/:idEscuela/:idCentro", getUbicacionById);
router.post("/", createUbicacion);
router.put("/:idEscuela/:idCentro", updateUbicacion);
router.delete("/:idEscuela/:idCentro", deleteUbicacion);

module.exports = router;