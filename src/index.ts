import express from 'express';
import dotenv from 'dotenv';

// Routes - Artık index.ts dosyalarından import ediyoruz
import { authRoute } from './auth';
import { categoryRoute } from './categories';
import { transactionsRoute } from './transactions';
import { reportsRoute } from './reports';

import { setupSwagger } from './swagger';
import { CategoryService } from './categories/categories.service';
import { seedTransactions } from './seed-transactions';
import { seedCategories } from './seed-categories';
import connectDB from './db';

dotenv.config();

// MongoDB bağlantısı ve default kategorileri oluştur
const initializeApp = async () => {
  try {
    await connectDB();


    // Default category ve transaction'ları oluştur
    if (process.env.NODE_ENV !== 'production') {
      try {
        await seedCategories();
        await seedTransactions();
        console.log("✅ Default transaction'lar oluşturuldu");
      } catch (error) {
        console.log("⚠️  Default transaction'lar oluşturulamadı:", error);
      }
    }

    const app = express();
    app.use(express.json());

    app.use('/auth', authRoute);
    app.use('/categories', categoryRoute);
    app.use('/transactions', transactionsRoute);
    app.use('/reports', reportsRoute);

    // Swagger dokümantasyonu
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

// Uygulamayı başlat
initializeApp();
