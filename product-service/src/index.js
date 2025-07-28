import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4300;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/shopsphere';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').split(',');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.use('/api/product', productRoutes);
app.use('/api/product/:id/reviews', reviewRoutes);

app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT || 4000, () =>
      console.log(`✅ Product Service running on port ${PORT || 4000}`)
    );
  })
  .catch(err => console.error("MongoDB connection error:", err));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
