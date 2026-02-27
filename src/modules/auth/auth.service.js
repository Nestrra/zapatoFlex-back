import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import config from '../../../config/index.js';

const SALT_ROUNDS = 10;

/**
 * Auth service: register and login con persistencia en PostgreSQL.
 * Usa Repository para acceso a datos (desacopla lógica de negocio de la BD).
 */
async function register({ email, password, firstName, lastName, role: roleInput }) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    return { success: false, error: 'EMAIL_ALREADY_EXISTS' };
  }

  const role = roleInput === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await authRepository.save({
    email,
    passwordHash,
    firstName: firstName || '',
    lastName: lastName || '',
    role,
  });

  return {
    success: true,
    user: toPublicUser(user),
  };
}

async function login(email, password) {
  const user = await authRepository.findByEmail(email);
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
    token: jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    ),
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
