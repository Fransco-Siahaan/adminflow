import { Router } from 'express';
import {
  listUsers,
  getUserDetail,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    List semua user (manager only)
 * @access  Private/Manager
 */
router.get('/', authorize('manager'), listUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Detail user + stats task
 * @access  Private (manager atau self)
 */
router.get('/:id', getUserDetail);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user (manager only)
 * @access  Private/Manager
 */
router.patch(
  '/:id',
  authorize('manager'),
  validateBody(updateUserSchema),
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Hapus user (manager only)
 * @access  Private/Manager
 */
router.delete('/:id', authorize('manager'), deleteUser);

export default router;