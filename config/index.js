import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
  apiPrefix: process.env.API_PREFIX,
  databaseUrl: process.env.DATABASE_URL,
};

export default config;
