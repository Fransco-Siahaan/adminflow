import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Daftar user baru
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * @route   GET /api/auth/me
 * @desc    Ambil profile user yang sedang login
 * @access  Private
 */
router.get('/me', authenticate, me);

export default router;