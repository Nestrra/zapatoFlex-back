import pg from 'pg';
import config from '../../config/index.js';

const { Pool } = pg;

let pool = null;

/**
 * Singleton: una única instancia del pool de conexiones PostgreSQL.
 * Se crea en la primera llamada a getPool().
 */
function getPool() {
  if (!pool) {
    if (!config.databaseUrl) {
      throw new Error('Database not configured: set DB_* env vars or DATABASE_URL');
    }
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

/**
 * Prueba la conexión a la BD (útil al arranque o en /health).
 */
async function testConnection() {
  const client = await getPool().connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

export default {
  getPool,
  testConnection,
};
