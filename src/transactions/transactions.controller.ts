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
 *               $ref: '#/components/schemas/Transaction'
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
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!amount || !type || !categoryId || !description || !date) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      const transaction = await TransactionService.createTransaction(
        { amount, type, categoryId, description, date },
        userId
      );
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /transactions:
   *   get:
   *     tags:
   *       - transactions
   *     summary: List all transactions of the authenticated user with filters and pagination
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [income, expense]
   *           example: "expense"
   *         description: Transaction type
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Category ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-08-13"
   *         description: Start date (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2025-08-14"
   *         description: End date (YYYY-MM-DD)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Page size
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *     responses:
   *       200:
   *         description: List of transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total:
   *                   type: integer
   *                   example: 2
   *                 page:
   *                   type: integer
   *                   example: 1
   *                 limit:
   *                   type: integer
   *                   example: 10
   *                 transactions:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Transaction'
   *               example:
   *                 total: 2
   *                 page: 1
   *                 limit: 10
   *                 transactions:
   *                   - _id: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     amount: 250.00
   *                     type: "income"
   *                     categoryId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     userId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     description: "Salary payment"
   *                     date: "2025-08-13T12:00:00.000Z"
   *                   - _id: "64e5b2f2c2a4f2a1b8e5b2f3"
   *                     amount: 100.00
   *                     type: "expense"
   *                     categoryId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     userId: "64e5b2f2c2a4f2a1b8e5b2f2"
   *                     description: "Market alışverişi"
   *                     date: "2025-08-14T09:00:00.000Z"
   */
  static async getAllTransactions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const {
        type,
        category,
        startDate,
        endDate,
        limit = 10,
        page = 1,
      } = req.query;

      const result = await TransactionService.getAllTransactions(userId, {
        type: type as string,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: Number(limit),
        page: Number(page),
      });

      res.status(200).json(result);
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
   *               $ref: '#/components/schemas/Transaction'
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
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Transaction id is required' });
      }
      
      const updateData: UpdateTransactionDto = req.body;
      
      const updatedTransaction = await TransactionService.updateTransaction(
        id,
        userId,
        updateData
      );
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(200).json(updatedTransaction);
    } catch (error) {
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
