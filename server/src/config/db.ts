import mongoose from 'mongoose';
import { env, isDev } from './env';

/**
 * Konek ke MongoDB dengan Mongoose.
 * Dipanggil sekali saat server start.
 */
export async function connectDB(): Promise<void> {
  try {
    // Strict mode: field yang tidak didefinisikan di schema tidak akan disimpan
    mongoose.set('strictQuery', true);

    // Debug mode di development
    if (isDev) {
      mongoose.set('debug', false); // ubah ke true kalau mau lihat semua query
    }

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // timeout 5s kalau MongoDB tidak jalan
    });

    console.log(`✅ MongoDB terhubung: ${conn.connection.host}/${conn.connection.name}`);

    // Handle event disconnect
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });
  } catch (error) {
    console.error('❌ Gagal konek ke MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown — tutup koneksi saat server mati.
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection ditutup');
}