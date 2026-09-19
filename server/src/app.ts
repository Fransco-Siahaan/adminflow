import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env, isDev } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { customSanitize } from './middlewares/sanitize';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // ===== Security =====
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Terlalu banyak request, coba lagi nanti',
    },
  });
  app.use('/api', limiter);

  // ===== Parsers =====
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ===== Sanitization =====
  app.use(customSanitize);
  app.use(hpp());

  // ===== Static Files =====
  app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

  // ===== Health Check =====
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'AdminFlow API is running',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // ===== API Routes =====
  app.use('/api', routes);

  // ===== 404 + Error =====
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}