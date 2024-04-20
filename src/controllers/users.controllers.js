import { pool } from "../dbConfig.js";

export async function getUsuarios(req, res) {
  try {
    const query = "SELECT * FROM usuarios";
    const result = await pool.query(query);
    res.send(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener usuarios de la base de datos" });
  }
}

export async function postUsuarios(req, res) {
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
}

export async function deleteUsuarios(req, res) {
  try {
    const { id } = req.query;
    const query = "DELETE FROM usuarios WHERE id = $1 RETURNING *";
    const value = [id];
    const result = await pool.query(query, value);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error al momento de eliminar usuario" });
  }
}

export async function putUsuarios (req,res){
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
}
