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
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 15000, // Increased timeout from 10s to 15s
    });
  }
  return poolInstance;
}

export async function query(text, params) {
  const currentPool = getPool();
  const client = await currentPool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Export pool for direct access if needed (e.g., for migrations)
export const pool = getPool();
