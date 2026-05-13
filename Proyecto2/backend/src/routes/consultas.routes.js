const express = require("express");
const router = express.Router();

const {
    getEstadisticasEvaluaciones,
    getRankingEvaluados,
    getPreguntaMenorAciertos,
} = require("../controllers/consultas.controller");

router.get("/estadisticas", getEstadisticasEvaluaciones);
router.get("/ranking", getRankingEvaluados);
router.get("/dificultad-preguntas", getPreguntaMenorAciertos);

module.exports = router;