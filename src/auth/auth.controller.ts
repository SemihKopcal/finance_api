import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

/**
 * @openapi
 * /auth/profile:
 *   put:
 *     tags:
 *       - auth
 *     summary: Kullanıcı kendi profilini günceller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
*           schema:
*             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Güncellenen kullanıcı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
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
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "johndoe@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class AuthController {

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
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: Başarılı kayıt
   *         content:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: Profile updated successfully
   *                   type: string
   *                 userId:
   *                   type: string
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      res.status(201).json({ message: "User registered", userId: user._id });
    } catch (error) {
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
   *                 example: "password123"
   *     responses:
   *       200:
   *         description: Başarılı giriş
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
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
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "secretkey",
        {
          expiresIn: "1d",
        }
      );

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /auth/profile:
   *   get:
   *     tags:
   *       - auth
   *     summary: Kullanıcı profilini getirir
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Kullanıcı profili
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   */
  static async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const user = await AuthService.getUserProfile(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

    /**
   * @openapi
   * /auth/profile:
   *   put:
   *     tags:
   *       - auth
   *     summary: Kullanıcı kendi profilini günceller
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Güncellenen kullanıcı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
  const updateData: UpdateUserDto = req.body;
      const updatedUser = await AuthService.updateUserProfile(
        userId,
        updateData
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}
