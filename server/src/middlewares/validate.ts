import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodTypeAny } from 'zod';

/**
 * Validate req.body dengan Zod schema.
 */
export const validateBody =
  (schema: ZodObject<any> | ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      next(error);
    }
  };