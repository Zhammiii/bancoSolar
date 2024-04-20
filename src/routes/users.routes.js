import { Router } from "express";
const router = Router();
import {
  postUsuarios,
  getUsuarios,
  deleteUsuarios,
  putUsuarios,
} from "../controllers/users.controllers.js";

/* obtener usuarios */
router.get("/usuarios", getUsuarios);

/* Agregar usuarios */
router.post("/usuario", postUsuarios);

/* para eliminar */
router.delete("/usuario", deleteUsuarios);

/* para editar */
router.put("/usuario/:id", putUsuarios);

export default router;
