import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - auth
 *     summary: Kullanıcı kaydı
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Başarılı kayıt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered
 *                 userId:
 *                   type: string
 */
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      res.status(201).json({ message: 'User registered', userId: user._id });
    } catch (error: any) {
      if (error.code === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: error.message,
            details: 'Bu email adresi ile daha önce kayıt yapılmış.',
          },
        });
      }
      next(error);
    }
  }

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags:
   *       - auth
   *     summary: Kullanıcı girişi
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "johndoe@example.com"
   *               password:
   *                 type: string
   *                 example: "Password123"
   *     responses:
   *       200:
   *         description: Başarılı giriş
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await AuthService.validateUser(email, password);
      if (!user)
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Geçersiz email veya şifre' },
        });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1d' }
      );

      res.json({ success: true, message: 'Giriş başarılı', token });
    } catch (error) {
      next(error);
    }
  }
}
