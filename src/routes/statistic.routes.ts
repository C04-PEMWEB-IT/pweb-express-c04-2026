import { Router } from 'express';
import { getStatistics } from '../controllers/statistic.controller';

const router = Router();

router.get('/', getStatistics);

export default router;
