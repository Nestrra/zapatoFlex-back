import createApp from '../src/app.js';

const app = createApp();

/**
 * Vercel serverless function: all requests are forwarded here via vercel.json rewrites.
 * The Express app handles routing (/, /health, /api/v1/auth/...).
 */
export default app;
