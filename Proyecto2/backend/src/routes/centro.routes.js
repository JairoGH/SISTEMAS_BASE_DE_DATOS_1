const express = require("express");
const router = express.Router();

const {
  getCentros,
  getCentroById,
  createCentro,
  updateCentro,
  deleteCentro,
} = require("../controllers/centro.controller");

router.get("/", getCentros);
router.get("/:id", getCentroById);
router.post("/", createCentro);
router.put("/:id", updateCentro);
router.delete("/:id", deleteCentro);

module.exports = router;