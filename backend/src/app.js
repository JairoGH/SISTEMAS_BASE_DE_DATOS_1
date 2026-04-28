const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const dbRoutes = require("./routes/db.routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Proyecto 2 - Sistemas de Bases de Datos 1",
    status: "OK",
  });
});

app.use("/api/db", dbRoutes);

module.exports = app;