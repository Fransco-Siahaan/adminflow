import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(80, 'Nama maksimal 80 karakter'),
  email: z
    .string({ error: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .email('Format email tidak valid'),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter'),
  role: z.enum(['manager', 'staff']).optional().default('staff'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .email('Format email tidak valid'),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;