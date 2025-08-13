/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateCategoryDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Güncellenmiş Kategori"
 *         type:
 *           type: string
 *           enum:
 *             - income
 *             - expense
 *           example: "income"
 *         color:
 *           type: string
 *           example: "#00FF00"
 *         userId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         isDefault:
 *           type: boolean
 *           example: true
 *         description:
 *           type: string
 *           example: "Açıklama güncellendi"
 */
export interface UpdateCategoryDto {
  name?: string;
  type?: "income" | "expense";
  color?: string;
  userId?: object;
  isDefault?: boolean;
  description?: string;
}
