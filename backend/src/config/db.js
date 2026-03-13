const mongoose = require('mongoose');

/**
 * connectDB — connects to MongoDB via Mongoose.
 *
 * - Reads the connection string from process.env.MONGO_URI
 * - Does NOT call process.exit() on failure so the server still starts
 *   in environments where MongoDB is unavailable (e.g. CI, preview).
 * - Logs connection status clearly.
 *
 * @returns {Promise<boolean>} true if connected, false if connection failed
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      '[DB] WARNING: MONGO_URI is not set. ' +
      'The server will start but all database operations will fail. ' +
      'Create backend/.env from backend/.env.example and set MONGO_URI.'
    );
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // fail fast if Atlas/local unreachable
      socketTimeoutMS: 45000,
    });

    const { host, port, name } = mongoose.connection;
    console.log(`[DB] MongoDB connected — ${host}:${port}/${name}`);

    // ── Event listeners ────────────────────────────────────────────────────
    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[DB] MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB error:', err.message);
    });

    return true;
  } catch (err) {
    console.error(
      '[DB] Could not connect to MongoDB:', err.message,
      '\n[DB] The server is still running — fix MONGO_URI in backend/.env to enable database features.'
    );
    return false;
  }
}

module.exports = connectDB;
