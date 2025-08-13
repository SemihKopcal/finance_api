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
import { Request, Response, NextFunction } from "express";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryService } from "./categories.service";
import { AuthRequest } from "../auth/auth.middleware"; // veya tanımladığın yere göre

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
      const { name, type, color } = req.body;
      const userId = req.userId as string;
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
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId as string;
      if (!id) {
        return res.status(400).json({ message: "Category id is required" });
      }
      const category = await CategoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      let categoryUserId: string;
      if (category.userId && typeof category.userId === "object" && "_id" in category.userId) {
        categoryUserId = (category.userId as any)._id.toString();
      } else {
        categoryUserId = category.userId.toString();
      }
      if (categoryUserId !== userId) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
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
      if (!id) {
        return res.status(400).json({ message: "Category id is required" });
      }
  const updateData: UpdateCategoryDto = req.body;
      const category = await CategoryService.getCategoryById(id);
      // Sadece kendi kategorisi ise güncelle
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      let categoryUserId: string;
      if (category.userId && typeof category.userId === "object" && "_id" in category.userId) {
        categoryUserId = (category.userId as any)._id.toString();
      } else {
        categoryUserId = category.userId.toString();
      }
      if (categoryUserId !== userId) {
        return res.status(404).json({ message: "Category not found" });
      }
      const updated = await CategoryService.updateCategory(id, updateData);
      res.json(updated);
    } catch (error) {
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
   *       204:
   *         description: Başarılı silme
   */
  static async deleteCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.userId as string;
      if (!id) {
        return res.status(400).json({ message: "Category id is required" });
      }
      const category = await CategoryService.getCategoryById(id);
      // Sadece kendi kategorisi ise sil
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      let categoryUserId: string;
      if (category.userId && typeof category.userId === "object" && "_id" in category.userId) {
        categoryUserId = (category.userId as any)._id.toString();
      } else {
        categoryUserId = category.userId.toString();
      }
      if (categoryUserId !== userId) {
        return res.status(404).json({ message: "Category not found" });
      }
      await CategoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
