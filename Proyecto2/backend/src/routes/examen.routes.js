const express = require("express");
const router = express.Router();

const {
  getExamenes,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen,
} = require("../controllers/examen.controller");

router.get("/", getExamenes);
router.get("/:id", getExamenById);
router.post("/", createExamen);
router.put("/:id", updateExamen);
router.delete("/:id", deleteExamen);

module.exports = router;