import { ReportsService } from '../reports.service';
import { Transaction } from '../../transactions/entities/transaction.model';
import mongoose from 'mongoose';

jest.mock('../../transactions/entities/transaction.model', () => ({
  Transaction: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('ReportsService', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaryReport', () => {
    it('should return correct summary values', async () => {
      (Transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce([{ total: 500 }]) // income
        .mockResolvedValueOnce([{ total: 300 }]); // expense

      (Transaction.countDocuments as jest.Mock).mockResolvedValueOnce(5);

      const result = await ReportsService.getSummaryReport(userId, '2025-08');

      expect(result).toEqual({
        totalIncome: 500,
        totalExpense: 300,
        netAmount: 200,
        transactionCount: 5,
        month: '2025-08',
      });
    });

    it('should handle no income or expense results', async () => {
      (Transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce([]) // no income
        .mockResolvedValueOnce([]); // no expense

      (Transaction.countDocuments as jest.Mock).mockResolvedValueOnce(0);

      const result = await ReportsService.getSummaryReport(userId, '2025-08');
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.netAmount).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  describe('getCategoriesReport', () => {
    it('should calculate percentages and totals', async () => {
      const incomeCategories = [
        { categoryId: '1', categoryName: 'Salary', totalAmount: 1000, transactionCount: 2 },
        { categoryId: '2', categoryName: 'Bonus', totalAmount: 500, transactionCount: 1 },
      ];

      const expenseCategories = [
        { categoryId: '3', categoryName: 'Food', totalAmount: 300, transactionCount: 3 },
      ];

      (Transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce(incomeCategories) // income categories
        .mockResolvedValueOnce(expenseCategories); // expense categories

      const result = await ReportsService.getCategoriesReport(userId, '2025-08');

      expect(result.income.totalIncome).toBe(1500);
      expect(result.expense.totalExpense).toBe(300);
      expect(result.income.categories[0]!.percentage).toBeCloseTo(66.67, 2);
      expect(result.expense.categories[0]!.percentage).toBe(100);
      expect(result.net).toBe(1200);
    });

    it('should handle empty categories', async () => {
      (Transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce([]) // income
        .mockResolvedValueOnce([]); // expense

      const result = await ReportsService.getCategoriesReport(userId);
      expect(result.income.totalIncome).toBe(0);
      expect(result.expense.totalExpense).toBe(0);
      expect(result.net).toBe(0);
    });
  });

  describe('getBalanceReport', () => {
    it('should return correct balance report', async () => {
      (Transaction.aggregate as jest.Mock)
        // monthlyIncome
        .mockResolvedValueOnce([{ total: 2000 }])
        // monthlyExpense
        .mockResolvedValueOnce([{ total: 500 }])
        // yearlyIncome
        .mockResolvedValueOnce([{ total: 24000 }])
        // yearlyExpense
        .mockResolvedValueOnce([{ total: 6000 }])
        // allTimeIncome
        .mockResolvedValueOnce([{ total: 50000 }])
        // allTimeExpense
        .mockResolvedValueOnce([{ total: 20000 }]);

      const result = await ReportsService.getBalanceReport(userId);

      expect(result.monthlyNet).toBe(1500);
      expect(result.yearlyNet).toBe(18000);
      expect(result.allTimeNet).toBe(30000);
      expect(result.currentBalance).toBe(30000);
    });

    it('should handle missing aggregation results', async () => {
      (Transaction.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await ReportsService.getBalanceReport(userId);

      expect(result.monthlyIncome).toBe(0);
      expect(result.monthlyExpense).toBe(0);
    });
  });
});
