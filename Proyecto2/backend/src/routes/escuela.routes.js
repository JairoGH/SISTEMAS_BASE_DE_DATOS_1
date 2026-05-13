const express = require("express");
const router = express.Router();

const {
  getEscuelas,
  getEscuelaById,
  createEscuela,
  updateEscuela,
  deleteEscuela,
} = require("../controllers/escuela.controller");

router.get("/", getEscuelas);
router.get("/:id", getEscuelaById);
router.post("/", createEscuela);
router.put("/:id", updateEscuela);
router.delete("/:id", deleteEscuela);

module.exports = router;