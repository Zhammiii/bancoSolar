import { Router } from "express";
import rutasTransaction from "./transaction.routes.js";
import rutaUsers from "./users.routes.js";
const router = Router();

/* Rutas */
router.get("/", async (req, res) => {
  try {
    res.sendFile("/index.html");
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

router.use("/transactions", rutasTransaction);
router.use("/users", rutaUsers);

export default router;
