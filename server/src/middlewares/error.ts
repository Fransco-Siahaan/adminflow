import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { isDev } from '../config/env';

/**
 * 404 handler — dipakai setelah semua route.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} tidak ditemukan`));
};

/**
 * Global error handler — WAJIB di paling akhir.
 * Tangkap semua error yang di-throw atau di-forward via next(err).
 */
export const errorHandler = (
  err: Error | ApiError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  // ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Zod validation error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validasi gagal';
    details = err.flatten().fieldErrors;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Data tidak valid';
    details = (err as any).errors;
  }
  // Mongoose duplicate key
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyPattern || {})[0];
    message = `Data dengan ${field} tersebut sudah ada`;
  }
  // Mongoose CastError (misal ObjectId tidak valid)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Format ID tidak valid';
  }
  // Fallback
  else if (err instanceof Error) {
    message = err.message;
  }

  // Log di development
  if (isDev) {
    console.error(`❌ [${statusCode}] ${message}`);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(isDev && statusCode === 500 ? { stack: err.stack } : {}),
  });
};