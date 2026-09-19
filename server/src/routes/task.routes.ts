import { Router } from 'express';
import {
  createTask,
  listTasks,
  getTaskDetail,
  updateTask,
  updateStatus,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from '../validators/task.validator';

const router = Router();

// Semua route task butuh login
router.use(authenticate);

/**
 * @route   POST /api/tasks
 * @desc    Create task (manager only)
 */
router.post('/', authorize('manager'), validateBody(createTaskSchema), createTask);

/**
 * @route   GET /api/tasks
 * @desc    List tasks (manager: all; staff: own)
 */
router.get('/', listTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Detail task + comments + attachments + activity
 */
router.get('/:id', getTaskDetail);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task (manager only)
 */
router.patch('/:id', authorize('manager'), validateBody(updateTaskSchema), updateTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update status (staff/manager)
 */
router.patch('/:id/status', validateBody(updateStatusSchema), updateStatus);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (manager only)
 */
router.delete('/:id', authorize('manager'), deleteTask);

export default router;