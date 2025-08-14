import {
  Transaction,
  ITransaction,
} from '../transactions/entities/transaction.model';
import { Category, ICategory } from '../categories/entities/categories.model';
import mongoose from 'mongoose';

export interface SummaryReport {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  month: string;
}

export interface CategoryReport {
  income: {
    categories: Array<{
      categoryId: string;
      categoryName: string;
      totalAmount: number;
      transactionCount: number;
      percentage: number;
    }>;
    totalIncome: number;
    totalTransactions: number;
  };
  expense: {
    categories: Array<{
      categoryId: string;
      categoryName: string;
      totalAmount: number;
      transactionCount: number;
      percentage: number;
    }>;
    totalExpense: number;
    totalTransactions: number;
  };
  period: {
    month?: string;
    reportDate: string;
  };
  net: number;
}

export interface BalanceReport {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  yearlyIncome: number;
  yearlyExpense: number;
  yearlyNet: number;
  allTimeIncome: number;
  allTimeExpense: number;
  allTimeNet: number;
  reportDate: string;
  period: {
    currentMonth: string;
    currentYear: number;
  };
}

export class ReportsService {
  
  static async getSummaryReport(
    userId: string,
    month: string
  ): Promise<SummaryReport> {
    const startDate = new Date(month + '-01');
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const [incomeResult, expenseResult, totalCount] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'income',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      }),
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;
    const netAmount = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netAmount,
      transactionCount: totalCount,
      month,
    };
  }

  static async getCategoriesReport(
    userId: string,
    month?: string
  ): Promise<CategoryReport> {
    let dateFilter = {};
    let periodInfo = {};

    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
      periodInfo = { month };
    }

    // Gelir kategorileri
    const incomeCategories = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'income',
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            categoryName: '$category.name',
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id.categoryId',
          categoryName: '$_id.categoryName',
          totalAmount: 1,
          transactionCount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Gider kategorileri
    const expenseCategories = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            categoryName: '$category.name',
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id.categoryId',
          categoryName: '$_id.categoryName',
          totalAmount: 1,
          transactionCount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Toplam değerleri hesapla
    const totalIncome = incomeCategories.reduce(
      (sum, cat) => sum + cat.totalAmount,
      0
    );
    const totalExpense = expenseCategories.reduce(
      (sum, cat) => sum + cat.totalAmount,
      0
    );
    const totalIncomeTransactions = incomeCategories.reduce(
      (sum, cat) => sum + cat.transactionCount,
      0
    );
    const totalExpenseTransactions = expenseCategories.reduce(
      (sum, cat) => sum + cat.transactionCount,
      0
    );

    // Yüzde hesaplamaları
    const incomeWithPercentage = incomeCategories.map((cat) => ({
      ...cat,
      percentage:
        totalIncome > 0
          ? Math.round((cat.totalAmount / totalIncome) * 100 * 100) / 100
          : 0,
    }));

    const expenseWithPercentage = expenseCategories.map((cat) => ({
      ...cat,
      percentage:
        totalExpense > 0
          ? Math.round((cat.totalAmount / totalExpense) * 100 * 100) / 100
          : 0,
    }));

    return {
      income: {
        categories: incomeWithPercentage,
        totalIncome,
        totalTransactions: totalIncomeTransactions,
      },
      expense: {
        categories: expenseWithPercentage,
        totalExpense,
        totalTransactions: totalExpenseTransactions,
      },
      period: {
        ...periodInfo,
        reportDate: new Date().toISOString(),
      },
      net: totalIncome - totalExpense,
    };
  }

  static async getBalanceReport(userId: string): Promise<BalanceReport> {
    const now = new Date();
    const currentMonth =
      now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();

    // Mevcut ay başlangıcı ve bitişi
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Yıl başlangıcı ve bitişi
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [
      monthlyIncome,
      monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      allTimeIncome,
      allTimeExpense,
    ] = await Promise.all([
      // Aylık gelir
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'income',
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      // Aylık gider
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      // Yıllık gelir
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'income',
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      // Yıllık gider
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      // Tüm zamanlar gelir
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'income',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      // Tüm zamanlar gider
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    // Değerleri al
    const monthlyIncomeAmount = monthlyIncome[0]?.total || 0;
    const monthlyExpenseAmount = monthlyExpense[0]?.total || 0;
    const yearlyIncomeAmount = yearlyIncome[0]?.total || 0;
    const yearlyExpenseAmount = yearlyExpense[0]?.total || 0;
    const allTimeIncomeAmount = allTimeIncome[0]?.total || 0;
    const allTimeExpenseAmount = allTimeExpense[0]?.total || 0;

    // Net değerleri hesapla
    const monthlyNet = monthlyIncomeAmount - monthlyExpenseAmount;
    const yearlyNet = yearlyIncomeAmount - yearlyExpenseAmount;
    const allTimeNet = allTimeIncomeAmount - allTimeExpenseAmount;

    return {
      currentBalance: allTimeNet,
      monthlyIncome: monthlyIncomeAmount,
      monthlyExpense: monthlyExpenseAmount,
      monthlyNet,
      yearlyIncome: yearlyIncomeAmount,
      yearlyExpense: yearlyExpenseAmount,
      yearlyNet,
      allTimeIncome: allTimeIncomeAmount,
      allTimeExpense: allTimeExpenseAmount,
      allTimeNet,
      reportDate: now.toISOString(),
      period: {
        currentMonth,
        currentYear,
      },
    };
  }
}
