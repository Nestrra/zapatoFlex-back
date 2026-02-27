import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 5432;
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'zapatoflex';

// Si existe DATABASE_URL se usa; si no, se construye desde variables sueltas
const databaseUrl =
  process.env.DATABASE_URL ||
  (dbPassword
    ? `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${encodeURIComponent(dbName)}`
    : null);

const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  databaseUrl,
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  },
};

export default config;
