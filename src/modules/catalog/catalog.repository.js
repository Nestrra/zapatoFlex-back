import db from '../../db/client.js';

const PRODUCTS = 'products';
const INVENTORY = 'inventory';

function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    currency: 'COP',
    category: row.category,
    imageUrl: row.image_url,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToInventory(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size,
    quantity: row.quantity,
    updatedAt: row.updated_at,
  };
}

/**
 * Lista productos activos que tengan al menos una talla con stock > 0.
 * Opcional: filtrar por category (casual | deportivo | formal).
 */
async function findAll({ category } = {}) {
  const pool = db.getPool();
  let query = `
    SELECT p.* FROM ${PRODUCTS} p
    INNER JOIN ${INVENTORY} i ON i.product_id = p.id AND i.quantity > 0
    WHERE p.active = true
  `;
  const params = [];
  if (category && ['casual', 'deportivo', 'formal'].includes(String(category).toLowerCase())) {
    params.push(String(category).toLowerCase());
    query += ` AND p.category = $${params.length}`;
  }
  query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows.map((r) => rowToProduct(r));
}

/**
 * Obtiene un producto por id con su inventario (tallas y cantidades).
 * includeInactive: si true, devuelve también productos inactivos (para admin).
 */
async function findById(id, { includeInactive = false } = {}) {
  const pool = db.getPool();
  const activeFilter = includeInactive ? '' : ' AND active = true';
  const productResult = await pool.query(
    `SELECT * FROM ${PRODUCTS} WHERE id = $1${activeFilter} LIMIT 1`,
    [id]
  );
  const product = rowToProduct(productResult.rows[0] || null);
  if (!product) return null;

  const invResult = await pool.query(
    `SELECT * FROM ${INVENTORY} WHERE product_id = $1 ORDER BY size`,
    [id]
  );
  product.inventory = invResult.rows.map((r) => rowToInventory(r));
  return product;
}

/**
 * Stock disponible para un producto y talla (para validar carrito).
 */
async function getAvailableStock(productId, size) {
  const pool = db.getPool();
  const result = await pool.query(
    `SELECT quantity FROM ${INVENTORY} WHERE product_id = $1 AND size = $2 LIMIT 1`,
    [productId, String(size).trim()]
  );
  return result.rows[0] ? Number(result.rows[0].quantity) : 0;
}

/**
 * Descuenta stock (para checkout). Lanza si no hay suficiente.
 */
async function deductStock(productId, size, quantity) {
  const pool = db.getPool();
  const result = await pool.query(
    `UPDATE ${INVENTORY}
     SET quantity = quantity - $3, updated_at = now()
     WHERE product_id = $1 AND size = $2 AND quantity >= $3
     RETURNING *`,
    [productId, String(size).trim(), quantity]
  );
  if (result.rowCount === 0) {
    const available = await getAvailableStock(productId, size);
    throw new Error(`INSUFFICIENT_STOCK:${available}`);
  }
  return result.rows[0];
}

/**
 * Crea un producto y sus filas de inventario (tallas).
 * product: { name, description, price, category, imageUrl? }
 * inventory: [ { size, quantity }, ... ]
 */
async function create(product, inventory = []) {
  const pool = db.getPool();
  const { name, description, price, category, imageUrl = null } = product;
  const validCategory = ['casual', 'deportivo', 'formal'].includes(String(category).toLowerCase())
    ? String(category).toLowerCase()
    : 'casual';

  const productResult = await pool.query(
    `INSERT INTO ${PRODUCTS} (name, description, price, category, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, price, validCategory, imageUrl]
  );
  const created = rowToProduct(productResult.rows[0]);

  if (inventory && inventory.length > 0) {
    for (const row of inventory) {
      const size = String(row.size).trim();
      const quantity = Math.max(0, Number(row.quantity) || 0);
      await pool.query(
        `INSERT INTO ${INVENTORY} (product_id, size, quantity) VALUES ($1, $2, $3)
         ON CONFLICT (product_id, size) DO UPDATE SET quantity = $3, updated_at = now()`,
        [created.id, size, quantity]
      );
    }
    const invResult = await pool.query(
      `SELECT * FROM ${INVENTORY} WHERE product_id = $1 ORDER BY size`,
      [created.id]
    );
    created.inventory = invResult.rows.map((r) => rowToInventory(r));
  } else {
    created.inventory = [];
  }

  return created;
}

/**
 * Actualiza un producto y, si se pasa inventory, reemplaza todas las tallas.
 * data: { name?, description?, price?, category?, imageUrl?, active? }
 * inventory (opcional): [ { size, quantity }, ... ] — reemplaza el inventario del producto.
 */
async function update(id, data, inventory = null) {
  const pool = db.getPool();
  const fields = [];
  const values = [];
  let pos = 1;
  const allowed = ['name', 'description', 'price', 'category', 'image_url', 'active'];
  for (const key of allowed) {
    const camel = key === 'image_url' ? 'imageUrl' : key;
    if (data[camel] !== undefined) {
      fields.push(`${key} = $${pos}`);
      values.push(data[camel]);
      pos++;
    }
  }
  if (fields.length > 0) {
    fields.push(`updated_at = now()`);
    values.push(id);
    await pool.query(
      `UPDATE ${PRODUCTS} SET ${fields.join(', ')} WHERE id = $${pos}`,
      values
    );
  }

  if (inventory !== null && Array.isArray(inventory)) {
    await pool.query(`DELETE FROM ${INVENTORY} WHERE product_id = $1`, [id]);
    for (const row of inventory) {
      const size = String(row.size).trim();
      const quantity = Math.max(0, Number(row.quantity) || 0);
      await pool.query(
        `INSERT INTO ${INVENTORY} (product_id, size, quantity) VALUES ($1, $2, $3)`,
        [id, size, quantity]
      );
    }
  }

  return findById(id, { includeInactive: true });
}

/**
 * Eliminación lógica: pone active = false. No borra filas.
 */
async function remove(id) {
  const pool = db.getPool();
  const result = await pool.query(
    `UPDATE ${PRODUCTS} SET active = false, updated_at = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rowCount > 0 ? rowToProduct(result.rows[0]) : null;
}

export default {
  findAll,
  findById,
  getAvailableStock,
  deductStock,
  create,
  update,
  remove,
};
