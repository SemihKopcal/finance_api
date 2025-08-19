import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../categories/entities/categories.model';
import { Transaction } from '../transactions/entities/transaction.model';

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI || '', {})
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

const getRandomAmount = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

const getRandomDate = (): Date => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const randomTime =
    sixMonthsAgo.getTime() +
    Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

const getRandomDescription = (categoryName: string, type: string): string => {
  const incomeDescriptions: Record<string, string[]> = {
    Maaş: ['Aylık maaş ödemesi', 'Maaş transferi', 'İş maaşı'],
    Bonus: ['Performans bonusu', 'Yıl sonu bonusu', 'Özel bonus'],
    Genel: ['Gelir girişi', 'Banka transferi', 'Diğer gelir'],
  };

  const expenseDescriptions: Record<string, string[]> = {
    Yemek: [
      'Restoran yemeği',
      'Market alışverişi',
      'Kahve',
      'Öğle yemeği',
      'Akşam yemeği',
    ],
    Ulaşım: ['Metro bileti', 'Otobüs bileti', 'Taksi', 'Benzin', 'Park ücreti'],
    Alışveriş: ['Giyim alışverişi', 'Elektronik ürün', 'Kitap', 'Spor malzemesi'],
    Fatura: ['Elektrik faturası', 'Su faturası', 'İnternet faturası', 'Telefon faturası'],
    Genel: ['Genel harcama', 'Diğer gider'],
  };

  const isIncome = type === 'income';
  const descriptionsMap = isIncome ? incomeDescriptions : expenseDescriptions;
  const safeCategoryName = categoryName || 'Genel';
  const categoryDescriptions: string[] = descriptionsMap[safeCategoryName as keyof typeof descriptionsMap] 
    || descriptionsMap['Genel'] || ['Açıklama yok'];

  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex] ?? 'Açıklama yok';
};

const seedTransactions = async () => {
  try {
    const defaultCategories = await Category.find({ isDefault: true });
    if (defaultCategories.length === 0) {
      console.log('🚫 Default kategoriler bulunamadı. Önce seedCategories çalıştırın!');
      return;
    }

    const createdTransactions = [];

    for (const category of defaultCategories) {
      const transactionCount = Math.floor(Math.random() * 2) + 2; // 2-3
      console.log(`${category.name} kategorisi için ${transactionCount} transaction oluşturuluyor...`);

      for (let i = 0; i < transactionCount; i++) {
        const [minAmount, maxAmount] = category.type === 'income' ? [1000, 10000] : [50, 500];

        const transaction = new Transaction({
          amount: getRandomAmount(minAmount, maxAmount),
          type: category.type,
          categoryId: category._id,
          description: getRandomDescription(category.name || 'Genel', category.type),
          date: getRandomDate(),
          isDefault: true, // default transaction
          // userId artık opsiyonel, seedlerde gerek yok
        });

        await transaction.save();
        createdTransactions.push(transaction);
      }
    }

    console.log(`\n✅ Toplam ${createdTransactions.length} transaction başarıyla oluşturuldu!`);

    const incomeTotal = createdTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = createdTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    console.log(`📊 Özet:`);
    console.log(`  Gelir Toplamı: ${incomeTotal.toFixed(2)} TL`);
    console.log(`  Gider Toplamı: ${expenseTotal.toFixed(2)} TL`);
    console.log(`  Net Bakiye: ${(incomeTotal - expenseTotal).toFixed(2)} TL`);
  } catch (err) {
    console.error('❌ Seed hata:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedTransactions();
