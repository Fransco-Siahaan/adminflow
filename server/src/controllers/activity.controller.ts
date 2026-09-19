import { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/activities
 * Semua aktivitas.
 * - Manager: semua aktivitas.
 * - Staff: hanya aktivitas task yang di-assign ke dia.
 */
export const listActivities = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { taskId, limit: limitParam, page: pageParam } = req.query;

    // Pagination
    const page = Math.max(parseInt((pageParam as string) || '1', 10), 1);
    const limit = Math.min(
      parseInt((limitParam as string) || '30', 10),
      100
    );
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = {};

    // Staff: hanya aktivitas dari task yang dia kerjakan
    if (req.user.role === 'staff') {
      const taskIds = await Task.find({ assignedTo: req.user._id }).distinct(
        '_id'
      );
      filter.taskId = { $in: taskIds };
    }

    // Filter by task
    if (taskId) filter.taskId = taskId;

    const [activities, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('userId', 'name email role')
        .populate('taskId', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
);