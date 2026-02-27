import cartService from './cart.service.js';

/**
 * GET /api/v1/cart — Carrito del usuario (requiere Auth).
 */
function getCart(req, res) {
  const userId = req.user.userId;

  cartService
    .getCart(userId)
    .then((cart) => res.json(cart))
    .catch((err) => {
      console.error('[Cart] getCart error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * POST /api/v1/cart/items — Añadir ítem al carrito. Body: { productId, size, quantity }.
 */
function addItem(req, res) {
  const userId = req.user.userId;
  const { productId, size, quantity } = req.body;

  if (!productId || !size) {
    return res.status(400).json({ error: 'PRODUCT_ID_AND_SIZE_REQUIRED' });
  }

  cartService
    .addToCart(userId, { productId, size, quantity })
    .then((result) => {
      if (!result.success) {
        if (result.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: result.error });
        if (result.error === 'INSUFFICIENT_STOCK') {
          return res.status(400).json({ error: result.error, available: result.available });
        }
        return res.status(400).json({ error: result.error });
      }
      res.status(201).json(result.cart);
    })
    .catch((err) => {
      console.error('[Cart] addItem error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * PUT /api/v1/cart/items/:itemId — Actualizar cantidad. Body: { quantity }.
 */
function updateItem(req, res) {
  const userId = req.user.userId;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ error: 'QUANTITY_REQUIRED' });
  }

  cartService
    .updateQuantity(userId, itemId, quantity)
    .then((result) => {
      if (!result.success) {
        if (result.error === 'ITEM_NOT_FOUND' || result.error === 'FORBIDDEN') {
          return res.status(404).json({ error: result.error });
        }
        if (result.error === 'INSUFFICIENT_STOCK') {
          return res.status(400).json({ error: result.error, available: result.available });
        }
        return res.status(400).json({ error: result.error });
      }
      res.json(result.cart);
    })
    .catch((err) => {
      console.error('[Cart] updateItem error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

/**
 * DELETE /api/v1/cart/items/:itemId — Quitar ítem del carrito.
 */
function removeItem(req, res) {
  const userId = req.user.userId;
  const { itemId } = req.params;

  cartService
    .removeFromCart(userId, itemId)
    .then((result) => {
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      res.json(result.cart);
    })
    .catch((err) => {
      console.error('[Cart] removeItem error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

export default {
  getCart,
  addItem,
  updateItem,
  removeItem,
};
