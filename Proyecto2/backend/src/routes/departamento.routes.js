const express = require("express");
const router = express.Router();

const {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
} = require("../controllers/departamento.controller");

router.get("/", getDepartamentos);
router.get("/:id", getDepartamentoById);
router.post("/", createDepartamento);
router.put("/:id", updateDepartamento);
router.delete("/:id", deleteDepartamento);

module.exports = router;