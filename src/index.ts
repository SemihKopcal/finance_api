import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { authRoute } from './auth';
import { categoryRoute } from './categories';
import { transactionsRoute } from './transactions';
import { reportsRoute } from './reports';
import { userRoute } from './user';

import { setupSwagger } from './swagger/swagger';
import connectDB from './database/db';

dotenv.config();

const initializeApp = async () => {
  try {
    await connectDB();

    const app = express();
    app.use(express.json());

    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 60,
      message: 'Çok fazla istek yaptınız, lütfen daha sonra tekrar deneyin.',
    });
    app.use((req, res, next) => {
      if (req.path.startsWith('/api-docs')) {
        return next();
      }
      return limiter(req, res, next);
    });

    app.use('/auth', authRoute);
    app.use('/user', userRoute);
    app.use('/categories', categoryRoute);
    app.use('/transactions', transactionsRoute);
    app.use('/reports', reportsRoute);

    setupSwagger(app);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Uygulama başlatılırken hata:', error);
    process.exit(1);
  }
};

initializeApp();
