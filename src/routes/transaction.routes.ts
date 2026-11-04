import { Router } from 'express';
import { buyHero } from '../controllers/purchase.controller';
import { playMatch, topUp } from '../controllers/transaction.controller';

const router = Router();

// Fitur 5: top up diamond & hadiah match (dipasang di bawah /api/players)
router.post('/:player_id/topup', topUp);
router.post('/:player_id/matches', playMatch);

// Fitur 6: beli hero memakai BP atau Diamond
router.post('/:player_id/heroes', buyHero);

export default router;
