/**
 * @openapi
 * components:
 *   schemas:
 *     CreateTransactionDto:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - categoryId
 *       properties:
 *         amount:
 *           type: number
 *           example: 150.75
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: "expense"
 *         categoryId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         description:
 *           type: string
 *           example: "Market alışverişi"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T12:00:00.000Z"
 */
export interface CreateTransactionDto {
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description?: string;
  date?: string;
}