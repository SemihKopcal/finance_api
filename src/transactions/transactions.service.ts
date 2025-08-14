import { Transaction, ITransaction } from './entities/transaction.model';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { UpdateTransactionDto } from './dto/update.transaction.dto';
import { Category } from '../categories/entities/categories.model';
import mongoose from 'mongoose';

export class TransactionService {
  static async createTransaction(data: CreateTransactionDto, userId: string): Promise<ITransaction> {
    // Kategori tipini kontrol et
    const category = await Category.findById(data.categoryId);
    if (!category) {
      throw new Error('Kategori bulunamadı');
    }

    // Transaction tipi ile kategori tipi uyumlu mu kontrol et
    if (data.type !== category.type) {
      throw new Error(`Bu kategori sadece ${category.type === 'income' ? 'gelir' : 'gider'} işlemleri için kullanılabilir. Seçilen kategori: ${category.name} (${category.type === 'income' ? 'Gelir' : 'Gider'})`);
    }

    const transaction = new Transaction({
      ...data,
      userId,
      date: data.date ? new Date(data.date) : new Date()
    });
    await transaction.save();
    return transaction;
  }

  static async getTransactionById(id: string, userId: string): Promise<ITransaction | null> {
    return Transaction.findOne({ _id: id, userId });
  }

  static async getAllTransactions(
    userId: string,
    filters: {
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      minAmount?: number;
      maxAmount?: number;
      description?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      page?: number;
    }
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    filters: any;
  }> {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      description,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 10,
      page = 1
    } = filters;
    
    const query: any = { userId };

    // Type filter
    if (type) query.type = type;
    
    // Category filter
    if (category) query.categoryId = category;
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = minAmount;
      if (maxAmount !== undefined) query.amount.$lte = maxAmount;
    }

    // Description search (case-insensitive)
    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);
    const pageNum = Number(page);

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['date', 'amount', 'type', 'description'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
    } else {
      sortOptions.date = 'desc'; 
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('categoryId', 'name type color')
        .skip(skip)
        .limit(limitNum)
        .sort(sortOptions),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    return {
      transactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext,
      hasPrev,
      filters: {
        type,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        description,
        sortBy,
        sortOrder
      }
    };
  }

  static async updateTransaction(
    id: string,
    userId: string,
    updateData: UpdateTransactionDto
  ): Promise<ITransaction | null> {
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) return null;

    // Eğer type veya categoryId değişiyorsa, uyumluluğu kontrol et
    if (updateData.type !== undefined || updateData.categoryId !== undefined) {
      const newType = updateData.type || transaction.type;
      const newCategoryId = updateData.categoryId || transaction.categoryId;

      const category = await Category.findById(newCategoryId);
      if (!category) {
        throw new Error('Kategori bulunamadı');
      }

      if (newType !== category.type) {
        throw new Error(`Bu kategori sadece ${category.type === 'income' ? 'gelir' : 'gider'} işlemleri için kullanılabilir. Seçilen kategori: ${category.name} (${category.type === 'income' ? 'Gelir' : 'Gider'})`);
      }
    }

    if (updateData.amount !== undefined) transaction.amount = updateData.amount;
    if (updateData.type !== undefined) transaction.type = updateData.type;
    if (updateData.categoryId !== undefined) {
      transaction.categoryId = new mongoose.Types.ObjectId(updateData.categoryId);
    }
    if (updateData.description !== undefined) transaction.description = updateData.description;
    if (updateData.date !== undefined) transaction.date = new Date(updateData.date);

    await transaction.save();
    return transaction;
  }

  static async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const result = await Transaction.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }
}

export const transactionService = new TransactionService();
