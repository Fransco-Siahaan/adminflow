import { Request, Response } from 'express';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/users (Manager only)
 * List semua user.
 */
export const listUsers = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  }
);

/**
 * GET /api/users/:id
 * Detail user + statistik task-nya.
 */
export const getUserDetail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    // Staff hanya bisa lihat dirinya sendiri
    if (
      req.user.role === 'staff' &&
      req.user._id.toString() !== req.params.id
    ) {
      throw ApiError.forbidden('Anda hanya bisa melihat profil sendiri');
    }

    const user = await User.findById(req.params.id).select(
      'name email role createdAt'
    );
    if (!user) throw ApiError.notFound('User tidak ditemukan');

    // Statistik task user ini
    const [assignedTotal, assignedCompleted, assignedInProgress, assignedOverdue] =
      await Promise.all([
        Task.countDocuments({ assignedTo: user._id }),
        Task.countDocuments({ assignedTo: user._id, status: 'completed' }),
        Task.countDocuments({ assignedTo: user._id, status: 'in_progress' }),
        Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: 'completed' },
          deadline: { $lt: new Date() },
        }),
      ]);

    res.json({
      success: true,
      data: {
        user,
        taskStats: {
          assignedTotal,
          assignedCompleted,
          assignedInProgress,
          assignedOverdue,
        },
      },
    });
  }
);

/**
 * PATCH /api/users/:id (Manager only)
 * Update user (name, role). Tidak update password di sini.
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { name, role } = req.body as { name?: string; role?: string };

    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User tidak ditemukan');

    if (name) user.name = name;
    if (role) {
      if (!['manager', 'staff'].includes(role)) {
        throw ApiError.badRequest('Role harus "manager" atau "staff"');
      }
      // Cegah manager turunkan dirinya sendiri (biar gak terkunci)
      if (
        req.user._id.toString() === user._id.toString() &&
        user.role === 'manager' &&
        role === 'staff'
      ) {
        throw ApiError.badRequest('Anda tidak bisa menurunkan role diri sendiri');
      }
      user.role = role as 'manager' | 'staff';
    }

    await user.save();

    res.json({
      success: true,
      message: 'User berhasil diupdate',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  }
);

/**
 * DELETE /api/users/:id (Manager only)
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    // Tidak bisa hapus diri sendiri
    if (req.user._id.toString() === req.params.id) {
      throw ApiError.badRequest('Anda tidak bisa menghapus akun sendiri');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User tidak ditemukan');

    // Cek apakah user masih punya task aktif
    const activeTasks = await Task.countDocuments({
      assignedTo: user._id,
      status: { $ne: 'completed' },
    });

    if (activeTasks > 0) {
      throw ApiError.badRequest(
        `User masih punya ${activeTasks} task aktif. Selesaikan atau reassign dulu.`
      );
    }

    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: 'User dihapus',
    });
  }
);