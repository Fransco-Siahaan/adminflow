import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Attachment } from '../models/Attachment';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logActivity } from '../utils/activityLogger';
import {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateStatusInput,
  ListTaskQuery,
} from '../validators/task.validator';

/**
 * POST /api/tasks (Manager only)
 * Manager membuat task baru dan assign ke staff.
 */
export const createTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description, priority, deadline, assignedTo } =
      req.body as CreateTaskInput;

    if (!req.user) throw ApiError.unauthorized();

    // Cek assigned user ada & rolenya staff/manager
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw ApiError.badRequest('User yang di-assign tidak ditemukan');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      assignedTo,
      createdBy: req.user._id,
    });

    // Log aktivitas
    await logActivity({
      taskId: task._id,
      userId: req.user._id,
      action: 'task_created',
      metadata: { title, assignedTo },
    });

    await logActivity({
      taskId: task._id,
      userId: req.user._id,
      action: 'task_assigned',
      metadata: { assignedTo, assignedToName: assignedUser.name },
    });

    // Populate sebelum return
    await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Task berhasil dibuat',
      data: { task },
    });
  }
);

/**
 * GET /api/tasks
 * Manager: lihat semua task. Staff: hanya task yang di-assign ke dia.
 */
export const listTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const query = req.query as unknown as ListTaskQuery;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Staff hanya lihat task dirinya
    if (req.user.role === 'staff') {
      filter.assignedTo = req.user._id;
    } else if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Deadline filter
    if (query.deadlineFilter) {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      switch (query.deadlineFilter) {
        case 'overdue':
          filter.deadline = { $lt: now };
          filter.status = { $ne: 'completed' };
          break;
        case 'today':
          filter.deadline = { $gte: startOfToday, $lt: endOfToday };
          break;
        case 'upcoming':
          filter.deadline = { $gte: now };
          filter.status = { $ne: 'completed' };
          break;
        case 'completed':
          filter.status = 'completed';
          break;
      }
    }

    // Pagination
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
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

/**
 * GET /api/tasks/:id
 * Detail task + komentar + attachment + activity log.
 */
export const getTaskDetail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) throw ApiError.notFound('Task tidak ditemukan');

    // Staff hanya boleh lihat task dirinya
    if (
      req.user.role === 'staff' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      throw ApiError.forbidden('Anda tidak punya akses ke task ini');
    }

    // Ambil komentar, attachment, activity (paralel)
    const [comments, attachments, activities] = await Promise.all([
      Comment.find({ taskId: task._id })
        .populate('userId', 'name email role')
        .sort({ createdAt: 1 }),
      Attachment.find({ taskId: task._id })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 }),
      // Ambil dari ActivityLog — nanti kita tambah importnya
      (await import('../models/ActivityLog')).ActivityLog.find({
        taskId: task._id,
      })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    res.json({
      success: true,
      data: {
        task,
        comments,
        attachments,
        activities,
      },
    });
  }
);

/**
 * PATCH /api/tasks/:id
 * Update task (manager only).
 */
export const updateTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const updates = req.body as UpdateTaskInput;

    const task = await Task.findById(req.params.id);
    if (!task) throw ApiError.notFound('Task tidak ditemukan');

    // Track changes untuk activity log
    const changes: Record<string, unknown> = {};

    if (updates.title && updates.title !== task.title) {
      changes.title = { from: task.title, to: updates.title };
      task.title = updates.title;
    }
    if (updates.description && updates.description !== task.description) {
      changes.description = 'updated';
      task.description = updates.description;
    }
    if (updates.priority && updates.priority !== task.priority) {
      changes.priority = { from: task.priority, to: updates.priority };
      task.priority = updates.priority;
    }
    if (updates.deadline && updates.deadline.getTime() !== task.deadline.getTime()) {
      changes.deadline = {
        from: task.deadline.toISOString(),
        to: updates.deadline.toISOString(),
      };
      task.deadline = updates.deadline;
    }
    if (
      updates.assignedTo &&
      updates.assignedTo !== task.assignedTo.toString()
    ) {
      const newAssignee = await User.findById(updates.assignedTo);
      if (!newAssignee) throw ApiError.badRequest('User tidak ditemukan');
      changes.assignedTo = {
        from: task.assignedTo.toString(),
        to: updates.assignedTo,
      };
      task.assignedTo = newAssignee._id;
    }

    await task.save();

    if (Object.keys(changes).length > 0) {
      await logActivity({
        taskId: task._id,
        userId: req.user._id,
        action: 'task_assigned',
        metadata: { changes },
      });
    }

    await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);

    res.json({
      success: true,
      message: 'Task berhasil diupdate',
      data: { task },
    });
  }
);

/**
 * PATCH /api/tasks/:id/status
 * Update status task.
 * - Staff: hanya boleh set in_progress atau review (untuk task dirinya).
 * - Manager: boleh set status apapun (untuk review).
 */
export const updateStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { status } = req.body as UpdateStatusInput;

    const task = await Task.findById(req.params.id);
    if (!task) throw ApiError.notFound('Task tidak ditemukan');

    const isManager = req.user.role === 'manager';
    const isAssignedStaff =
      task.assignedTo.toString() === req.user._id.toString();

    // Staff hanya untuk task dirinya
    if (!isManager && !isAssignedStaff) {
      throw ApiError.forbidden('Anda tidak punya akses ke task ini');
    }

    // Staff hanya boleh set in_progress atau review
    if (!isManager && !['in_progress', 'review'].includes(status)) {
      throw ApiError.forbidden(
        'Staff hanya bisa mengubah status ke "in_progress" atau "review"'
      );
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await logActivity({
      taskId: task._id,
      userId: req.user._id,
      action: status === 'completed' ? 'task_completed' : 'status_changed',
      metadata: { from: oldStatus, to: status },
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);

    res.json({
      success: true,
      message: `Status diubah dari "${oldStatus}" ke "${status}"`,
      data: { task },
    });
  }
);

/**
 * DELETE /api/tasks/:id (Manager only)
 */
export const deleteTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const task = await Task.findById(req.params.id);
    if (!task) throw ApiError.notFound('Task tidak ditemukan');

    // Hapus task + related data
    await Promise.all([
      Task.deleteOne({ _id: task._id }),
      Comment.deleteMany({ taskId: task._id }),
      Attachment.deleteMany({ taskId: task._id }),
    ]);

    res.json({
      success: true,
      message: 'Task berhasil dihapus',
    });
  }
);