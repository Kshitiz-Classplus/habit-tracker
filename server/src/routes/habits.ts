import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getHabits,
  getArchivedHabits,
  createHabit,
  deleteHabit,
  toggleArchive,
  upsertEntry,
  getAnalytics,
} from '../controllers/habitController';

const router = Router();

router.use(authMiddleware);

router.get('/', getHabits);
router.get('/archived', getArchivedHabits);
router.post('/', createHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/archive', toggleArchive);
router.patch('/:id/entry', upsertEntry);
router.get('/:id/analytics', getAnalytics);

export default router;
