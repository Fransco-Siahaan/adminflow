import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User, IUser } from '../models/User';
import { UserRole, JwtPayload } from '../types';

/**
 * Extend Request supaya bisa attach user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      jwtPayload?: JwtPayload;
    }
  }
}

/**
 * Middleware: cek JWT valid, attach user ke req.user.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ambil token dari Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Token tidak valid');
    }

    // Verify
    const payload = verifyToken(token);

    // Cek user masih ada di DB
    const user = await User.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized('User tidak ditemukan');
    }

    req.user = user;
    req.jwtPayload = payload;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token sudah expired'));
    }
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Token tidak valid'));
    }
    next(error);
  }
};

/**
 * Middleware: batasi akses berdasarkan role.
 * Pakai setelah `authenticate`.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Belum login'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Role "${req.user.role}" tidak punya akses ke endpoint ini`)
      );
    }
    next();
  };
};