import { Router } from "express";
import heroRouter from "./hero.routes";
import skinRouter from "./skin.routes";
import statisticRouter from "./statistic.routes";
import transactionRouter from "./transaction.routes";

const router = Router();

// Route Hero & Skin (Tugas Anggota 2)
router.use("/heroes", heroRouter);
router.use("/skins", skinRouter);

// Route Player & Statistic (Tugas Anggota 1 & Anggota 3)
router.use("/players", transactionRouter);
router.use("/statistics", statisticRouter);

export default router;
