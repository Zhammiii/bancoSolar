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

/* realizar transferencia */
app.post('/transferencia', async (req, res) => {
  try {
    const { emisor, receptor, monto } = req.body;
    if (!emisor || !receptor || !monto) {
      return res.status(400).json({
        status: "Error",
        message: "Se requieren emisor, receptor y monto en la solicitud.",
        code: 400
      });
    }
    console.log("BEGIN START");
    await pool.query("BEGIN");
    const descontar = `UPDATE usuarios SET balance = balance - ${monto} WHERE id = ${emisor} RETURNING *`;
    const clienteDescontado = await pool.query(descontar);

    if (!clienteDescontado.rowCount) {
      await pool.query("ROLLBACK");
      console.log({
        status: "Error",
        message: "Falla al descontar saldo del emisor",
        code: 500,
        emisor: clienteDescontado.rows[0],
        receptor: receptor
      });
      return res.status(500).json({
        status: "Error",
        message: "Falla al descontar saldo del emisor",
        code: 500
      });
    }
    const acreditar = `UPDATE usuarios SET balance = balance + ${monto} WHERE id = ${receptor} RETURNING *`;
    const clienteAcreditado = await pool.query(acreditar);

    if (!clienteAcreditado.rowCount) {
      await pool.query("ROLLBACK");
      console.log({
        status: "Error",
        message: "Falla al acreditar saldo al receptor",
        code: 500,
        emisor: emisor,
        receptor: clienteAcreditado.rows[0]
      });
      return res.status(500).json({
        status: "Error",
        message: "Falla al acreditar saldo al receptor",
        code: 500
      });
    }
    const obtenerNombres = `
    SELECT id, nombre FROM usuarios WHERE id IN (${emisor}, ${receptor})
  `;
    const nombres = await pool.query(obtenerNombres);
    const insertTransferencia = `
      INSERT INTO transferencias (emisor, receptor, monto, fecha)
      VALUES (${emisor}, ${receptor}, ${monto}, NOW())
    `;
    await pool.query(insertTransferencia);

    console.log({
      status: "Ok",
      message: "Operación realizada con éxito.",
      code: 200,
      emisor: nombres.rows[0].nombre,
      receptor: nombres.rows[1].nombre 
    });
    await pool.query("COMMIT");
    console.log("COMMIT END");
    return res.status(200).json({
      status: "Ok",
      message: "Operación realizada con éxito.",
      code: 200,
      emisor: nombres.rows[0].nombre, 
      receptor: nombres.rows[1].nombre 
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
  }
});

/* registro de tranferencias */
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
export { app, PORT };
