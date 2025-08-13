import { Category, ICategory } from './entities/categories.model';

export class CategoryService {
    static async createCategory(name: string, type: "income" | "expense", color: string, userId: string): Promise<ICategory> {
        const category = new Category({ name, type, color, userId });
        await category.save();
        return category;
    }

    static async getAllCategory(userId: string, page: number = 1, limit: number = 10): Promise<ICategory[]> {
        const skip = (page - 1) * limit;
        return Category.find({ userId }).skip(skip).limit(limit).populate('userId', 'name email');
    }

    static async getCategoryById(categoryId: string): Promise<ICategory | null> {
        return Category.findById(categoryId).populate('userId', 'name email');
    }

    static async getCategoryByIdAndUserId(categoryId: string, userId: string): Promise<ICategory | null> {
        return Category.findOne({ _id: categoryId, userId }).populate('userId', 'name email');
    }

    static async updateCategory(categoryId: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
        return Category.findByIdAndUpdate(categoryId, updateData, { new: true }).populate('userId', 'name email');
    }

    static async deleteCategory(categoryId: string): Promise<boolean> {
        const result = await Category.findByIdAndDelete(categoryId);
        return result !== null;
    }
}