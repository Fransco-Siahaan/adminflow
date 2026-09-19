import { Types } from 'mongoose';

export type UserRole = 'manager' | 'staff';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'needs_revision';

export type ActivityAction =
  | 'task_created'
  | 'task_assigned'
  | 'status_changed'
  | 'file_uploaded'
  | 'comment_added'
  | 'task_completed';

// JWT payload
export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Request user yang sudah diautentikasi
export interface AuthUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
}