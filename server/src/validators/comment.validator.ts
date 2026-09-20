import { z } from 'zod';

export const createCommentSchema = z.object({
  comment: z
    .string({ error: 'Komentar wajib diisi' })
    .trim()
    .min(1, 'Komentar tidak boleh kosong')
    .max(2000, 'Komentar maksimal 2000 karakter'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;