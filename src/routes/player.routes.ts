import { Router } from 'express';
import {
  createPlayer,
  deletePlayer,
  getPlayerDetail,
  updatePlayer,
} from '../controllers/player.controller';

const router = Router();

// Fitur 4: CRUD player
router.post('/', createPlayer);
router.get('/:player_id', getPlayerDetail);
router.patch('/:player_id', updatePlayer);
router.delete('/:player_id', deletePlayer);

export default router;
