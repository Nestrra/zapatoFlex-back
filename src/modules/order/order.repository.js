import db from '../../db/client.js';

const ORDERS = 'orders';
const ORDER_ITEMS = 'order_items';

function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotal: parseFloat(row.subtotal),
    shippingCost: parseFloat(row.shipping_cost),
    total: parseFloat(row.total),
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToOrderItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    size: row.size,
    quantity: row.quantity,
    unitPrice: parseFloat(row.unit_price),
    createdAt: row.created_at,
  };
}

async function createOrder(data) {
  const pool = db.getPool();
  const { userId, subtotal, shippingCost, total, shippingAddress } = data;
  const result = await pool.query(
    `INSERT INTO ${ORDERS} (user_id, subtotal, shipping_cost, total, shipping_address)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, subtotal, shippingCost ?? 0, total, shippingAddress ?? null]
  );
  return rowToOrder(result.rows[0]);
}

async function createOrderItem(orderId, productId, size, quantity, unitPrice) {
  const pool = db.getPool();
  await pool.query(
    `INSERT INTO ${ORDER_ITEMS} (order_id, product_id, size, quantity, unit_price)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, productId, size, quantity, unitPrice]
  );
}

async function findById(id) {
  const pool = db.getPool();
  const orderResult = await pool.query(
    `SELECT * FROM ${ORDERS} WHERE id = $1 LIMIT 1`,
    [id]
  );
  const order = rowToOrder(orderResult.rows[0] || null);
  if (!order) return null;

  const itemsResult = await pool.query(
    `SELECT * FROM ${ORDER_ITEMS} WHERE order_id = $1 ORDER BY created_at`,
    [id]
  );
  order.items = itemsResult.rows.map((r) => rowToOrderItem(r));
  return order;
}

async function findByUserId(userId, { limit = 50 } = {}) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT * FROM ${ORDERS} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map((r) => rowToOrder(r));
}

/** Lista todos los pedidos (para admin). */
async function findAll({ limit = 50, offset = 0 } = {}) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT * FROM ${ORDERS} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows.map((r) => rowToOrder(r));
}

/** Actualiza el estado del pedido. */
async function updateStatus(orderId, status) {
  const pool = db.getPool();
  const valid = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) return null;
  const result = await pool.query(
    `UPDATE ${ORDERS} SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rowCount > 0 ? rowToOrder(result.rows[0]) : null;
}

export default {
  createOrder,
  createOrderItem,
  findById,
  findByUserId,
  findAll,
  updateStatus,
};
