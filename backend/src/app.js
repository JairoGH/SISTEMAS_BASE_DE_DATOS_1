const express = require("express");
const cors = require("cors");

const dbRoutes = require("./routes/db.routes");
const centroRoutes = require("./routes/centro.routes.js");
const departamentoRoutes = require("./routes/departamento.routes");
const escuelaRoutes = require("./routes/escuela.routes");
const municipioRoutes = require("./routes/municipio.routes");
const ubicacionRoutes = require("./routes/ubicacion.routes");
const registroRoutes = require("./routes/registro.routes");
const correlativoRoutes = require("./routes/correlativo.routes");
const examenRoutes = require("./routes/examen.routes");
const preguntaRoutes = require("./routes/pregunta.routes");
const preguntaPracticoRoutes = require("./routes/preguntaPractico.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/db", dbRoutes);
app.use("/api/centros", centroRoutes);
app.use("/api/departamentos", departamentoRoutes);
app.use("/api/escuelas", escuelaRoutes);
app.use("/api/municipios", municipioRoutes);
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/registros", registroRoutes);
app.use("/api/correlativos", correlativoRoutes);
app.use("/api/examenes", examenRoutes);
app.use("/api/preguntas", preguntaRoutes);
app.use("/api/preguntas-practico", preguntaPracticoRoutes);

// Ruta raíz para verificar que la API está funcionando
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Proyecto 2 SBD1 funcionando correctamente",
  });
});

module.exports = app;