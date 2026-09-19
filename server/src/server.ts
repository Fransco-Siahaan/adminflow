import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  try {
    // 1. Konek DB
    await connectDB();

    // 2. Buat Express app
    const app = createApp();

    // 3. Listen
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 AdminFlow API berjalan di http://localhost:${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
    });

    // ===== Graceful shutdown =====
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} diterima, menutup server...`);
      server.close(async () => {
        await disconnectDB();
        console.log('👋 Server ditutup dengan rapi');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Bootstrap gagal:', error);
    process.exit(1);
  }
}

bootstrap();