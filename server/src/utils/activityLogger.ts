import { Types } from 'mongoose';
import { ActivityLog } from '../models/ActivityLog';
import { ActivityAction } from '../types';

interface LogParams {
  taskId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
}

/**
 * Catat aktivitas task. Tidak throw kalau gagal — hanya log error.
 * (Activity log tidak boleh mengganggu flow utama.)
 */
export async function logActivity({
  taskId,
  userId,
  action,
  metadata = {},
}: LogParams): Promise<void> {
  try {
    await ActivityLog.create({ taskId, userId, action, metadata });
  } catch (error) {
    console.error('❌ Gagal mencatat aktivitas:', error);
  }
}