import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './categories/entities/categories.model';
import { Transaction } from './transactions/entities/transaction.model';
import { User } from './auth/entities/user.model';

dotenv.config();

// Demo kullanıcı ID'si - gerçek kullanıcıdan alınacak
let DEMO_USER_ID: string = '';

// Rastgele tutar üretme fonksiyonu
const getRandomAmount = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Rastgele tarih üretme fonksiyonu (son 6 ay içinde)
const getRandomDate = (): Date => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const randomTime =
    sixMonthsAgo.getTime() +
    Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Rastgele açıklama üretme fonksiyonu
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
    Alışveriş: [
      'Giyim alışverişi',
      'Elektronik ürün',
      'Kitap',
      'Spor malzemesi',
    ],
    Fatura: [
      'Elektrik faturası',
      'Su faturası',
      'İnternet faturası',
      'Telefon faturası',
    ],
    Genel: ['Genel harcama', 'Diğer gider'],
  };

  const isIncome = type === 'income';
  const descriptionsMap = isIncome ? incomeDescriptions : expenseDescriptions;

  const safeCategoryName = categoryName || 'Genel';
  const categoryDescriptions: string[] = descriptionsMap[
    safeCategoryName as keyof typeof descriptionsMap
  ] ||
    descriptionsMap['Genel'] || ['Açıklama yok'];

  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex] ?? "Aciklama Yok";
};

const seedTransactions = async () => {
  try {
    // İlk kullanıcıyı bul
    let user = await User.findOne();
    if (!user) {
      console.log('Kullanıcı bulunamadı. Önce bir kullanıcı oluşturun!');
      return;
    }

    DEMO_USER_ID = (user._id as any).toString();
    console.log(`Kullanıcı bulundu: ${user.email} (ID: ${DEMO_USER_ID})`);

    // Eğer zaten transaction varsa ekleme yapma
    const existingTransactions = await Transaction.find({ userId: DEMO_USER_ID });
    if (existingTransactions.length > 0) {
      console.log(`🚫 ${existingTransactions.length} transaction zaten mevcut. Seed işlemi atlandı.`);
      return;
    }

    const defaultCategories = await Category.find({
      isDefault: true,
      userId: DEMO_USER_ID,
    });
    console.log(`Bulunan default kategoriler: ${defaultCategories.length}`);

    if (defaultCategories.length === 0) {
      console.log('Önce default kategorileri oluşturun!');
      return;
    }

    const createdTransactions = [];

    // Her kategori için 2-3 transaction oluşturur
    for (const category of defaultCategories) {
      const transactionCount = Math.floor(Math.random() * 2) + 2; // 2-3 arası

      console.log(
        `${category.name} kategorisi için ${transactionCount} transaction oluşturuluyor...`
      );

      for (let i = 0; i < transactionCount; i++) {
        // Kategori tipine göre tutar aralığı belirlenir
        let minAmount, maxAmount;
        if (category.type === 'income') {
          minAmount = 1000;
          maxAmount = 10000;
        } else {
          minAmount = 50;
          maxAmount = 500;
        }

        const transaction = new Transaction({
          amount: getRandomAmount(minAmount, maxAmount),
          type: category.type,
          categoryId: category._id,
          userId: DEMO_USER_ID,
          description: getRandomDescription(
            category.name || 'Genel',
            category.type || 'expense'
          ),
          date: getRandomDate(),
        });

        await transaction.save();
        createdTransactions.push(transaction);

        console.log(
          `  - ${transaction.description}: ${transaction.amount} TL (${transaction.date.toLocaleDateString('tr-TR')})`
        );
      }
    }

    console.log(
      `\n✅ Toplam ${createdTransactions.length} transaction başarıyla oluşturuldu!`
    );

    // Özet bilgiler
    const incomeTransactions = createdTransactions.filter(
      (t) => t.type === 'income'
    );
    const expenseTransactions = createdTransactions.filter(
      (t) => t.type === 'expense'
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    console.log(`\n📊 Özet:`);
    console.log(
      `  Gelir işlemleri: ${incomeTransactions.length} adet, Toplam: ${totalIncome.toFixed(2)} TL`
    );
    console.log(
      `  Gider işlemleri: ${expenseTransactions.length} adet, Toplam: ${totalExpense.toFixed(2)} TL`
    );
    console.log(`  Net bakiye: ${(totalIncome - totalExpense).toFixed(2)} TL`);
  } catch (error) {
    console.error('Hata:', error);
  }
};


export { seedTransactions };
