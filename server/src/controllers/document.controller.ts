import { Request, Response } from 'express';
import { Attachment } from '../models/Attachment';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/attachments
 * List semua attachment.
 * - Manager: semua file.
 * - Staff: hanya file dari task yang di-assign ke dia.
 *
 * Query:
 * - search: cari di fileName
 * - mimeType: filter by mime type prefix (contoh: "image/", "application/pdf")
 * - page, limit: pagination
 */
export const listAllAttachments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { search, mimeType, page: pageParam, limit: limitParam } = req.query;

    // Pagination
    const page = Math.max(parseInt((pageParam as string) || '1', 10), 1);
    const limit = Math.min(
      parseInt((limitParam as string) || '30', 10),
      100
    );
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = {};

    // Staff: hanya file dari task yang di-assign ke dia
    if (req.user.role === 'staff') {
      const taskIds = await Task.find({ assignedTo: req.user._id }).distinct(
        '_id'
      );
      filter.taskId = { $in: taskIds };
    }

    // Filter by mime type
    if (mimeType) {
      filter.mimeType = { $regex: `^${mimeType}` };
    }

    // Search by fileName
    if (search) {
      filter.fileName = { $regex: search, $options: 'i' };
    }

    const [attachments, total] = await Promise.all([
      Attachment.find(filter)
        .populate('userId', 'name email role')
        .populate('taskId', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Attachment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        attachments,
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