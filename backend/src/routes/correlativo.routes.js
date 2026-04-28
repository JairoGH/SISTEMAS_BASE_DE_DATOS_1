const express = require("express");
const router = express.Router();

const {
  getCorrelativos,
  getCorrelativoById,
  createCorrelativo,
  updateCorrelativo,
  deleteCorrelativo,
} = require("../controllers/correlativo.controller");

router.get("/", getCorrelativos);
router.get("/:id", getCorrelativoById);
router.post("/", createCorrelativo);
router.put("/:id", updateCorrelativo);
router.delete("/:id", deleteCorrelativo);

module.exports = router;