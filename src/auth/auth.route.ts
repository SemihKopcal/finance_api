import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from './auth.middleware';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateUserUpdate 
} from '../middleware/validation.middleware';

const router: Router = Router();
router.post('/register', validateUserRegistration, AuthController.register);
router.post('/login', validateUserLogin, AuthController.login);
router.get('/profile', authenticateToken, AuthController.profile);
router.put('/profile', authenticateToken, validateUserUpdate, AuthController.updateProfile);

export default router;
