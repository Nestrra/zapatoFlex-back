import db from '../../db/client.js';

const TABLE = 'users';

/**
 * Convierte una fila de la BD (snake_case) a objeto JS (camelCase).
 */
function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    phone: row.phone,
    address: row.address,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Repository de usuarios (patrón Repository).
 * Abstrae el acceso a la tabla users.
 */
async function findByEmail(email) {
  const pool = db.getPool();
  const normalizedEmail = String(email).trim().toLowerCase();
  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = $1 AND active = true LIMIT 1',
    [normalizedEmail]
  );
  return rowToUser(result.rows[0] || null);
}

async function findById(id) {
  const pool = db.getPool();
  const result = await pool.query('SELECT * FROM users WHERE id = $1 AND active = true LIMIT 1', [
    id,
  ]);
  return rowToUser(result.rows[0] || null);
}

/**
 * Crea un usuario. Recibe objeto en camelCase; persiste en snake_case.
 */
async function save(user) {
  const pool = db.getPool();
  const {
    email,
    passwordHash,
    firstName = '',
    lastName = '',
    role = 'CUSTOMER',
    phone = null,
    address = null,
  } = user;

  const normalizedEmail = String(email).trim().toLowerCase();

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [normalizedEmail, passwordHash, firstName.trim(), lastName.trim(), role, phone, address]
  );

  return rowToUser(result.rows[0]);
}

export default {
  findByEmail,
  findById,
  save,
};
