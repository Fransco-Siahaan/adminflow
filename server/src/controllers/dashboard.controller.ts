import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { ActivityLog } from '../models/ActivityLog';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/dashboard
 * Statistik + recent tasks + recent activity.
 * - Manager: seluruh task.
 * - Staff: hanya task yang di-assign ke dia.
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    // Base filter: staff hanya lihat task miliknya
    const baseFilter =
      req.user.role === 'staff' ? { assignedTo: req.user._id } : {};

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // Paralel: hitung semua statistik
    const [
      totalTasks,
      pending,
      inProgress,
      review,
      completed,
      needsRevision,
      overdue,
      dueToday,
      upcoming,
      totalUsers,
      recentTasks,
      recentActivities,
    ] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'pending' }),
      Task.countDocuments({ ...baseFilter, status: 'in_progress' }),
      Task.countDocuments({ ...baseFilter, status: 'review' }),
      Task.countDocuments({ ...baseFilter, status: 'completed' }),
      Task.countDocuments({ ...baseFilter, status: 'needs_revision' }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: 'completed' },
        deadline: { $lt: now },
      }),
      Task.countDocuments({
        ...baseFilter,
        deadline: { $gte: startOfToday, $lt: endOfToday },
      }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: 'completed' },
        deadline: { $gte: now },
      }),
      req.user.role === 'manager' ? User.countDocuments() : Promise.resolve(0),
      Task.find(baseFilter)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
      ActivityLog.find(
        req.user.role === 'staff'
          ? { userId: req.user._id }
          : {}
      )
        .populate('userId', 'name email role')
        .populate('taskId', 'title status')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalTasks,
          pending,
          inProgress,
          review,
          completed,
          needsRevision,
          overdue,
          dueToday,
          upcoming,
          totalUsers,
        },
        recentTasks,
        recentActivities,
      },
    });
  }
);