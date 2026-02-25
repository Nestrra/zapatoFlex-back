import config from '../config/index.js';
import createApp from './app.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[ZapatoFlex API] Server running on http://localhost:${config.port}`);
  console.log(`[ZapatoFlex API] Environment: ${config.nodeEnv}`);
  console.log(`[ZapatoFlex API] API prefix: ${config.apiPrefix}`);
});
