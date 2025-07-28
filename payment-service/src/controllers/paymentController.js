// src/controllers/paymentController.js
import { stripe } from '../index.js';
import Payment from '../models/Payment.js';
import CustomerMap from '../models/CustomerMap.js';
import axios from 'axios';
import mongoose from 'mongoose';

async function getOrCreateStripeCustomer({ userId, email }) {
    let mapping = await CustomerMap.findOne({ userId });
    if (mapping) return mapping.stripeCustomerId;

    const customer = await stripe.customers.create({
        metadata: { userId },
        email,
    });

    mapping = await CustomerMap.create({
        userId,
        stripeCustomerId: customer.id,
    });
    return mapping.stripeCustomerId;
}

const asyncHandler =
    (fn) =>
        (req, res, next) =>
            Promise.resolve(fn(req, res, next)).catch(next);


export const createSetupIntent = asyncHandler(async (req, res) => {
    const { userId, email } = req.user;

    const customerId = await getOrCreateStripeCustomer({ userId, email });

    const intent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
    });

    return res.status(201).json({ clientSecret: intent.client_secret });
});


export const listPaymentMethods = asyncHandler(async (req, res) => {
    const customerId = await getOrCreateStripeCustomer(req.user);

    const { data: paymentMethods } = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
    });

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method || 
                                  customer.default_source;

    const methods = paymentMethods.map((pm) => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
    }));

    res.json({ paymentMethods: methods });
});


export const detachPaymentMethod = asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({ detached: true, paymentMethodId });
});


export const savePaymentMethod = asyncHandler(async (req, res) => {
    const { userId, email } = req.user;
    const { paymentMethodToken, billingDetails } = req.body;

    const customerId = await getOrCreateStripeCustomer({ userId, email });

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodToken, {
        customer: customerId,
    });

    if (billingDetails) {
        await stripe.paymentMethods.update(paymentMethodToken, {
            billing_details: billingDetails,
        });
    }


    const { brand, last4, exp_month, exp_year } = paymentMethod.card;
    res.status(201).json({
        message: 'Payment method saved successfully.',
        paymentMethod: {
            paymentMethodId: paymentMethod.id,
            brand,
            last4,
            expMonth: exp_month,
            expYear: exp_year,
            default: false, 
        },
    });
});


export const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
    const { userId, email } = req.user;
    const { id: paymentMethodId } = req.params;

    const customerId = await getOrCreateStripeCustomer({ userId, email });

    await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
    });

    res.json({ message: 'Default payment method updated.' });
});


export const createPayment = asyncHandler(async (req, res) => {
    const { userId, email } = req.user;
    let { amount, currency, paymentMethodId } = req.body;

    let orderId = new mongoose.Types.ObjectId().toString();

    let cartData;
    try {
        const cartRes = await axios.get(`http://cart-service:4400/api/cart`, {
            headers: { Authorization: req.headers.authorization }
        });
        cartData = cartRes.data;
        if (!cartData.items || cartData.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
    } catch (err) {
        return res.status(502).json({ error: 'Failed to fetch cart from cart service' });
    }

    let subtotal = 0;
    const decrementedProducts = [];
    for (const item of cartData.items) {
        try {
            const productRes = await axios.get(`http://product-service:4300/api/product/${item.productId}`);
            const product = productRes.data;
            if (item.price !== product.price) {
                return res.status(400).json({ error: `Price mismatch for product ${item.productId}` });
            }
            if (item.quantity > product.quantityInStock) {
                return res.status(400).json({ error: `Insufficient stock for product ${item.productId}` });
            }
            try {
                await axios.patch(
                    `http://product-service:4300/api/product/${item.productId}/decrement-stock`,
                    { quantity: item.quantity },
                    { headers: { Authorization: req.headers.authorization } }
                );
                decrementedProducts.push({ productId: item.productId, quantity: item.quantity });
            } catch (err) {
                return res.status(502).json({ error: `Failed to decrement stock for product ${item.productId}` });
            }
            subtotal += item.price * item.quantity;
        } catch (err) {
            return res.status(502).json({ error: `Failed to fetch product ${item.productId} from product service` });
        }
    }

    const TAX_RATE = parseFloat(process.env.TAX_RATE) || 0.15;
    const estimatedTax = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + estimatedTax).toFixed(2);
    if (total !== amount) {
        return res.status(400).json({ error: 'Total amount mismatch (expected: ' + total + ', got: ' + amount + ')' });
    }

    const customerId = await getOrCreateStripeCustomer({ userId, email });

    const amountInCents = Math.round(amount * 100);

    const intent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        metadata: { orderId, userId },
    });


    const paymentDoc = await Payment.create({
        userId,
        orderId,
        paymentIntentId: intent.id,
        paymentMethodId,
        amount: amountInCents,
        currency: currency.toUpperCase(),
        status: intent.status,
        receiptUrl: intent.charges?.data?.[0]?.receipt_url ?? null,
    });

    res.status(201).json({ payment: paymentDoc.toJSON() });
});


export const listPayments = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [payments, total] = await Promise.all([
        Payment.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Payment.countDocuments({ userId }),
    ]);

    res.json({
        page,
        total,
        payments: payments.map((p) => {
            const payment = p.toJSON();
            payment._links = {
                self: `api/payment/${payment.id}`,
                order: `api/order/${payment.orderId}`,
                ...(payment.receiptUrl ? { receipt: payment.receiptUrl } : {})
            };
            return payment;
        }),
    });
});


export const getPaymentById = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const { paymentId } = req.params;

    const paymentDoc = await Payment.findOne({ _id: paymentId, userId });
    if (!paymentDoc) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentDoc.toJSON();
    payment._links = {
        self: `api/payment/${payment.id}`,
        order: `api/order/${payment.orderId}`,
        ...(payment.receiptUrl ? { receipt: payment.receiptUrl } : {})
    };

    res.json({ payment });
});

export const refundPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    if (!['succeeded', 'processing'].includes(payment.status)) {
        return res.status(400).json({ error: 'Only succeeded or processing payments can be refunded/canceled' });
    }
    try {
        let refundResult;
        if (payment.status === 'succeeded') {
            refundResult = await stripe.refunds.create({ payment_intent: payment.paymentIntentId });
            payment.status = 'refunded';
        } else {
            await stripe.paymentIntents.cancel(payment.paymentIntentId);
            payment.status = 'canceled';
        }
        await payment.save();
        res.json({ message: 'Payment refunded/canceled', paymentId, newStatus: payment.status });
    } catch (err) {
        console.error('Error refunding payment:', err);
        res.status(500).json({ error: 'Failed to refund/cancel payment' });
    }
});