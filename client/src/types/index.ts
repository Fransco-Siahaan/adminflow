// ===== User =====
export type UserRole = 'manager' | 'staff';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// ===== Task =====
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'needs_revision';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdBy: User;
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

// ===== Comment =====
export interface Comment {
  _id: string;
  taskId: string;
  userId: User;
  comment: string;
  createdAt: string;
}

// ===== Attachment =====
export interface Attachment {
  _id: string;
  taskId: string;
  userId: User;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

// ===== Activity =====
export type ActivityAction =
  | 'task_created'
  | 'task_assigned'
  | 'status_changed'
  | 'file_uploaded'
  | 'comment_added'
  | 'task_completed';

export interface Activity {
  _id: string;
  taskId: Pick<Task, '_id' | 'title' | 'status'> | string | null;
  userId: User;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ===== Task Detail =====
export interface TaskDetail {
  task: Task;
  comments: Comment[];
  attachments: Attachment[];
  activities: Activity[];
}

// ===== Dashboard =====
export interface DashboardStats {
  totalTasks: number;
  pending: number;
  inProgress: number;
  review: number;
  completed: number;
  needsRevision: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
  totalUsers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  recentActivities: Activity[];
}

// ===== API Responses =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ===== Auth =====
export interface AuthResponse {
  user: User;
  token: string;
}