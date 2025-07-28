import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as consumerCtrl from '../controllers/consumerController.js';
import { requireAuth, requireRole} from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['consumer', 'admin']));

router.post(
  '/profile',
  [
    body('fullName').isString().notEmpty(),
    body('email').isEmail().withMessage('Valid email required'),
    body('phoneNumber').isString().notEmpty()
  ],
  consumerCtrl.addConsumerProfile
);

router.get('/profile', consumerCtrl.getConsumerProfile);

router.put(
  '/profile',
  [ 
    body('fullName').optional().isString().notEmpty(),
    body('phoneNumber').optional().isString()
  ],
  consumerCtrl.updateConsumerProfile
);

router.get('/settings',
  consumerCtrl.getSetting
);

router.put(
  '/settings',
  [
    body('currency').optional().isString(),
    body('theme').optional().isString()
  ],
  consumerCtrl.changeSetting
);

router.post('/addresses',
    [
    body('label').isString(),
    body('line').isString(),
    body('city').isString(),
    body('postalCode').isString(),
    body('country').isString()
    ],
    consumerCtrl.addNewAddress
)

router.get('/addresses', consumerCtrl.getAddresses);

router.put('/addresses/:id',
    [
    param('id').notEmpty(),
    body('label').isString().notEmpty(),
    body('line').isString().notEmpty(),
    body('city').isString().notEmpty(),
    body('postalCode').isString().notEmpty(),
    body('country').isString().notEmpty()
    ],
    consumerCtrl.updateAddress
)

router.delete('/addresses/:id',
    [
        param('id').notEmpty()
    ]
,
consumerCtrl.deleteAddress)

export default router;