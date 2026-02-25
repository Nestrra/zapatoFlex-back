import express from 'express';
import cors from 'cors';
import config from '../config/index.js';

/**
 * Creates and configures the Express application.
 * No business modules yet - only global middleware and a health check.
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

  return app;
}

export default createApp;
