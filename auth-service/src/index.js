import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';      
import helmet from 'helmet';      

import authRoutes from './routes/authRoutes.js';   

dotenv.config();

const {
  MONGODB_URI = 'mongodb://localhost:27017/shopsphere-auth',
  PORT = 5001,
  NODE_ENV = 'development'
} = process.env;

const app = express();

app.use(cors());
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
app.use(express.json());                        
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/auth', authRoutes);


app.use('*', (_req, res) =>
  res.status(404).json({ error: 'Route not found.' })
);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('🗄️  Connected to MongoDB');

    app.listen(PORT, () =>
      console.log(`🔐 auth‑service (${NODE_ENV}) listening on :${PORT}`)
    );
  } catch (err) {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);              
  }
}

start();

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('\n🛑 MongoDB disconnected. Shutting down gracefully.');
  process.exit(0);
});

export default app;