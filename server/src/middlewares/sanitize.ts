import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizer custom untuk Express 5.
 * Menghapus key yang mengandung "$" atau "." untuk mencegah NoSQL injection.
 *
 * Catatan:
 * - req.body dan req.params bisa dimodifikasi.
 * - req.query TIDAK dimodifikasi karena read-only di Express 5.
 */
export const customSanitize = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const sanitize = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete (obj as Record<string, unknown>)[key];
      } else {
        sanitize((obj as Record<string, unknown>)[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  // req.query di-skip (read-only di Express 5)

  next();
};