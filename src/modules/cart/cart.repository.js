import db from '../../db/client.js';

const CARTS = 'carts';
const CART_ITEMS = 'cart_items';

function rowToCart(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCartItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    cartId: row.cart_id,
    productId: row.product_id,
    size: row.size,
    quantity: row.quantity,
    unitPrice: parseFloat(row.unit_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findCartByUserId(userId) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT * FROM ${CARTS} WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rowToCart(result.rows[0] || null);
}

async function createCart(userId) {
  const pool = db.getPool();
  const result = await pool.query(
    `INSERT INTO ${CARTS} (user_id) VALUES ($1) RETURNING *`,
    [userId]
  );
  return rowToCart(result.rows[0]);
}

async function findOrCreateCart(userId) {
  let cart = await findCartByUserId(userId);
  if (!cart) cart = await createCart(userId);
  return cart;
}

/**
 * Carrito del usuario con ítems y datos del producto (nombre, precio actual, imagen).
 */
async function getCartWithItems(userId) {
  const cart = await findOrCreateCart(userId);
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT ci.*, p.name as product_name, p.price as product_price, p.image_url as product_image_url
     FROM ${CART_ITEMS} ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at`,
    [cart.id]
  );
  cart.items = result.rows.map((r) => ({
    id: r.id,
    cartId: r.cart_id,
    productId: r.product_id,
    productName: r.product_name,
    productPrice: parseFloat(r.product_price),
    productImageUrl: r.product_image_url,
    size: r.size,
    quantity: r.quantity,
    unitPrice: parseFloat(r.unit_price),
    subtotal: parseFloat(r.unit_price) * r.quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  cart.subtotal = cart.items.reduce((sum, it) => sum + it.subtotal, 0);
  return cart;
}

/**
 * Añade o actualiza cantidad en el carrito (mismo product_id + size).
 */
async function addItem(cartId, productId, size, quantity, unitPrice) {
  const pool = db.getPool();
  const sizeNorm = String(size).trim();
  const qty = Math.max(1, Number(quantity) || 1);

  const result = await pool.query(
    `INSERT INTO ${CART_ITEMS} (cart_id, product_id, size, quantity, unit_price)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (cart_id, product_id, size)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = now()
     RETURNING *`,
    [cartId, productId, sizeNorm, qty, unitPrice]
  );
  return rowToCartItem(result.rows[0]);
}

async function findCartItemById(itemId) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT * FROM ${CART_ITEMS} WHERE id = $1 LIMIT 1`,
    [itemId]
  );
  return rowToCartItem(result.rows[0] || null);
}

async function updateItemQuantity(itemId, quantity) {
  const pool = db.getPool();
  const qty = Math.max(1, Number(quantity) || 1);
  const result = await pool.query(
    `UPDATE ${CART_ITEMS} SET quantity = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [qty, itemId]
  );
  return result.rowCount > 0 ? rowToCartItem(result.rows[0]) : null;
}

async function removeItem(itemId) {
  const pool = db.getPool();
  const result = await pool.query(
    `DELETE FROM ${CART_ITEMS} WHERE id = $1 RETURNING *`,
    [itemId]
  );
  return result.rowCount > 0 ? rowToCartItem(result.rows[0]) : null;
}

/** Verifica que el ítem pertenezca al carrito del usuario. */
async function isItemInUserCart(itemId, userId) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT 1 FROM ${CART_ITEMS} ci
     JOIN ${CARTS} c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.user_id = $2 LIMIT 1`,
    [itemId, userId]
  );
  return result.rowCount > 0;
}

/** Vacía el carrito del usuario (tras checkout). */
async function clearCart(userId) {
  const cart = await findCartByUserId(userId);
  if (!cart) return;
  const pool = db.getPool();
  await pool.query(`DELETE FROM ${CART_ITEMS} WHERE cart_id = $1`, [cart.id]);
}

export default {
  findCartByUserId,
  findOrCreateCart,
  getCartWithItems,
  addItem,
  findCartItemById,
  updateItemQuantity,
  removeItem,
  isItemInUserCart,
  clearCart,
};
