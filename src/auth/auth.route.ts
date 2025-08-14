import { Router } from 'express';
import { AuthController } from './auth.controller';
import { 
  validateUserRegistration, 
  validateUserLogin, 
} from '../middleware/validation.middleware';

const router: Router = Router();
router.post('/register', validateUserRegistration, AuthController.register);
router.post('/login', validateUserLogin, AuthController.login);

export default router;
