import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Attachment } from '../models/Attachment';
import { Task } from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logActivity } from '../utils/activityLogger';
import { env } from '../config/env';

/**
 * Helper: cek akses user ke task.
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
 * POST /api/tasks/:taskId/attachments
 * Upload file ke task.
 */
export const uploadAttachment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const taskId = req.params.taskId as string;

    // Cek file ada
    if (!req.file) {
      throw ApiError.badRequest('File wajib diupload');
    }

    // Cek akses
    await assertTaskAccess(taskId, req.user._id.toString(), req.user.role);

    // Bangun URL (relative path untuk prototype)
    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      taskId,
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    await logActivity({
      taskId,
      userId: req.user._id,
      action: 'file_uploaded',
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });

    await attachment.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'File berhasil diupload',
      data: { attachment },
    });
  }
);

/**
 * GET /api/tasks/:taskId/attachments
 * List attachment pada task.
 */
export const listAttachments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const { taskId } = req.params;

    await assertTaskAccess(taskId, req.user._id.toString(), req.user.role);

    const attachments = await Attachment.find({ taskId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { attachments },
    });
  }
);

/**
 * DELETE /api/attachments/:id
 * Hapus attachment + file fisik.
 * - Owner atau manager bisa hapus.
 */
export const deleteAttachment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw ApiError.unauthorized();

    const attachment = await Attachment.findById(req.params.id as string);
    if (!attachment) throw ApiError.notFound('Attachment tidak ditemukan');

    const isOwner = attachment.userId.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager';

    if (!isOwner && !isManager) {
      throw ApiError.forbidden('Anda tidak punya akses hapus file ini');
    }

    // Hapus file fisik dari disk
    const filename = path.basename(attachment.fileUrl);
    const filePath = path.join(process.cwd(), env.UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Hapus record
    await Attachment.deleteOne({ _id: attachment._id });

    res.json({
      success: true,
      message: 'Attachment dihapus',
    });
  }
);