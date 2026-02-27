import paymentRepository from './payment.repository.js';
import { getPaymentStrategy } from './strategies/index.js';

/**
 * Servicio de pagos. Simula pago según método; preparado para pasarelas.
 * @param {string} orderId
 * @param {number} amount - Monto en COP
 * @param {string} paymentMethod - CONTRA_ENTREGA | (futuro: CREDIT_CARD, PSE, etc.)
 */
async function processPayment(orderId, amount, paymentMethod) {
  const strategy = getPaymentStrategy(paymentMethod);
  const result = await strategy.process(orderId, amount);

  const status = result.success ? (result.status || 'APPROVED') : (result.status || 'REJECTED');
  const payment = await paymentRepository.create({
    orderId,
    amount,
    paymentMethod: String(paymentMethod).toUpperCase().replace(/-/g, '_'),
    status,
    externalReference: result.externalReference ?? null,
  });

  return { success: result.success, payment };
}

export default {
  processPayment,
};
