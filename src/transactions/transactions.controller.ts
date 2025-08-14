import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { UpdateTransactionDto } from './dto/update.transaction.dto';
/**
 * @openapi
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         amount:
 *           type: number
 *           example: 150.75
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: "expense"
 *         categoryId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         userId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         description:
 *           type: string
 *           example: "Market alışverişi"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T12:00:00.000Z"
 */

  /**
   * @openapi
   * /transactions:
   *   post:
   *     tags:
   *       - transactions
   *     summary: Create a new transaction
   *     description: Transaction tipi ile kategori tipi uyumlu olmalıdır (income/expense)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTransactionDto'
   *     responses:
   *       201:
   *         description: Transaction created successfully
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
   *                   example: "İşlem başarıyla oluşturuldu"
   *                 data:
   *                   $ref: '#/components/schemas/Transaction'
   *       400:
   *         description: Validation error or category type mismatch
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: "CATEGORY_TYPE_MISMATCH"
   *                     message:
   *                       type: string
   *                       example: "Kategori ve işlem tipi uyumsuzluğu"
   *                     details:
   *                       type: string
   *                       example: "Bu kategori sadece gelir işlemleri için kullanılabilir. Seçilen kategori: Maaş (Gelir)"
   *       401:
   *         description: Unauthorized
   */
export class TransactionsController {
  static async createTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { amount, type, categoryId, description, date } =
        req.body as CreateTransactionDto;
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
      if (!amount || !type || !categoryId || !description || !date) {
        return res.status(400).json({ 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validasyon hatası',
            details: 'Tüm alanlar zorunludur'
          }
        });
      }
      
      const transaction = await TransactionService.createTransaction(
        { amount, type, categoryId, description, date },
        userId
      );
      res.status(201).json({
        success: true,
        message: 'İşlem başarıyla oluşturuldu',
        data: transaction
      });
    } catch (error: any) {
      if (error.message.includes('Bu kategori sadece') || error.message.includes('Kategori bulunamadı')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_TYPE_MISMATCH',
            message: 'Kategori ve işlem tipi uyumsuzluğu',
            details: error.message
          }
        });
      }
      next(error);
    }
  }

  /**
   * @openapi
   * /transactions:
   *   get:
   *     tags:
   *       - transactions
   *     summary: İşlemleri listele (Protected)
   *     description: |
   *       Gelişmiş filtreleme ve sayfalama ile işlemleri listeler
   *       
   *       **Query Parametreleri:**
   *       - `type`: income/expense (işlem tipi)
   *       - `category`: categoryId (kategori ID'si)
   *       - `startDate`: YYYY-MM-DD (başlangıç tarihi)
   *       - `endDate`: YYYY-MM-DD (bitiş tarihi)
   *       - `minAmount`: minimum tutar
   *       - `maxAmount`: maksimum tutar
   *       - `description`: açıklama arama (case-insensitive)
   *       - `sortBy`: date/amount/type/description (sıralama alanı)
   *       - `sortOrder`: asc/desc (sıralama yönü)
   *       - `limit`: sayfa başına öğe sayısı (1-100)
   *       - `page`: sayfa numarası
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [income, expense]
   *           example: "expense"
   *         description: Filter by transaction type
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *         description: Filter by category ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-08-01"
   *         description: Start date filter (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-08-31"
   *         description: End date filter (YYYY-MM-DD)
   *       - in: query
   *         name: minAmount
   *         schema:
   *           type: number
   *           example: 100
   *         description: Minimum amount filter
   *       - in: query
   *         name: maxAmount
   *         schema:
   *           type: number
   *           example: 1000
   *         description: Maximum amount filter
   *       - in: query
   *         name: description
   *         schema:
   *           type: string
   *           example: "market"
   *         description: Açıklama metninde arama yapar (büyük/küçük harf duyarsız)
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [date, amount, type, description]
   *           default: "date"
   *           example: "amount"
   *         description: Sort field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: "desc"
   *           example: "desc"
   *         description: Sort order
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *           example: 20
   *         description: Number of items per page (1-100)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *           example: 1
   *         description: Page number
   *     responses:
   *       200:
   *         description: Successfully retrieved transactions
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
   *                   example: "İşlemler başarıyla getirildi"
   *                 data:
   *                   type: object
   *                   properties:
   *                     transactions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           _id:
   *                             type: string
   *                             example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                           amount:
   *                             type: number
   *                             example: 250.00
   *                           type:
   *                             type: string
   *                             enum: [income, expense]
   *                             example: "income"
   *                           categoryId:
   *                             type: object
   *                             properties:
   *                               _id:
   *                                 type: string
   *                                 example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                               name:
   *                                 type: string
   *                                 example: "Maaş"
   *                               type:
   *                                 type: string
   *                                 example: "income"
   *                               color:
   *                                 type: string
   *                                 example: "#4CAF50"
   *                           userId:
   *                             type: string
   *                             example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                           description:
   *                             type: string
   *                             example: "Salary payment"
   *                           date:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-08-13T12:00:00.000Z"
   *                     total:
   *                       type: integer
   *                       example: 45
   *                       description: Total number of transactions
   *                     page:
   *                       type: integer
   *                       example: 1
   *                       description: Current page number
   *                     limit:
   *                       type: integer
   *                       example: 10
   *                       description: Items per page
   *                     totalPages:
   *                       type: integer
   *                       example: 5
   *                       description: Total number of pages
   *                     hasNext:
   *                       type: boolean
   *                       example: true
   *                       description: Whether there is a next page
   *                     hasPrev:
   *                       type: boolean
   *                       example: false
   *                       description: Whether there is a previous page
   *                     filters:
   *                       type: object
   *                       properties:
   *                         type:
   *                           type: string
   *                           example: "expense"
   *                         category:
   *                           type: string
   *                           example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                         startDate:
   *                           type: string
   *                           example: "2025-08-01"
   *                         endDate:
   *                           type: string
   *                           example: "2025-08-31"
   *                         minAmount:
   *                           type: number
   *                           example: 100
   *                         maxAmount:
   *                           type: number
   *                           example: 1000
   *                         description:
   *                           type: string
   *                           example: "market"
   *                         sortBy:
   *                           type: string
   *                           example: "date"
   *                         sortOrder:
   *                           type: string
   *                           example: "desc"
   *             example:
   *               success: true
   *               message: "İşlemler başarıyla getirildi"
   *               data:
   *                 transactions:
   *                   - _id: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     amount: 250.00
   *                     type: "income"
   *                     categoryId:
   *                       _id: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                       name: "Maaş"
   *                       type: "income"
   *                       color: "#4CAF50"
   *                     userId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     description: "Salary payment"
   *                     date: "2025-08-13T12:00:00.000Z"
   *                   - _id: "64e5b2f2c2a4f2a1b8e5b2f3"
   *                     amount: 100.00
   *                     type: "expense"
   *                     categoryId:
   *                       _id: "64e5b2f2c2a4f2a1b8e5b2f3"
   *                       name: "Yemek"
   *                       type: "expense"
   *                       color: "#F44336"
   *                     userId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     description: "Market alışverişi"
   *                     date: "2025-08-14T09:00:00.000Z"
   *                 total: 45
   *                 page: 1
   *                 limit: 10
   *                 totalPages: 5
   *                 hasNext: true
   *                 hasPrev: false
   *                 filters:
   *                   type: "expense"
   *                   category: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                   startDate: "2025-08-01"
   *                   endDate: "2025-08-31"
   *                   minAmount: 100
   *                   maxAmount: 1000
   *                   description: "market"
   *                   sortBy: "date"
   *                   sortOrder: "desc"
   *       400:
   *         description: Bad request - Invalid parameters
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getAllTransactions(
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
        page = 1,
      } = req.query;

      const filters: any = {
        limit: Number(limit),
        page: Number(page),
      };

      if (type) filters.type = type as string;
      if (category) filters.category = category as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (minAmount) filters.minAmount = Number(minAmount);
      if (maxAmount) filters.maxAmount = Number(maxAmount);
      if (description) filters.description = description as string;
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      const result = await TransactionService.getAllTransactions(userId, filters);

      res.status(200).json({
        success: true,
        message: 'İşlemler başarıyla getirildi',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /transactions/{id}:
   *   get:
   *     tags:
   *       - transactions
   *     summary: Get a transaction by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Transaction found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transaction'
   */
  static async getTransactionById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Transaction id is required' });
      }
      
      const transaction = await TransactionService.getTransactionById(id, userId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  }

     /**
    * @openapi
    * /transactions/{id}:
    *   put:
    *     tags:
    *       - transactions
    *     summary: Update a transaction by ID
    *     description: Transaction tipi ile kategori tipi uyumlu olmalıdır (income/expense)
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: id
    *         required: true
    *         schema:
    *           type: string
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/UpdateTransactionDto'
    *     responses:
    *       200:
    *         description: Transaction updated successfully
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
    *                   example: "İşlem başarıyla güncellendi"
    *                 data:
    *                   $ref: '#/components/schemas/Transaction'
    *       400:
    *         description: Validation error or category type mismatch
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 error:
    *                   type: object
    *                   properties:
    *                     code:
    *                       type: string
    *                       example: "CATEGORY_TYPE_MISMATCH"
    *                     message:
    *                       type: string
    *                       example: "Kategori ve işlem tipi uyumsuzluğu"
    *                     details:
    *                       type: string
    *                       example: "Bu kategori sadece gelir işlemleri için kullanılabilir. Seçilen kategori: Maaş (Gelir)"
    *       404:
    *         description: Transaction not found
    *       401:
    *         description: Unauthorized
    */
  static async updateTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
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
      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validasyon hatası',
            details: 'İşlem ID\'si zorunludur'
          }
        });
      }
      
      const updateData: UpdateTransactionDto = req.body;
      
      const updatedTransaction = await TransactionService.updateTransaction(
        id,
        userId,
        updateData
      );
      
      if (!updatedTransaction) {
        return res.status(404).json({ 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'İşlem bulunamadı',
            details: 'Belirtilen ID ile işlem bulunamadı'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'İşlem başarıyla güncellendi',
        data: updatedTransaction
      });
    } catch (error: any) {
      if (error.message.includes('Bu kategori sadece') || error.message.includes('Kategori bulunamadı')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_TYPE_MISMATCH',
            message: 'Kategori ve işlem tipi uyumsuzluğu',
            details: error.message
          }
        });
      }
      next(error);
    }
  }

  /**
   * @openapi
   * /transactions/{id}:
   *   delete:
   *     tags:
   *       - transactions
   *     summary: Delete a transaction by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Transaction deleted successfully
   *       404:
   *         description: Transaction not found
   */
  static async deleteTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Transaction id is required' });
      }
      
      const deleted = await TransactionService.deleteTransaction(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
