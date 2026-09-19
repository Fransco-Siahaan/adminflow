import { Request, Response } from 'express';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

/**
 * POST /api/auth/register
 * Daftar user baru. Default role: staff.
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body as RegisterInput;

    // Cek email sudah terdaftar
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('Email sudah terdaftar');
    }

    // Buat user (password di-hash otomatis oleh pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  }
);

/**
 * POST /api/auth/login
 * Login dengan email & password.
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginInput;

    // Cari user + include password (karena select: false di schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Email atau password salah');
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Email atau password salah');
    }

    // Generate token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  }
);

/**
 * GET /api/auth/me
 * Ambil profile user yang sedang login.
 */
export const me = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized('Belum login');
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
        },
      },
    });
  }
);