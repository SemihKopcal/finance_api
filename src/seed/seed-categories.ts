import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../categories/entities/categories.model';

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI || '', {})
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

const defaultCategories = [
  { name: 'Maaş', type: 'income', color: '#4CAF50', isDefault: true },
  { name: 'Bonus', type: 'income', color: '#8BC34A', isDefault: true },
  { name: 'Kira', type: 'expense', color: '#F44336', isDefault: true },
  { name: 'Yemek', type: 'expense', color: '#FF9800', isDefault: true },
  { name: 'Ulaşım', type: 'expense', color: '#2196F3', isDefault: true },
  { name: 'Alışveriş', type: 'expense', color: '#9C27B0', isDefault: true },
  { name: 'Fatura', type: 'expense', color: '#FFC107', isDefault: true },
  { name: 'Genel', type: 'expense', color: '#607D8B', isDefault: true },
];
const seedCategories = async () => {
  try {
    for (const category of defaultCategories) {
      const exists = await Category.findOne({
        name: category.name,
        isDefault: true,
      });
      if (!exists) {
        await Category.create(category);
        console.log(`✅ Default kategori eklendi: ${category.name}`);
      } else {
        console.log(`⚠️ Zaten mevcut: ${category.name}`);
      }
    }
    console.log('🎉 Default kategoriler başarıyla seed edildi!');
  } catch (error) {
    console.error('Kategori seedleme hatası:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedCategories();
