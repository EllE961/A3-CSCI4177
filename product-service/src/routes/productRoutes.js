import { Router } from 'express';
import { body, param, query } from 'express-validator';

import * as productCtrl from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();
router.get('/health', (req, res) => {
  res.json({
    service: 'product',
    status: 'up',
    uptime_seconds: process.uptime().toFixed(2),
    checked_at: new Date().toISOString(),
    message: 'Product service is running smoothly.',
  });
});
router.post(
  '/',
  requireAuth,
  requireRole(['vendor', 'admin']),
  upload.array('images', 5),
  [
    body('vendorId').isString().notEmpty(),
    body('name').isString().trim().isLength({ max: 120 }),
    body('description').optional().isString().isLength({ max: 4000 }),
    body('price').isFloat({ min: 0 }),
    body('quantityInStock').isInt({ min: 0 }),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required.'),
  ],
  productCtrl.createProduct
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['vendor', 'admin']),
  upload.array('images', 5),
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().isLength({ max: 120 }),
    body('description').optional().isString().isLength({ max: 4000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('quantityInStock').optional().isInt({ min: 0 }),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
  ],
  productCtrl.updateProduct
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['vendor', 'admin']),
  [param('id').isMongoId()],
  productCtrl.deleteProduct
);

router.patch(
  '/:id/decrement-stock',
  requireAuth,
  requireRole(['admin', 'vendor', 'consumer']),
  [param('id').isMongoId(), body('quantity').isInt({ min: 1 })],
  productCtrl.decrementStock
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('tags').optional().isString(),
    query('sort').optional().isString(),
  ],
  productCtrl.listProducts
);

router.get(
  '/vendor/:vendorId',
  [
    param('vendorId').isString().notEmpty(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('tags').optional().isString(),
    query('sort').optional().isString(),
  ],
  productCtrl.listProductsByVendor
);

router.get(
  '/:id',
  [param('id').isMongoId()],
  productCtrl.getProductById
);

export default router;
