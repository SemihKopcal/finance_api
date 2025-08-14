/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         name:
 *           type: string
 *           example: "Gıda"
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: "expense"
 *         color:
 *           type: string
 *           example: "#FF5733"
 *         userId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         isDefault:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T12:00:00.000Z"
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './categories.service';
import { AuthRequest } from '../auth/auth.middleware';

export class CategoryController {
  /**
   * @openapi
   * /categories:
   *   post:
   *     tags:
   *       - categories
   *     summary: Yeni kategori oluşturur
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCategoryDto'
   *     responses:
   *       201:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */
  static async createCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, type, color } = req.body as CreateCategoryDto;
      const userId = req.userId as string;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const category = await CategoryService.createCategory(
        name,
        type,
        color,
        userId
      );
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /categories:
   *   get:
   *     tags:
   *       - categories
   *     summary: Tüm kategorileri listeler
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Sayfa numarası
   *     responses:
   *       200:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 page:
   *                   type: integer
   *                 categories:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Category'
   */
  static async getAllCategories(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      const userId = req.userId as string;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const categories = await CategoryService.getAllCategory(
        userId,
        page,
        limit
      );
      res.json({ page, limit, categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /categories/defaults:
   *   get:
   *     tags:
   *       - categories
   *     summary: Tüm default kategorileri listeler
   *     responses:
   *       200:
   *         description: Başarılı
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Category'
   */
  static async getDefaultCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categories = await CategoryService.getDefaultCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /categories/{id}:
   *   get:
   *     tags:
   *       - categories
   *     summary: Kategori detayını getirir
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Kategori ID
   *     responses:
   *       200:
   *         description: Kategori detayı
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */
  static async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Category id is required' });
      }

      let userId: string | undefined;
      const authHeader = req.headers['authorization'] as string | undefined;
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secretkey'
          );
          userId = decoded.userId as string | undefined;
        } catch {
        }
      }

      // find the category
      const category = await CategoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      if (category.isDefault) {
        return res.json(category);
      }

      if (userId && category.userId) {
       
        const categoryUserId =
          typeof category.userId === 'object' && (category.userId as any)._id
            ? (category.userId as any)._id
            : category.userId;

        const userIdStr = String(userId);
        const categoryUserIdStr = String(categoryUserId);

        if (userIdStr === categoryUserIdStr) {
          return res.json(category);
        }
      }
      console.log('Kategori bulunamadı veya erişim yok');
      return res.status(404).json({ message: 'Category not found' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /categories/{id}:
   *   put:
   *     tags:
   *       - categories
   *     summary: Kategoriyi günceller
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Kategori ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCategoryDto'
   *     responses:
   *       200:
   *         description: Güncellenen kategori
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */
  static async updateCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId as string;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ message: 'Category id is required' });
      }

      const updateData: UpdateCategoryDto = req.body;

      // is category exist ?
      const existingAny = await CategoryService.getCategoryById(id);
      if (!existingAny) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      if (existingAny.isDefault) {
        return res.status(400).json({
          message: 'Default kategoriler güncellenemez',
          details:
            'Sistem kategorileri korunmaktadır. Kendi kategorinizi oluşturup güncelleyebilirsiniz.',
        });
      }

      const existingCategory = await CategoryService.getCategoryByIdAndUserId(
        id,
        userId
      );
      if (!existingCategory) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const sanitizedUpdateData: UpdateCategoryDto = { ...updateData };
      if ((sanitizedUpdateData as any).isDefault !== undefined)
        delete (sanitizedUpdateData as any).isDefault;
      if ((sanitizedUpdateData as any).userId !== undefined)
        delete (sanitizedUpdateData as any).userId;

      const updated = await CategoryService.updateCategory(
        id,
        sanitizedUpdateData
      );
      res.json(updated);
    } catch (error: any) {
      if (error.message === 'Default kategoriler silinemez') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DEFAULT_CATEGORY_DELETE_ERROR',
            message: 'Default kategoriler silinemez',
            details:
              'Sistem kategorileri korunmaktadır. Kendi kategorinizi oluşturup silebilirsiniz.',
          },
        });
      }
      next(error);
    }
  }

  /**
   * @openapi
   * /categories/{id}:
   *   delete:
   *     tags:
   *       - categories
   *     summary: Kategoriyi siler
   *     description: Kategori silindiğinde ona ait tüm işlemler de silinir. Default kategoriler silinemez.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Kategori ID
   *     responses:
   *       200:
   *         description: Kategori ve ona ait işlemler başarıyla silindi
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Kategori ve ona ait tüm işlemler başarıyla silindi"
   *                 data:
   *                   type: object
   *                   properties:
   *                     deletedCategoryId:
   *                       type: string
   *                       example: "64e5b2f2c2a4f2a1b8e5b2f2"
   *       400:
   *         description: Default kategori silme hatası
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: "DEFAULT_CATEGORY_DELETE_ERROR"
   *                     message:
   *                       type: string
   *                       example: "Default kategoriler silinemez"
   *                     details:
   *                       type: string
   *                       example: "Sistem kategorileri korunmaktadır. Kendi kategorinizi oluşturup silebilirsiniz."
   *       401:
   *         description: Yetkisiz erişim
   *       403:
   *         description: Kategoriye erişim yok
   *       404:
   *         description: Kategori bulunamadı
   */
  static async deleteCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId as string;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ message: 'Category id is required' });
      }

      const existingAny = await CategoryService.getCategoryById(id);
      if (!existingAny) {
        return res.status(404).json({ message: 'Category not found' });
      }
      if (existingAny.isDefault) {
        return res
          .status(400)
          .json({ message: 'Default kategoriler silinemez' });
      }
      const existingCategory = await CategoryService.getCategoryByIdAndUserId(
        id,
        userId
      );
      if (!existingCategory) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const deleted = await CategoryService.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Kategori bulunamadı',
            details: 'Belirtilen ID ile kategori bulunamadı',
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Kategori ve ona ait tüm işlemler başarıyla silindi',
        data: {
          deletedCategoryId: id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
