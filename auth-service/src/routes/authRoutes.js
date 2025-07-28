// src/routes/authRoutes.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import {
  register,
  login,
  logout,
  me,
  validateToken,
  changePassword
} from '../controllers/authController.js';

import { requireAuth /*, requireRole */ } from '../middleware/auth.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.status(200).json({
    service: 'auth',
    status: 'up',
    uptime_seconds: process.uptime().toFixed(2),
    checked_at: new Date().toISOString(),
    message: 'Auth‑service is running smoothly.'
  })
);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/register',
  [
    body('username')
      .isString().trim().notEmpty()
      .isLength({ min: 3, max: 32 })
      .withMessage('Username must be 3‑32 characters.'),
    body('email').isEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
    body('role').isIn(['consumer', 'vendor', 'admin'])
      .withMessage('Role must be consumer, vendor, or admin.')
  ],
  handleValidation,
  register
);

router.post(
  '/login',
  [
    body('email').optional().isEmail().withMessage('Valid email required.'),
    body('username')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  handleValidation,
  login
);

router.post('/logout', requireAuth, logout);

router.get('/me', requireAuth, me);

router.get('/validate', requireAuth, validateToken);

router.put(
  '/password',
  requireAuth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters.')
  ],
  handleValidation,
  changePassword
);

export default router;
