import express from "express";
const app = express();
const PORT = 3000;
import { pool } from "./dbConfig.js";

/* Middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

/* Rutas */
app.get("/", async (req, res) => {
  try {
    res.sendFile("/index.html");
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

/* obtener usuarios */
app.get("/usuarios", async (req, res) => {
  try {
    const query = "SELECT * FROM usuarios";
    const result = await pool.query(query);
    res.send(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener usuarios de la base de datos" });
  }
});
/* Agregar usuarios */
app.post("/usuario", async (req, res) => {
  try {
    const { nombre, balance } = req.body;
    console.log(req.body);
    const query =
      "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *";
    const values = [nombre, balance];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al insertar un nuevo usuario a la base de datos" });
  }
});
/* tranferencias */
app.get("/transferencias", async (req, res) => {
  try {
    const query = "SELECT * FROM transferencias";
    const result = await pool.query(query);
    res.send(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener las transferencias de la base de datos",
    });
  }
});

/* para eliminar */
app.delete("/usuario", async (req, res) => {
  try {
    const { id } = req.query;
    const query = "DELETE FROM usuarios WHERE id = $1 RETURNING *";
    const value = [id];
    const result = await pool.query(query, value);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error al momento de eliminar usuario" });
  }
});

/* Para editar */

app.put("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, balance } = req.body;
  try {
    const query =
      "UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *";
    const values = [id, nombre, balance];
    const result = await pool.query(query, values);
    res.send(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al editar el usuario" });
  }
});

export { app, PORT };
