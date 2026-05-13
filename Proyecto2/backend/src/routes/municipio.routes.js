const express = require("express");
const router = express.Router();

const {
  getMunicipios,
  getMunicipioById,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio,
} = require("../controllers/municipio.controller");

router.get("/", getMunicipios);
router.get("/:id", getMunicipioById);
router.post("/", createMunicipio);
router.put("/:id", updateMunicipio);
router.delete("/:id", deleteMunicipio);

module.exports = router;