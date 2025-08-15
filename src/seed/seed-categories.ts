import { User } from '../user/entities/user.model';
import { CategoryService } from '../categories/categories.service';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || '', {})
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

const seedCategories = async () => {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('Kullanıcı bulunamadı. Önce bir kullanıcı oluşturun!');
      return;
    }

    const userId: string = String(user._id);
    console.log(`Kullanıcı bulundu: ${user.email} (ID: ${userId})`);

    await CategoryService.createDefaultCategoriesForUser(userId);

    console.log('✅ Default kategoriler başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Kategori seedleme hatası:', error);
  } finally {
    mongoose.disconnect();
  }
};
seedCategories();