// src/index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import dotenv from 'dotenv';

import paymentRoutes from './routes/paymentRoutes.js'; 

dotenv.config();

const {
  PORT = 4500,
  MONGODB_URI,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  NODE_ENV = 'development',
} = process.env;

if (!MONGODB_URI || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error('❌  Missing one or more required env vars in .env');
  process.exit(1);
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', 
});

const app = express();


app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // TODO: delegate to a dedicated webhook controller
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_method.attached':
        console.log(`🔔  Stripe event received: ${event.type}`);
        break;
      default:
        console.log(`🤷‍  Unhandled event type: ${event.type}`);
    }

    return res.sendStatus(200);
  },
);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/payments', paymentRoutes);


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀  Payment-service running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed', err);
    process.exit(1);
  });
