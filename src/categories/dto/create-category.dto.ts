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
 *         userId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
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
  userId: string;
  isDefault?: boolean;
  description?: string;
}
