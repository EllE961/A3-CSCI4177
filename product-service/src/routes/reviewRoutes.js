import { Router } from 'express';
import { body, param, query } from 'express-validator';

import * as reviewCtrl from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.post(
  '/',
  requireAuth,
  [
    param('id').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 2000 }),
  ],
  reviewCtrl.createReview
);

router.get(
  '/',
  [
    param('id').isMongoId(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString(),
  ],
  reviewCtrl.listReviews
);

router.put(
  '/:reviewId',
  requireAuth,
  [
    param('id').isMongoId(),
    param('reviewId').isMongoId(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 2000 }),
  ],
  reviewCtrl.updateReview
);

router.delete(
  '/:reviewId',
  requireAuth,
  [
    param('id').isMongoId(),
    param('reviewId').isMongoId(),
  ],
  reviewCtrl.deleteReview
);

export default router;
