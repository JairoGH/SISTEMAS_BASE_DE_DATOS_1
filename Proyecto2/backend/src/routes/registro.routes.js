const express = require("express");
const router = express.Router();

const {
  getRegistros,
  getRegistroById,
  createRegistro,
  updateRegistro,
  deleteRegistro,
} = require("../controllers/registro.controller");

router.get("/", getRegistros);
router.get("/:id", getRegistroById);
router.post("/", createRegistro);
router.put("/:id", updateRegistro);
router.delete("/:id", deleteRegistro);

module.exports = router;