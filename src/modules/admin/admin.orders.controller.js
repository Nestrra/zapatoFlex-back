import orderService from '../order/order.service.js';

/**
 * GET /api/v1/admin/orders — Lista todos los pedidos (solo ADMIN).
 * Query: limit?, offset?
 */
function listAll(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

  orderService
    .listAllOrders({ limit, offset })
    .then((orders) => res.json({ orders }))
    .catch((err) => {
      console.error('[Admin Orders] listAll error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * GET /api/v1/admin/orders/:id — Ver cualquier pedido (solo ADMIN).
 */
function getById(req, res) {
  const { id } = req.params;

  orderService
    .getOrderByIdForAdmin(id)
    .then((order) => {
      if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      res.json(order);
    })
    .catch((err) => {
      console.error('[Admin Orders] getById error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * PATCH /api/v1/admin/orders/:id/status — Actualizar estado del pedido (solo ADMIN).
 * Body: { "status": "CONFIRMED" | "SHIPPED" | "DELIVERED" | ... }
 */
function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    return res.status(400).json({ error: 'STATUS_REQUIRED' });
  }

  orderService
    .updateOrderStatus(id, status.trim().toUpperCase())
    .then((order) => {
      if (!order) {
        return res.status(400).json({
          error: 'INVALID_STATUS',
          validStatuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        });
      }
      res.json(order);
    })
    .catch((err) => {
      console.error('[Admin Orders] updateStatus error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

export default {
  listAll,
  getById,
  updateStatus,
};
