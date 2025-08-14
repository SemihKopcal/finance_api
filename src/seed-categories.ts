import { User } from './auth/entities/user.model';
import { CategoryService } from './categories/categories.service';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedCategories = async () => {
  try {
    // İlk kullanıcıyı bul
    const user = await User.findOne();
    if (!user) {
      console.log('Kullanıcı bulunamadı. Önce bir kullanıcı oluşturun!');
      return;
    }

    const userId: string = String(user._id);
    console.log(`Kullanıcı bulundu: ${user.email} (ID: ${userId})`);

    // Default kategorileri kullanıcı için oluştur
    await CategoryService.createDefaultCategoriesForUser(userId);

    console.log('✅ Default kategoriler başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Kategori seedleme hatası:', error);
  }
};

export { seedCategories };
