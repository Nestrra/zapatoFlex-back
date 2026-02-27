import orderRepository from './order.repository.js';
import paymentService from '../payment/payment.service.js';
import paymentRepository from '../payment/payment.repository.js';
import cartRepository from '../cart/cart.repository.js';
import catalogRepository from '../catalog/catalog.repository.js';

const SHIPPING_COST = 0; // COP; puede calcularse después por zona

/**
 * Checkout: convierte el carrito en pedido, procesa pago (simulado) y vacía el carrito.
 * Por ahora solo paymentMethod = CONTRA_ENTREGA.
 */
async function checkout(userId, { shippingAddress, paymentMethod = 'CONTRA_ENTREGA' } = {}) {
  const cart = await cartRepository.getCartWithItems(userId);
  if (!cart.items || cart.items.length === 0) {
    return { success: false, error: 'CART_EMPTY' };
  }

  const method = String(paymentMethod).toUpperCase().replace(/-/g, '_');
  if (method !== 'CONTRA_ENTREGA') {
    return { success: false, error: 'UNSUPPORTED_PAYMENT_METHOD', supported: ['CONTRA_ENTREGA'] };
  }

  for (const item of cart.items) {
    const available = await catalogRepository.getAvailableStock(item.productId, item.size);
    if (available < item.quantity) {
      return {
        success: false,
        error: 'INSUFFICIENT_STOCK',
        productId: item.productId,
        size: item.size,
        available,
      };
    }
  }

  const subtotal = cart.subtotal;
  const shippingCost = SHIPPING_COST;
  const total = subtotal + shippingCost;

  const order = await orderRepository.createOrder({
    userId,
    subtotal,
    shippingCost,
    total,
    shippingAddress: shippingAddress || null,
  });

  for (const item of cart.items) {
    await orderRepository.createOrderItem(
      order.id,
      item.productId,
      item.size,
      item.quantity,
      item.unitPrice
    );
    await catalogRepository.deductStock(item.productId, item.size, item.quantity);
  }

  const paymentResult = await paymentService.processPayment(order.id, total, method);
  if (!paymentResult.success) {
    return { success: false, error: 'PAYMENT_FAILED' };
  }

  await cartRepository.clearCart(userId);

  const orderWithDetails = await orderRepository.findById(order.id);
  orderWithDetails.payment = paymentResult.payment;
  return { success: true, order: orderWithDetails };
}

async function getOrderById(orderId, userId) {
  const order = await orderRepository.findById(orderId);
  if (!order) return null;
  if (order.userId !== userId) return null;
  order.payment = await paymentRepository.findByOrderId(orderId);
  return order;
}

async function getMyOrders(userId, limit = 50) {
  return orderRepository.findByUserId(userId, { limit });
}

export default {
  checkout,
  getOrderById,
  getMyOrders,
};
