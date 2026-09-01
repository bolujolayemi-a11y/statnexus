import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection pool optimized for serverless functions
let poolInstance;

function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false }, // For CockroachDB Cloud, this handles SSL properly
      // Serverless-optimized settings
      max: 5, // Increased from 1 for better performance
      idleTimeoutMillis: 10000, // Recycle idle connections quickly — cloud DBs (CockroachDB) kill idle conns and dead ones get handed out otherwise
      connectionTimeoutMillis: 15000, // Increased timeout from 10s to 15s
      // Keep connections alive so cloud providers don't terminate them mid-use
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: true,
    });

    // Prevent an unhandled 'error' event (e.g. terminated idle connection)
    // from crashing the process — the pool will open a fresh connection next query.
    poolInstance.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error (connection will be re-established):', err.message);
    });
  }
  return poolInstance;
}

export async function query(text, params) {
  const currentPool = getPool();
  const client = await currentPool.connect();
  let released = false;
  try {
    return await client.query(text, params);
  } catch (err) {
    // Retry once on a terminated connection — the pool connects fresh on the next attempt
    if (
      ['ECONNRESET', 'EPIPE', 'ECONNREFUSED', '57P01'].includes(err.code) ||
      /connection terminated|connection closed|socket hang up/i.test(err.message || '')
    ) {
      console.warn('DB connection lost, retrying once with a fresh connection...');
      if (!released) {
        try { client.release(true); } catch { /* already released */ }
        released = true;
      }
      const freshClient = await currentPool.connect();
      try {
        return await freshClient.query(text, params);
      } finally {
        freshClient.release();
      }
    }
    throw err;
  } finally {
    if (!released) client.release();
  }
}

// Export pool for direct access if needed (e.g., for migrations)
export const pool = getPool();
