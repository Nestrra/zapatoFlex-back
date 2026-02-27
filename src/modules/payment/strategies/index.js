/**
 * Factory de estrategias de pago (patrón Strategy).
 * Por ahora solo CONTRA_ENTREGA; escalable para CREDIT_CARD, PSE, etc.
 */
import contraEntregaStrategy from './contra-entrega.js';

const STRATEGIES = {
  CONTRA_ENTREGA: contraEntregaStrategy,
};

export function getPaymentStrategy(method) {
  const normalized = String(method).toUpperCase().replace(/-/g, '_');
  const strategy = STRATEGIES[normalized];
  if (!strategy) {
    throw new Error(`UNSUPPORTED_PAYMENT_METHOD:${method}`);
  }
  return strategy;
}

export function getSupportedMethods() {
  return Object.keys(STRATEGIES);
}
