import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as vendorCtrl from '../controllers/vendorController.js';
import { requireAuth, requireRole} from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['vendor', 'admin']));

router.post(
  '/profile',
  [ 
    body('storeName').isString().trim().notEmpty().isLength({max:120}),
    body('location').isString().notEmpty().isLength({max: 120}),
    body('logoUrl').isString().notEmpty(),
    body('storeBannerUrl').isString().notEmpty(),
    body('phoneNumber').isString().notEmpty(),
    body('socialLinks').isArray().optional(),
  ],
  vendorCtrl.addVendorProfile
);

router.get('/profile', vendorCtrl.getVendorProfile);

router.put(
  '/profile',
  [ 
    body('storeName').isString().trim().notEmpty().isLength({max:120}),
    body('location').isString().notEmpty().isLength({max: 120}),
    body('logoUrl').isString().notEmpty(),
    body('storeBannerUrl').isString().notEmpty(),
    body('phoneNumber').isString().notEmpty(),
    body('socialLinks').isArray().optional(),
  ],
  vendorCtrl.updateVendorProfile
);

router.get('/settings',
  vendorCtrl.getSetting
);

router.put('/settings',
  vendorCtrl.changeSetting
);


router.put(
  '/:id/approve',
  [
    requireRole(['admin']),           
    param('id').isString().notEmpty(),
    body('isApproved').isBoolean(),
  ],
  vendorCtrl.approval
)

router.get(
  '/:id/approve',
  [ param('id').isString().notEmpty() ],
  vendorCtrl.checkApproval
)

// Admin only - get all vendors
router.get(
  '/all',
  [
    requireRole(['admin']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('isApproved').optional().isBoolean(),
  ],
  vendorCtrl.getAllVendors
);

export default router;