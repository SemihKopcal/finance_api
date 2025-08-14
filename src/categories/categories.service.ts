import { Category, ICategory } from './entities/categories.model';
import { Transaction } from '../transactions/entities/transaction.model';

interface IDefaultCategory {
  name: string;
  type: 'income' | 'expense';
  color: string;
  isDefault: boolean;
}

export class CategoryService {
  private static readonly DEFAULT_CATEGORIES: IDefaultCategory[] = [
    { name: 'Maaş', type: 'income', color: '#4CAF50', isDefault: true },
    { name: 'Bonus', type: 'income', color: '#8BC34A', isDefault: true },
    { name: 'Yemek', type: 'expense', color: '#FF5722', isDefault: true },
    { name: 'Ulaşım', type: 'expense', color: '#2196F3', isDefault: true },
    { name: 'Alışveriş', type: 'expense', color: '#9C27B0', isDefault: true },
    { name: 'Fatura', type: 'expense', color: '#FF9800', isDefault: true },
  ];

  // Kullanıcıya özel default kategorileri oluştur
  static async createDefaultCategoriesForUser(userId: string): Promise<void> {
    for (const defaultCategory of this.DEFAULT_CATEGORIES) {
      const existingCategory = await Category.findOne({
        name: defaultCategory.name,
        type: defaultCategory.type,
        userId,
      });

      if (!existingCategory) {
        await Category.create({
          ...defaultCategory,
          userId,
          createdAt: new Date(),
        });
        console.log(
          `Kullanıcı için kategori oluşturuldu: ${defaultCategory.name}`
        );
      }
    }
  }

  // Sadece default kategorileri döndür
  static getDefaultCategories(): IDefaultCategory[] {
    return this.DEFAULT_CATEGORIES;
  }

  // Kullanıcıya özel kategori oluştur
  static async createCategory(
    name: string,
    type: 'income' | 'expense',
    color: string,
    userId: string
  ): Promise<ICategory> {
    const category = new Category({
      name,
      type,
      color,
      userId,
      isDefault: false,
    });
    await category.save();
    return category;
  }

  // Kullanıcının kendi kategorilerini ve default kategorileri getir
  static async getAllCategory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ICategory[]> {
    const skip = (page - 1) * limit;

    // Kullanıcının kendi kategorileri
    const userCategories = await Category.find({ userId, isDefault: false })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    // Default kategoriler (sayfalama olmadan)
    const defaultCategories = await Category.find({
      isDefault: true,
      userId,
    });

    // kullanıcının tum kategorileri
    const allCategories = [...userCategories, ...defaultCategories];

    // Sayfalama uygula
    return allCategories.slice(skip, skip + limit);
  }

  static async getCategoryById(categoryId: string): Promise<ICategory | null> {
    return Category.findById(categoryId).populate('userId', 'name email');
  }

  static async getCategoryByIdAndUserId(
    categoryId: string,
    userId: string
  ): Promise<ICategory | null> {
    return Category.findOne({ _id: categoryId, userId }).populate(
      'userId',
      'name email'
    );
  }

  static async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
    }).populate('userId', 'name email');
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    // Önce kategoriyi bul
    const category = await Category.findById(categoryId);
    if (!category) {
      return false;
    }

    // Default kategoriler silinemez
    if (category.isDefault) {
      throw new Error('Default kategoriler silinemez');
    }

    // Kategoriye ait tüm işlemleri sil
    const deleteTransactionsResult = await Transaction.deleteMany({
      categoryId,
    });
    console.log(`${deleteTransactionsResult.deletedCount} adet işlem silindi`);

    // Kategoriyi sil
    const result = await Category.findByIdAndDelete(categoryId);
    return result !== null;
  }
}
