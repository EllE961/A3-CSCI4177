import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cartRoutes from './routes/cartRoutes.js';
import helmet from 'helmet';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4400;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/shopsphere';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').split(',');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'none'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.get('/', (req, res) => {
  res.send('Welcome to the Cart Service!');
});

app.use('/api/cart', cartRoutes);

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
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`✅ Cart Service running on port ${PORT}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
