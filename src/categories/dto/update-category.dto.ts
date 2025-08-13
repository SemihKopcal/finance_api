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
  isDefault?: boolean;
  description?: string;
}
