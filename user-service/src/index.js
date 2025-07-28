import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import vendorRoute from './routes/vendorRoutes.js';
import consumerRoute from './routes/consumerRoutes.js';
import publicVendorRoute from './routes/publicVendorRoutes.js';
import cors from 'cors';
import morgan from 'morgan';
dotenv.config();
const app = express();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/shopsphere';
const PORT = process.env.PORT || 4200;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').split(',');
const NODE_ENV = process.env.NODE_ENV || 'development';


app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/user/health', (req, res) => {
  res.json({
    service: 'user',
    status: 'up',
    uptime_seconds: process.uptime().toFixed(2),
    checked_at: new Date().toISOString(),
    message: 'User service is operational.',
  });
});

app.use('/api/user/consumer', consumerRoute);
app.use('/api/user/vendor', vendorRoute);
app.use('/api/user/vendors/public', publicVendorRoute);

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
    if (NODE_ENV !== 'test') app.listen(PORT, () => console.log(`user-service on :${PORT}`));
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