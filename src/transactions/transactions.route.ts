import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { authenticateToken } from '../auth/auth.middleware';

const router: Router = Router();

router.post('/', authenticateToken, TransactionsController.createTransaction);
router.get('/', authenticateToken, TransactionsController.getAllTransactions);
router.get(
  '/:id',
  authenticateToken,
  TransactionsController.getTransactionById
);
router.put('/:id', authenticateToken, TransactionsController.updateTransaction);
router.delete(
  '/:id',
  authenticateToken,
  TransactionsController.deleteTransaction
);

export default router;
