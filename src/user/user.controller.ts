import { Request, Response, NextFunction } from 'express';
import { UserService } from '../user/user.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "Password123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T12:00:00.000Z"
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 */


/**
 * @openapi
 * /user/profile:
 *   get:
 *     tags:
 *       - user
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
 *                   $ref: '#/components/schemas/User'
 */
export class UserController {
  static async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const user = await UserService.getUserProfile(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /user/profile:
   *   put:
   *     tags:
   *       - user
   *     summary: Kullanıcı profilini günceller
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
   *               $ref: '#/components/schemas/User'
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const updateData: UpdateUserDto = req.body;
      const updatedUser = await UserService.updateUserProfile(userId, updateData);
      if (!updatedUser) return res.status(404).json({ message: 'User not found' });
      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}
