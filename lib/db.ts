/**
 * lib/db.ts
 * Singleton MongoDB connection using Mongoose.
 * Caches the connection across hot-reloads in Next.js dev mode.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Missing MONGODB_URI environment variable. ' +
    'Add it to your project\'s Vars in the settings panel.'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global to cache connection across HMR
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
