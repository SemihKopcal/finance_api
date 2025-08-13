import { Transaction, ITransaction } from './entities/transaction.model';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { UpdateTransactionDto } from './dto/update.transaction.dto';
import mongoose from 'mongoose';

export class TransactionService {
  static async createTransaction(data: CreateTransactionDto, userId: string): Promise<ITransaction> {
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
      limit?: number;
      page?: number;
    }
  ): Promise<{ transactions: ITransaction[]; total: number; page: number; limit: number }> {
    const { type, category, startDate, endDate, limit = 10, page = 1 } = filters;
    
    const query: any = { userId };

    if (type) query.type = type;
    if (category) query.categoryId = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: -1 }),
      Transaction.countDocuments(query),
    ]);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      transactions,
    };
  }

  static async updateTransaction(
    id: string,
    userId: string,
    updateData: UpdateTransactionDto
  ): Promise<ITransaction | null> {
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) return null;

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
