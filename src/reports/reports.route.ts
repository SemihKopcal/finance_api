import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../auth/auth.middleware';
import {
  validateGetReports,
  validateMonthQuery
} from '../middleware/validation.middleware';

const router: Router = Router();

// Tüm reports endpoint'leri için authentication gerekli
router.use(authMiddleware);

/**
 * @route GET /api/reports/summary
 * @desc Genel özet raporu
 * @access Private
 */
router.get('/summary', validateMonthQuery, ReportsController.getSummaryReport);

/**
 * @route GET /api/reports/categories
 * @desc Kategori bazlı analiz raporu
 * @access Private
 */
router.get('/categories', validateMonthQuery, ReportsController.getCategoriesReport);

/**
 * @route GET /api/reports/balance
 * @desc Gelişmiş bakiye raporu
 * @access Private
 */
router.get('/balance', ReportsController.getBalanceReport);

export default router;
