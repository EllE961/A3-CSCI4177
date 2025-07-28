import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4600;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/shopsphere';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').split(',');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api/orders', orderRoutes);

app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => { 
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    if (NODE_ENV !== 'test') app.listen(PORT, () => console.log(`order-service on :${PORT}`));
  } catch (err) {
    console.error('Mongo connection error', err);
    process.exit(1);
  }
}
start();

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
