import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from './auth.middleware';
import { registerValidator, loginValidator } from './auth.validator';

const router: Router = Router();
router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);
router.get('/profile', authenticateToken, AuthController.profile);

export default router;
