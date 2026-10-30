import { Router } from 'express';
import { playMatch, topUp } from '../controllers/transaction.controller';

const router = Router();

// Fitur 5: top up diamond & hadiah match (dipasang di bawah /api/players)
router.post('/:player_id/topup', topUp);
router.post('/:player_id/matches', playMatch);

export default router;
