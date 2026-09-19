import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

/**
 * Schema validasi untuk environment variables.
 * Kalau ada yang salah, server akan langsung error dengan pesan jelas.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI wajib diisi')
    .startsWith('mongodb', 'MONGO_URI harus dimulai dengan "mongodb"'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET minimal 32 karakter untuk keamanan'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL harus berupa URL valid')
    .default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z
    .string()
    .default('5242880')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
});

/**
 * Parse & validasi.
 * Kalau gagal, ZodError akan ditampilkan dengan detail field yang salah.
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment variables tidak valid:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Helper biar gampang dipakai di file lain
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';