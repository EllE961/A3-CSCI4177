import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import {
    createSetupIntent,
    listPaymentMethods,
    detachPaymentMethod,
    createPayment,
    listPayments,
    getPaymentById,
    savePaymentMethod,
    setDefaultPaymentMethod,
    refundPayment,
} from '../controllers/paymentController.js';

import { requireAuth, requireRole } from '../middleware/auth.js';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    next();
};

const router = Router();

router.get('/health', (req, res) => {
    res.json({
        service: 'payments',
        status: 'up',
        uptime_seconds: process.uptime().toFixed(2),
        checked_at: new Date().toISOString(),
        message: 'Payments service is operational.',
    });
});

router.use(requireAuth);

router.post('/setup-intent', createSetupIntent);

router.get('/payment-methods', listPaymentMethods);

router.delete(
    '/payment-methods/:paymentMethodId',
    [
        param('paymentMethodId').isString().notEmpty(),
        handleValidationErrors,
    ],
    detachPaymentMethod,
);

router.post(
    '/',
    [
        body('orderId').optional().isString().notEmpty(),
        body('amount').isFloat({ min: 0.01 }),
        body('currency').isString().isLength({ min: 3, max: 3 }),
        body('paymentMethodId').isString().notEmpty(),
        handleValidationErrors,
    ],
    createPayment,
);


router.get(
    '/',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        handleValidationErrors,
    ],
    listPayments,
);


router.get(
    '/:paymentId',
    [
        param('paymentId').isMongoId().withMessage('Invalid payment id'),
        handleValidationErrors,
    ],
    getPaymentById,
);


router.post(
    '/consumer/payment-methods',
    [
        body('paymentMethodToken').isString().notEmpty(),
        body('billingDetails').optional().isObject(),
        handleValidationErrors,
    ],
    savePaymentMethod,
);


router.put(
    '/consumer/payment-methods/:id/default',
    [
        param('id').isString().notEmpty(),
        handleValidationErrors,
    ],
    setDefaultPaymentMethod,
);


router.post(
    '/:paymentId/refund',
    [
        param('paymentId').isMongoId().withMessage('Invalid payment id'),
        handleValidationErrors,
    ],
    requireAuth,
    getPaymentById, 
    refundPayment
);

/**
 * (Optional) Admin-only endpoint to list all payments across consumers.
 */
// router.get(
//   '/admin/all',
//   requireRole(['admin']),
//   [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), handleValidationErrors],
//   listAllPayments,
// );

export default router;
