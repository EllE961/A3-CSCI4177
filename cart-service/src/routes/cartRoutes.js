import { Router } from 'express';
import { body, param } from 'express-validator';

import * as cartCtrl from '../controllers/cartController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    service: 'cart',
    status: 'up',
    uptime_seconds: process.uptime().toFixed(2),
    checked_at: new Date().toISOString(),
    message: 'Cart service is operational.',
  });
});

router.use(requireAuth);
router.use(requireRole(['consumer', 'admin']));

router.get('/', cartCtrl.getCart);

router.post(
  '/items',
  [
    body('productId').isString().notEmpty(),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  cartCtrl.addToCart
);

router.put(
  '/items/:itemId',
  [
    param('itemId').isString().notEmpty(),
    body('quantity').isInt({ min: 1 }),
  ],
  cartCtrl.updateCart
);

router.delete(
  '/items/:itemId',
  [param('itemId').isString().notEmpty()],
  cartCtrl.removeFromCart
);

router.delete('/clear', cartCtrl.clearCart);

router.delete(
  '/admin/clear-expired',
  requireAuth,
  requireRole(['admin']),
  cartCtrl.clearExpiredCarts
);

router.get('/totals', cartCtrl.getCartTotals);


export default router;
