import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logActivity } from '../utils/activityLogger';
import { CreateCommentInput } from '../validators/comment.validator';

/**
 * Helper: cek akses user ke task.
 * Manager: semua task. Staff: hanya task yang di-assign ke dia.
 */
async function assertTaskAccess(
  taskId: string,
  userId: string,
  role: string
): Promise<void> {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task tidak ditemukan');

  if (role !== 'manager' && task.assignedTo.toString() !== userId) {
    throw ApiError.forbidden('Anda tidak punya akses ke task ini');
  }
}

/**
 * POST /api/tasks/:taskId/comments
 * Tambah komentar pada task.
 */
export const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { taskId } = req.params;
    const { comment } = req.body as CreateCommentInput;

    // Cek akses
    await assertTaskAccess(taskId, req.user._id.toString(), req.user.role);

    const newComment = await Comment.create({
      taskId,
      userId: req.user._id,
      comment,
    });

    await logActivity({
      taskId,
      userId: req.user._id,
      action: 'comment_added',
      metadata: { commentId: newComment._id.toString() },
    });

    await newComment.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Komentar ditambahkan',
      data: { comment: newComment },
    });
  }
);

/**
 * GET /api/tasks/:taskId/comments
 * List semua komentar pada task.
 */
export const listComments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { taskId } = req.params;

    await assertTaskAccess(taskId, req.user._id.toString(), req.user.role);

    const comments = await Comment.find({ taskId })
      .populate('userId', 'name email role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { comments },
    });
  }
);

/**
 * DELETE /api/comments/:id
 * Hapus komentar.
 * - User hanya bisa hapus komentarnya sendiri.
 * - Manager bisa hapus komentar apapun.
 */
export const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const comment = await Comment.findById(req.params.id);
    if (!comment) throw ApiError.notFound('Komentar tidak ditemukan');

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager';

    if (!isOwner && !isManager) {
      throw ApiError.forbidden('Anda hanya bisa menghapus komentar sendiri');
    }

    await Comment.deleteOne({ _id: comment._id });

    res.json({
      success: true,
      message: 'Komentar dihapus',
    });
  }
);