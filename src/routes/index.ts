import { Router } from 'express';
import statisticRouter from './statistic.routes';
import transactionRouter from './transaction.routes';

const router = Router();

// Anggota 2 & 3 menambahkan route hero, skin, dan player di sini setelah selesai
router.use('/players', transactionRouter);
router.use('/statistics', statisticRouter);

export default router;
