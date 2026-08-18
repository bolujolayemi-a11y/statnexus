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
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout after 10s
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
