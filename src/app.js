import express from 'express';
import cors from 'cors';
import config from '../config/index.js';
import db from './db/client.js';
import authRoutes from './modules/auth/auth.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';

/**
 * Creates and configures the Express application.
 */
function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check (incluye estado de la BD si está configurada)
  app.get('/health', async (_req, res) => {
    const payload = { status: 'ok', service: 'zapatoflex-api', timestamp: new Date().toISOString() };
    if (config.databaseUrl) {
      try {
        await db.testConnection();
        payload.db = 'ok';
      } catch (err) {
        payload.db = 'error';
        payload.dbMessage = err.message;
      }
    }
    res.json(payload);
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
  app.use(`${config.apiPrefix}/products`, catalogRoutes);
  app.use(`${config.apiPrefix}/cart`, cartRoutes);
  app.use(`${config.apiPrefix}/orders`, orderRoutes);

  return app;
}

export default createApp;
