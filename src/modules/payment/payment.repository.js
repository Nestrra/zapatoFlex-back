import db from '../../db/client.js';

const PAYMENTS = 'payments';

function rowToPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    amount: parseFloat(row.amount),
    paymentMethod: row.payment_method,
    status: row.status,
    externalReference: row.external_reference,
    createdAt: row.created_at,
  };
}

async function create(data) {
  const pool = db.getPool();
  const { orderId, amount, paymentMethod, status, externalReference } = data;
  const result = await pool.query(
    `INSERT INTO ${PAYMENTS} (order_id, amount, payment_method, status, external_reference)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [orderId, amount, paymentMethod, status ?? 'PENDING', externalReference ?? null]
  );
  return rowToPayment(result.rows[0]);
}

async function findByOrderId(orderId) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT * FROM ${PAYMENTS} WHERE order_id = $1 LIMIT 1`,
    [orderId]
  );
  return rowToPayment(result.rows[0] || null);
}

export default {
  create,
  findByOrderId,
};
