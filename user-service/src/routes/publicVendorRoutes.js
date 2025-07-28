import { Router } from 'express';
import { query, param } from 'express-validator';
import * as vendorCtrl from '../controllers/vendorController.js';

const router = Router();

// Public endpoint - no authentication required
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim(),
    query('sort').optional().isIn(['name:asc', 'name:desc', 'createdAt:asc', 'createdAt:desc']),
  ],
  vendorCtrl.listPublicVendors
);

// Get single vendor profile - public endpoint
router.get(
  '/:vendorId',
  [
    param('vendorId').isString().notEmpty(),
  ],
  vendorCtrl.getPublicVendorProfile
);

export default router;