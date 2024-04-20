import { Router } from "express";
const router = Router();
import {
  getTransferencias,
  postTranferencia,
} from "../controllers/transactions.controllers.js";

/* realizar transferencia */
router.post("/transferencia", postTranferencia);

/* registro de tranferencias */
router.get("/transferencias", getTransferencias);

export default router;
