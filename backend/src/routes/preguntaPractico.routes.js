const express = require("express");
const router = express.Router();

const {
  getPreguntasPractico,
  getPreguntaPracticoById,
  createPreguntaPractico,
  updatePreguntaPractico,
  deletePreguntaPractico,
} = require("../controllers/preguntaPractico.controller");

router.get("/", getPreguntasPractico);
router.get("/:id", getPreguntaPracticoById);
router.post("/", createPreguntaPractico);
router.put("/:id", updatePreguntaPractico);
router.delete("/:id", deletePreguntaPractico);

module.exports = router;