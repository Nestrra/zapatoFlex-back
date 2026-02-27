import jwt from 'jsonwebtoken';
import config from '../../config/index.js';

/**
 * Middleware: exige que la petición tenga un JWT válido.
 * El token va en header: Authorization: Bearer <token>
 * Deja en req.user el payload del token { userId, email, role }.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'TOKEN_REQUIRED' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'TOKEN_INVALID_OR_EXPIRED' });
  }
}

/**
 * Middleware: exige que req.user.role === 'ADMIN'.
 * Debe usarse después de requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'TOKEN_REQUIRED' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'ADMIN_REQUIRED' });
  }
  next();
}

export default {
  requireAuth,
  requireAdmin,
};
