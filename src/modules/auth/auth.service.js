import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** In-memory store (replace with Repository when we add DB). */
const users = [];

/**
 * Auth service: register and login.
 * Passwords are hashed (AUTH-03). No persistence yet.
 */
async function register({ email, password, firstName, lastName }) {
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: 'EMAIL_ALREADY_EXISTS' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: String(users.length + 1),
    email: email.trim().toLowerCase(),
    passwordHash,
    firstName: (firstName || '').trim(),
    lastName: (lastName || '').trim(),
    role: 'CUSTOMER',
    createdAt: new Date().toISOString(),
  };
  users.push(user);

  return {
    success: true,
    user: toPublicUser(user),
  };
}

async function login(email, password) {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  return {
    success: true,
    user: toPublicUser(user),
  };
}

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export default {
  register,
  login,
};
