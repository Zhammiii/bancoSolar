import express from "express";
const app = express();
const PORT = 3000;
import rutas from "./routes/index.routes.js"

/* Middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

/* router */
app.use ('/apiV1', rutas)

/* ruta generica */
app.get("*", (req, res) => {
  res.status(404).send("Esta página No Existe");
});

export { app, PORT };
