import { Router } from "express";
import heroRouter from "./hero.routes";
import playerRouter from "./player.routes";
import skinRouter from "./skin.routes";
import statisticRouter from "./statistic.routes";
import transactionRouter from "./transaction.routes";

const router = Router();

// Route Hero & Skin (Tugas Anggota 2)
router.use("/heroes", heroRouter);
router.use("/skins", skinRouter);

// Route Player CRUD (Fitur 4), transaksi (Fitur 5 & 6), dan Statistic (Fitur 7)
router.use("/players", playerRouter);
router.use("/players", transactionRouter);
router.use("/statistics", statisticRouter);

export default router;
