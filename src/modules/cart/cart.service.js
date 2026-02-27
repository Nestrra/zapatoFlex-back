import cartRepository from './cart.repository.js';
import catalogRepository from '../catalog/catalog.repository.js';

/**
 * Carrito del usuario con ítems y subtotal.
 */
async function getCart(userId) {
  return cartRepository.getCartWithItems(userId);
}

/**
 * Añade producto al carrito. Valida stock y usa precio actual del producto (COP).
 */
async function addToCart(userId, { productId, size, quantity }) {
  const product = await catalogRepository.findById(productId);
  if (!product) return { success: false, error: 'PRODUCT_NOT_FOUND' };

  const available = await catalogRepository.getAvailableStock(productId, size);
  const qty = Math.max(1, Number(quantity) || 1);
  if (available < qty) {
    return { success: false, error: 'INSUFFICIENT_STOCK', available };
  }

  const cart = await cartRepository.findOrCreateCart(userId);
  await cartRepository.addItem(cart.id, productId, size, qty, product.price);
  return { success: true, cart: await cartRepository.getCartWithItems(userId) };
}

/**
 * Actualiza cantidad de un ítem. Valida que pertenezca al usuario y que haya stock.
 */
async function updateQuantity(userId, itemId, quantity) {
  const item = await cartRepository.findCartItemById(itemId);
  if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };

  const belongsToUser = await cartRepository.isItemInUserCart(itemId, userId);
  if (!belongsToUser) return { success: false, error: 'FORBIDDEN' };

  const qty = Math.max(1, Number(quantity) || 1);
  const available = await catalogRepository.getAvailableStock(item.productId, item.size);
  if (available < qty) {
    return { success: false, error: 'INSUFFICIENT_STOCK', available };
  }

  await cartRepository.updateItemQuantity(itemId, qty);
  return { success: true, cart: await cartRepository.getCartWithItems(userId) };
}

/**
 * Elimina un ítem del carrito.
 */
async function removeFromCart(userId, itemId) {
  const belongsToUser = await cartRepository.isItemInUserCart(itemId, userId);
  if (!belongsToUser) return { success: false, error: 'ITEM_NOT_FOUND_OR_FORBIDDEN' };

  const removed = await cartRepository.removeItem(itemId);
  if (!removed) return { success: false, error: 'ITEM_NOT_FOUND' };
  return { success: true, cart: await cartRepository.getCartWithItems(userId) };
}

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};
