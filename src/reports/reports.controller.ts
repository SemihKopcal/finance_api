import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { ReportsService } from './reports.service';

export class ReportsController {
  /**
   * @openapi
   * /reports/summary:
   *   get:
   *     tags:
   *       - reports
   *     summary: Genel özet raporu
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: string
   *           pattern: '^[0-9]{4}-[0-9]{2}$'
   *           example: "2025-01"
   *         description: Ay formatı (YYYY-MM)
   *         required: false
   *     responses:
   *       200:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalIncome:
   *                   type: number
   *                   example: 5000
   *                 totalExpense:
   *                   type: number
   *                   example: 3000
   *                 netAmount:
   *                   type: number
   *                   example: 2000
   *                 transactionCount:
   *                   type: number
   *                   example: 25
   *                 month:
   *                   type: string
   *                   example: "2025-01"
   *       400:
   *         description: Geçersiz ay formatı
   *       401:
   *         description: Yetkisiz erişim
   */
  static async getSummaryReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Yetkisiz erişim',
            details: 'Bu işlem için giriş yapmanız gerekiyor.'
          }
        });
      }

      let month = req.query.month as string;
      
      if (!month) {
        const now = new Date();
        month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      } else {
        const monthMatch = month.match(/(\d{4})[-\/.](\d{1,2})/);
        if (monthMatch && monthMatch[1] && monthMatch[2]) {
          const year = monthMatch[1];
          const monthNum = monthMatch[2].padStart(2, '0');
          month = `${year}-${monthNum}`;
        }
      }

      const summary = await ReportsService.getSummaryReport(userId, month);
      res.json({
        success: true,
        message: 'Özet raporu başarıyla oluşturuldu',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /reports/categories:
   *   get:
   *     tags:
   *       - reports
   *     summary: Gelişmiş kategori bazlı analiz raporu
   *     description: Gelir ve gider kategorilerini ayrı ayrı analiz eder
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: string
   *           pattern: '^[0-9]{4}-[0-9]{2}$'
   *           example: "2025-01"
   *         description: Ay formatı (YYYY-MM) - Opsiyonel
   *         required: false
   *     responses:
   *       200:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Kategori raporu başarıyla oluşturuldu"
   *                 data:
   *                   type: object
   *                   properties:
   *                     income:
   *                       type: object
   *                       properties:
   *                         categories:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               categoryId:
   *                                 type: string
   *                                 example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                               categoryName:
   *                                 type: string
   *                                 example: "Maaş"
   *                               totalAmount:
   *                                 type: number
   *                                 example: 5000
   *                               transactionCount:
   *                                 type: number
   *                                 example: 1
   *                               percentage:
   *                                 type: number
   *                                 example: 80.5
   *                         totalIncome:
   *                           type: number
   *                           example: 6200
   *                         totalTransactions:
   *                           type: number
   *                           example: 3
   *                     expense:
   *                       type: object
   *                       properties:
   *                         categories:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               categoryId:
   *                                 type: string
   *                                 example: "64e5b2f2c2a4f2a1b8e5b2f3"
   *                               categoryName:
   *                                 type: string
   *                                 example: "Yemek"
   *                               totalAmount:
   *                                 type: number
   *                                 example: 1500.75
   *                               transactionCount:
   *                                 type: number
   *                                 example: 15
   *                               percentage:
   *                                 type: number
   *                                 example: 45.2
   *                         totalExpense:
   *                           type: number
   *                           example: 3320.50
   *                         totalTransactions:
   *                           type: number
   *                           example: 25
   *                     period:
   *                       type: object
   *                       properties:
   *                         month:
   *                           type: string
   *                           example: "2025-01"
   *                         reportDate:
   *                           type: string
   *                           example: "2025-01-15T10:30:00.000Z"
   *       401:
   *         description: Yetkisiz erişim
   *       500:
   *         description: Sunucu hatası
   */
  static async getCategoriesReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Yetkisiz erişim',
            details: 'Bu işlem için giriş yapmanız gerekiyor.'
          }
        });
      }

      let month = req.query.month as string;
      
      if (!month) {
        const now = new Date();
        month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      } else {
        const monthMatch = month.match(/(\d{4})[-\/.](\d{1,2})/);
        if (monthMatch && monthMatch[1] && monthMatch[2]) {
          const year = monthMatch[1];
          const monthNum = monthMatch[2].padStart(2, '0');
          month = `${year}-${monthNum}`;
        }
      }

      const categoriesReport = await ReportsService.getCategoriesReport(userId, month);
      res.json({
        success: true,
        message: 'Kategori raporu başarıyla oluşturuldu',
        data: categoriesReport
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /reports/balance:
   *   get:
   *     tags:
   *       - reports
   *     summary: Gelişmiş bakiye raporu
   *     description: Kullanıcının aylık, yıllık ve tüm zamanlar bakiye bilgilerini döndürür
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 currentBalance:
   *                   type: number
   *                   example: 15000
   *                   description: Tüm zamanlar toplam bakiye
   *                 monthlyIncome:
   *                   type: number
   *                   example: 5000
   *                   description: Mevcut ay gelir
   *                 monthlyExpense:
   *                   type: number
   *                   example: 3000
   *                   description: Mevcut ay gider
   *                 monthlyNet:
   *                   type: number
   *                   example: 2000
   *                   description: Mevcut ay net gelir/gider
   *                 yearlyIncome:
   *                   type: number
   *                   example: 60000
   *                   description: Mevcut yıl gelir
   *                 yearlyExpense:
   *                   type: number
   *                   example: 45000
   *                   description: Mevcut yıl gider
   *                 yearlyNet:
   *                   type: number
   *                   example: 15000
   *                   description: Mevcut yıl net gelir/gider
   *                 allTimeIncome:
   *                   type: number
   *                   example: 120000
   *                   description: Tüm zamanlar toplam gelir
   *                 allTimeExpense:
   *                   type: number
   *                   example: 105000
   *                   description: Tüm zamanlar toplam gider
   *                 allTimeNet:
   *                   type: number
   *                   example: 15000
   *                   description: Tüm zamanlar net gelir/gider
   *                 reportDate:
   *                   type: string
   *                   example: "2025-01-15T10:30:00.000Z"
   *                   description: Rapor oluşturulma tarihi
   *                 period:
   *                   type: object
   *                   properties:
   *                     currentMonth:
   *                       type: string
   *                       example: "2025-01"
   *                       description: Mevcut ay (YYYY-MM formatında)
   *                     currentYear:
   *                       type: number
   *                       example: 2025
   *                       description: Mevcut yıl
   *       401:
   *         description: Yetkisiz erişim
   *       500:
   *         description: Sunucu hatası
   */
  static async getBalanceReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Yetkisiz erişim',
            details: 'Bu işlem için giriş yapmanız gerekiyor.'
          }
        });
      }

      const balanceReport = await ReportsService.getBalanceReport(userId);
      
      res.json({
        success: true,
        message: 'Bakiye raporu başarıyla oluşturuldu',
        data: balanceReport
      });
    } catch (error) {
      next(error);
    }
  }
}
