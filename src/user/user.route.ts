import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { 
  validateUserUpdate 
} from '../middleware/validation.middleware';

const router: Router = Router();

router.get('/profile', authenticateToken, UserController.profile);
router.put('/profile', authenticateToken, validateUserUpdate, UserController.updateProfile);

export default router;
