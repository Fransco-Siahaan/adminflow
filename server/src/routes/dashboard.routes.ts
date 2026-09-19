import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/dashboard
 * @desc    Dashboard stats + recent tasks + recent activity
 * @access  Private
 */
router.get('/', getDashboardStats);

export default router;