import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { authenticateToken } from '../auth/auth.middleware';
import {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateGetTransactions,
  validateTransactionId
} from '../middleware/validation.middleware';

const router: Router = Router();

router.post('/', authenticateToken, validateCreateTransaction, TransactionsController.createTransaction);
router.get('/', authenticateToken, validateGetTransactions, TransactionsController.getAllTransactions);
router.get(
  '/:id',
  authenticateToken,
  validateTransactionId,
  TransactionsController.getTransactionById
);
router.put('/:id', authenticateToken, validateTransactionId, validateUpdateTransaction, TransactionsController.updateTransaction);
router.delete(
  '/:id',
  authenticateToken,
  validateTransactionId,
  TransactionsController.deleteTransaction
);

export default router;
