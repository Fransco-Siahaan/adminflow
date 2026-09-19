import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(80, 'Nama maksimal 80 karakter')
    .optional(),
  role: z.enum(['manager', 'staff']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;