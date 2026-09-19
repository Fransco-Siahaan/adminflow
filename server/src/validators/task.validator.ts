import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Judul wajib diisi' })
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  description: z
    .string({ required_error: 'Deskripsi wajib diisi' })
    .trim()
    .min(1, 'Deskripsi wajib diisi')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional()
    .default('medium'),
  deadline: z
    .string({ required_error: 'Deadline wajib diisi' })
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .transform((val) => new Date(val)),
  assignedTo: z
    .string({ required_error: 'Staff wajib dipilih' })
    .regex(objectIdRegex, 'ID staff tidak valid'),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .transform((val) => new Date(val))
    .optional(),
  assignedTo: z.string().regex(objectIdRegex, 'ID staff tidak valid').optional(),
  status: z
    .enum(['pending', 'in_progress', 'review', 'completed', 'needs_revision'])
    .optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(
    ['pending', 'in_progress', 'review', 'completed', 'needs_revision'],
    { required_error: 'Status wajib diisi' }
  ),
});

export const listTaskQuerySchema = z.object({
  status: z
    .enum(['pending', 'in_progress', 'review', 'completed', 'needs_revision'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().regex(objectIdRegex).optional(),
  search: z.string().trim().optional(),
  deadlineFilter: z.enum(['overdue', 'today', 'upcoming', 'completed']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListTaskQuery = z.infer<typeof listTaskQuerySchema>;