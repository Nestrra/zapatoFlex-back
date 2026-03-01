import authService from './auth.service.js';

function getMe(req, res) {
  const userId = req.user.userId;
  authService
    .getMe(userId)
    .then((user) => {
      if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
      res.json(user);
    })
    .catch((err) => {
      console.error('[Auth] getMe error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

function updateProfile(req, res) {
  const userId = req.user.userId;
  const { firstName, lastName, phone, address } = req.body;
  authService
    .updateProfile(userId, { firstName, lastName, phone, address })
    .then((user) => {
      if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
      res.json(user);
    })
    .catch((err) => {
      console.error('[Auth] updateProfile error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

function register(req, res) {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
  }

  authService
    .register({ email, password, firstName, lastName, role })
    .then((result) => {
      if (!result.success) {
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          return res.status(409).json({ error: result.error });
        }
        return res.status(400).json({ error: result.error });
      }
      res.status(201).json(result);
    })
    .catch((err) => {
      console.error('[Auth] register error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
  }

  authService
    .login(email, password)
    .then((result) => {
      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }
      res.json(result);
    })
    .catch((err) => {
      console.error('[Auth] login error', err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    });
}

export default {
  getMe,
  updateProfile,
  register,
  login,
};
