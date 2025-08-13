/**
 * @openapi
 * components:
 *   schemas:
 *     CreateCategoryDto:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - color
 *         - userId
 *       properties:
 *         name:
 *           type: string
 *           example: "Gıda"
 *         type:
 *           type: string
 *           enum:
 *             - income
 *             - expense
 *           example: "expense"
 *         color:
 *           type: string
 *           example: "#FF5733"
 *         isDefault:
 *           type: boolean
 *           example: false
 *         description:
 *           type: string
 *           example: "Market ve restoran harcamaları"
 */
export interface CreateCategoryDto {
  name: string;
  type: "income" | "expense";
  color: string;
  isDefault?: boolean;
  description?: string;
}
