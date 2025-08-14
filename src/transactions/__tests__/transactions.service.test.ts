import { TransactionService } from '../transactions.service';
import { Transaction } from '../entities/transaction.model';
import { Category } from '../../categories/entities/categories.model';
import mongoose from 'mongoose';

jest.mock('../entities/transaction.model');
jest.mock('../../categories/entities/categories.model');

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      (Category.findById as jest.Mock).mockResolvedValue({ _id: 'cat1', type: 'income', name: 'Maaş' });

      const mockSave = jest.fn().mockResolvedValue(true);
      (Transaction as jest.MockedFunction<any>).mockImplementation((data: any) => ({
        ...data,
        save: mockSave,
      }));

      const result = await TransactionService.createTransaction(
        { categoryId: 'cat1', type: 'income', amount: 100 },
        'user1'
      );

      expect(Category.findById).toHaveBeenCalledWith('cat1');
      expect(mockSave).toHaveBeenCalled();
      expect(result.type).toBe('income');
    });

    it('should throw if category not found', async () => {
      (Category.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        TransactionService.createTransaction({ categoryId: 'x', type: 'income', amount: 100 }, 'user1')
      ).rejects.toThrow('Kategori bulunamadı');
    });

    it('should throw if category type mismatch', async () => {
      (Category.findById as jest.Mock).mockResolvedValue({ _id: 'cat1', type: 'expense', name: 'Yemek' });

      await expect(
        TransactionService.createTransaction({ categoryId: 'cat1', type: 'income', amount: 100 }, 'user1')
      ).rejects.toThrow(/Bu kategori sadece gider işlemleri/);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      (Transaction.findOne as jest.Mock).mockResolvedValue({ _id: 't1', amount: 200 });

      const result = await TransactionService.getTransactionById('t1', 'user1');

      expect(Transaction.findOne).toHaveBeenCalledWith({ _id: 't1', userId: 'user1' });
      expect(result?.amount).toBe(200);
    });
  });

  describe('getAllTransactions', () => {
    it('should return paginated transactions', async () => {
      (Transaction.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(['tx1', 'tx2']),
            }),
          }),
        }),
      });
      (Transaction.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await TransactionService.getAllTransactions('user1', {});

      expect(result.transactions).toEqual(['tx1', 'tx2']);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const mockTransaction = {
        _id: 't1',
        type: 'income',
        categoryId: 'cat1',
        amount: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction.findOne as jest.Mock).mockResolvedValue(mockTransaction);
      (Category.findById as jest.Mock).mockResolvedValue({ _id: 'cat1', type: 'income', name: 'Maaş' });

      const result = await TransactionService.updateTransaction(
        't1',
        'user1',
        { amount: 500 }
      );

      expect(mockTransaction.amount).toBe(500);
      expect(result).toBe(mockTransaction);
    });

    it('should return null if transaction not found', async () => {
      (Transaction.findOne as jest.Mock).mockResolvedValue(null);

      const result = await TransactionService.updateTransaction('t1', 'user1', { amount: 500 });

      expect(result).toBeNull();
    });

    it('should throw if category not found when updating type/categoryId', async () => {
      (Transaction.findOne as jest.Mock).mockResolvedValue({ type: 'income', categoryId: 'cat1' });
      (Category.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        TransactionService.updateTransaction('t1', 'user1', { categoryId: 'x' })
      ).rejects.toThrow('Kategori bulunamadı');
    });

    it('should throw if type/category mismatch when updating', async () => {
      (Transaction.findOne as jest.Mock).mockResolvedValue({ type: 'income', categoryId: 'cat1' });
      (Category.findById as jest.Mock).mockResolvedValue({ _id: 'cat1', type: 'expense', name: 'Yemek' });

      await expect(
        TransactionService.updateTransaction('t1', 'user1', { type: 'income', categoryId: 'cat1' })
      ).rejects.toThrow(/Bu kategori sadece gider işlemleri/);
    });
  });

  describe('deleteTransaction', () => {
    it('should return true if deleted', async () => {
      (Transaction.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await TransactionService.deleteTransaction('t1', 'user1');

      expect(result).toBe(true);
    });

    it('should return false if not deleted', async () => {
      (Transaction.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await TransactionService.deleteTransaction('t1', 'user1');

      expect(result).toBe(false);
    });
  });
});
