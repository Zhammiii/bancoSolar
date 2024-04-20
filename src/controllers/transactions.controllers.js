import { pool } from "../dbConfig.js";

export async function postTranferencia(req, res) {
  try {
    const { emisor, receptor, monto } = req.body;
    if (!emisor || !receptor || !monto) {
      return res.status(400).json({
        status: "Error",
        message: "Se requieren emisor, receptor y monto en la solicitud.",
        code: 400,
      });
    }

    await pool.query("BEGIN");

    const descontar = `UPDATE usuarios SET balance = balance - ${monto} WHERE id = ${emisor} RETURNING *`;
    const clienteDescontado = await pool.query(descontar);

    if (clienteDescontado.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(500).json({
        status: "Error",
        message: "Falla al descontar saldo del emisor",
        code: 500,
      });
    }

    const acreditar = `UPDATE usuarios SET balance = balance + ${monto} WHERE id = ${receptor} RETURNING *`;
    const clienteAcreditado = await pool.query(acreditar);

    if (clienteAcreditado.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(500).json({
        status: "Error",
        message: "Falla al acreditar saldo al receptor",
        code: 500,
      });
    }

    const obtenerNombres = `
          SELECT e.nombre AS nombre_emisor, r.nombre AS nombre_receptor
          FROM usuarios e
          INNER JOIN usuarios r ON e.id = ${emisor} AND r.id = ${receptor}
        `;
    const nombres = await pool.query(obtenerNombres);

    if (nombres.rows.length !== 1) {
      await pool.query("ROLLBACK");
      return res.status(500).json({
        status: "Error",
        message: "No se encontraron nombres para los emisores y receptores",
        code: 500,
      });
    }

    const insertTransferencia = `
          INSERT INTO transferencias (emisor, receptor, monto, fecha)
          VALUES (${emisor}, ${receptor}, ${monto}, NOW())
        `;
    await pool.query(insertTransferencia);

    await pool.query("COMMIT");

    return res.status(200).json({
      status: "Ok",
      message: "Operación realizada con éxito.",
      code: 200,
      emisor: nombres.rows[0].nombre_emisor,
      receptor: nombres.rows[0].nombre_receptor,
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
}

export async function getTransferencias (req,res) {
    try {
        const query = `
          SELECT t.*, e.nombre AS nombre_emisor, r.nombre AS nombre_receptor
          FROM transferencias t
          INNER JOIN usuarios e ON t.emisor = e.id
          INNER JOIN usuarios r ON t.receptor = r.id
        `;
        const result = await pool.query(query);
        res.send(result.rows);
      } catch (error) {
        res.status(500).json({
          error: "Error al obtener las transferencias de la base de datos",
        });
      }
}