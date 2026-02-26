import express from 'express';
import cors from 'cors';
import config from '../config/index.js';
import authRoutes from './modules/auth/auth.routes.js';

/**
 * Creates and configures the Express application.
 */
function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check (useful for cloud deployment and load balancers)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'zapatoflex-api', timestamp: new Date().toISOString() });
  });

  // Root: API info
  app.get('/', (_req, res) => {
    res.json({
      name: 'ZapatoFlex API',
      version: '1.0.0',
      docs: `${config.apiPrefix}`,
      health: '/health',
    });
  });

  // API v1: modules
  app.use(`${config.apiPrefix}/auth`, authRoutes);

  return app;
}

export default createApp;
