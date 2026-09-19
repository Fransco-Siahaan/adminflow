import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper untuk async handler, biar error otomatis di-forward ke error middleware.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };