import orderService from './order.service.js';

/**
 * POST /api/v1/orders/checkout — Checkout: carrito → pedido + pago simulado.
 * Body: { "shippingAddress"? (opcional), "paymentMethod": "CONTRA_ENTREGA" }
 */
function checkout(req, res) {
  const userId = req.user.userId;
  const { shippingAddress, paymentMethod } = req.body;

  orderService
    .checkout(userId, { shippingAddress, paymentMethod: paymentMethod || 'CONTRA_ENTREGA' })
    .then((result) => {
      if (!result.success) {
        if (result.error === 'CART_EMPTY') {
          return res.status(400).json({ error: result.error });
        }
        if (result.error === 'UNSUPPORTED_PAYMENT_METHOD') {
          return res.status(400).json({ error: result.error, supported: result.supported });
        }
        if (result.error === 'INSUFFICIENT_STOCK') {
          return res.status(400).json({
            error: result.error,
            productId: result.productId,
            size: result.size,
            available: result.available,
          });
        }
        if (result.error === 'PAYMENT_FAILED') {
          return res.status(402).json({ error: result.error });
        }
        return res.status(400).json({ error: result.error });
      }
      res.status(201).json(result.order);
    })
    .catch((err) => {
      if (err.message && err.message.startsWith('INSUFFICIENT_STOCK:')) {
        const available = err.message.split(':')[1];
        return res.status(400).json({ error: 'INSUFFICIENT_STOCK', available: Number(available) });
      }
      console.error('[Order] checkout error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * GET /api/v1/orders — Lista mis pedidos.
 */
function listMine(req, res) {
  const userId = req.user.userId;

  orderService
    .getMyOrders(userId)
    .then((orders) => res.json({ orders }))
    .catch((err) => {
      console.error('[Order] listMine error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * GET /api/v1/orders/:id — Detalle de un pedido (solo si es del usuario).
 */
function getById(req, res) {
  const userId = req.user.userId;
  const { id } = req.params;

  orderService
    .getOrderById(id, userId)
    .then((order) => {
      if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      res.json(order);
    })
    .catch((err) => {
      console.error('[Order] getById error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

export default {
  checkout,
  listMine,
  getById,
};
